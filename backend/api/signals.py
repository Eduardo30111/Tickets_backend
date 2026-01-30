from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ticket
from .utils import enviar_correo_ticket

@receiver(post_save, sender=Ticket)
def notificar_ticket_creado(sender, instance, created, **kwargs):
    if created:
        enviar_correo_ticket(
            asunto='📩 Nuevo ticket creado',
            mensaje=(
                f'Se ha creado un nuevo ticket\n\n'
                f'ID: {instance.id}\n'
                f'Estado: {instance.estado}\n'
                f'Descripción:\n{instance.descripcion}'
            ),
            destinatarios=['j20585489@gmail.com']
        )
