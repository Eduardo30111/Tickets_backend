import uuid
from pathlib import Path

from django.contrib.auth.models import User
from django.http import FileResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario, Equipo, Ticket
from .pdf_generator import generar_pdf_ticket
from .serializers import (
    EquipoSerializer,
    SolicitarTicketSerializer,
    TicketSerializer,
    UsuarioSerializer,
)
from .utils import enviar_correo_ticket


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param == 'pending':
            qs = qs.filter(estado__in=['ABIERTO', 'EN_PROCESO'])
        elif status_param == 'completed':
            qs = qs.filter(estado='CERRADO')
        return qs.order_by('-fecha')

    def perform_create(self, serializer):
        ticket = serializer.save()
        
        # Generar PDF del ticket
        archivo_pdf = generar_pdf_ticket(ticket)
        
        # Enviar correo con PDF adjunto
        enviar_correo_ticket(
            asunto='📩 Nuevo ticket creado',
            mensaje=(
                f'Se ha creado un nuevo ticket\n\n'
                f'ID: {ticket.id}\n'
                f'Usuario: {ticket.usuario.nombre}\n'
                f'Equipo: {ticket.equipo.tipo} - {ticket.equipo.serie}\n'
                f'Estado: {ticket.estado}\n'
                f'Descripción:\n{ticket.descripcion}\n\n'
                f'Adjunto encontrarás el PDF con los detalles del ticket.'
            ),
            destinatarios=[ticket.usuario.correo],
            archivo_adjunto=archivo_pdf
        )

    def perform_update(self, serializer):
        ticket = serializer.save()

        # Atendido_por: usar body si viene, si no el usuario autenticado
        try:
            nombre = (self.request.data.get('atendido_por') or '').strip()
            if not nombre and getattr(self.request, 'user', None):
                nombre = self.request.user.get_full_name() or self.request.user.username or ''
            if nombre:
                ticket.atendido_por = nombre
                ticket.save(update_fields=['atendido_por'])
        except Exception:
            pass

        if ticket.estado == 'CERRADO':
            # Generar PDF y enviar correo con el documento adjunto
            archivo_pdf = generar_pdf_ticket(ticket)
            
            enviar_correo_ticket(
                asunto='✅ Ticket cerrado',
                mensaje=(
                    f'El ticket #{ticket.id} ha sido cerrado.\n\n'
                    f'Usuario: {ticket.usuario.nombre}\n'
                    f'Equipo: {ticket.equipo.tipo} - {ticket.equipo.serie}\n'
                    f'Atendido por: {getattr(ticket, "atendido_por", "")}\n'
                    f'Estado: {ticket.estado}\n'
                    f'Descripción:\n{ticket.descripcion}\n\n'
                    f'Adjunto encontrarás el PDF con los detalles finales del ticket.'
                ),
                destinatarios=[ticket.usuario.correo],
                archivo_adjunto=archivo_pdf
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def pdf(self, request, pk=None):
        """Descargar PDF del ticket"""
        try:
            ticket = self.get_object()
            
            # Generar PDF si no existe
            ruta_pdf = generar_pdf_ticket(ticket)
            
            if Path(ruta_pdf).exists():
                return FileResponse(
                    open(ruta_pdf, 'rb'),
                    as_attachment=True,
                    filename=f'ticket_{ticket.id}.pdf'
                )
            else:
                return Response(
                    {'error': 'PDF no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    """Estadísticas para el dashboard técnico."""
    try:
        from django.db.models import Count

        pending = Ticket.objects.filter(estado='ABIERTO').count()
        in_process = Ticket.objects.filter(estado='EN_PROCESO').count()
        closed = Ticket.objects.filter(estado='CERRADO').count()
        total = Ticket.objects.count()

        tech_qs = User.objects.filter(is_staff=True)
        technicians = [u.get_full_name() or u.username for u in tech_qs]

        # Rendimiento por técnico (atendido_por)
        per_tech = (
            Ticket.objects.filter(estado='CERRADO')
            .exclude(atendido_por__isnull=True)
            .exclude(atendido_por='')
            .values('atendido_por')
            .annotate(count=Count('id'))
        )
        technician_performance = {r['atendido_por']: r['count'] for r in per_tech}

        # Tipos de falla (tipo_dano)
        per_dano = (
            Ticket.objects.exclude(tipo_dano__isnull=True)
            .exclude(tipo_dano='')
            .values('tipo_dano')
            .annotate(count=Count('id'))
        )
        failure_types = {r['tipo_dano']: r['count'] for r in per_dano}

        # Frecuencia por equipo (tipo + serie agrupado por usuario/equipo sería más fino; simplificamos por tipo)
        per_equipo = (
            Ticket.objects.values('equipo__tipo')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        equipment_frequency = [
            {'equipmentType': r['equipo__tipo'] or 'N/A', 'count': r['count']}
            for r in per_equipo
        ]

        return Response({
            'pending': pending,
            'in_process': in_process,
            'closed': closed,
            'total': total,
            'technicians': technicians,
            'technicianPerformance': technician_performance,
            'failureTypes': failure_types,
            'equipmentFrequency': equipment_frequency,
            'totalTickets': total,
            'completedTickets': closed,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar(request):
    """Crear ticket desde formulario público (personName, personId, equipmentType, damageType, description, email?, phone?)."""
    ser = SolicitarTicketSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    data = ser.validated_data
    correo = (data.get('email') or '').strip() or 'noreply@local'
    telefono = (data.get('phone') or '').strip()

    usuario = Usuario.objects.create(
        nombre=data['personName'],
        identificacion=data['personId'],
        correo=correo,
        telefono=telefono,
    )
    serie = f"SOL-{uuid.uuid4().hex[:8].upper()}"
    equipo = Equipo.objects.create(
        tipo=data['equipmentType'],
        serie=serie,
        marca='',
        modelo='',
    )
    ticket = Ticket.objects.create(
        usuario=usuario,
        equipo=equipo,
        descripcion=data['description'],
        tipo_dano=data['damageType'],
        estado='ABIERTO',
    )

    archivo_pdf = generar_pdf_ticket(ticket)
    if correo != 'noreply@local':
        try:
            enviar_correo_ticket(
                asunto='📩 Nuevo ticket creado',
                mensaje=(
                    f'Se ha creado un nuevo ticket\n\n'
                    f'ID: {ticket.id}\n'
                    f'Usuario: {ticket.usuario.nombre}\n'
                    f'Equipo: {ticket.equipo.tipo} - {ticket.equipo.serie}\n'
                    f'Estado: {ticket.estado}\n'
                    f'Descripción:\n{ticket.descripcion}\n\n'
                    f'Adjunto encontrarás el PDF con los detalles del ticket.'
                ),
                destinatarios=[correo],
                archivo_adjunto=archivo_pdf,
            )
        except Exception:
            pass

    return Response({'ticketId': ticket.id}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    """Login por email o username + password; devuelve access + refresh JWT."""
    email_or_user = (request.data.get('email') or request.data.get('username') or '').strip()
    password = request.data.get('password') or ''
    if not email_or_user or not password:
        return Response(
            {'error': 'email (o usuario) y contraseña son obligatorios'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if '@' in email_or_user:
        user = User.objects.filter(email__iexact=email_or_user).first()
    else:
        user = User.objects.filter(username__iexact=email_or_user).first()
    if not user or not user.check_password(password):
        return Response(
            {'error': 'Credenciales inválidas'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not user.is_active:
        return Response(
            {'error': 'Usuario inactivo'},
            status=status.HTTP_403_FORBIDDEN,
        )
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


