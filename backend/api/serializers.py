from rest_framework import serializers
from .models import Usuario, Equipo, Ticket


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = '__all__'


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'


class SolicitarTicketSerializer(serializers.Serializer):
    personName = serializers.CharField(max_length=100)
    personId = serializers.CharField(max_length=50)
    equipmentType = serializers.CharField(max_length=50)
    damageType = serializers.CharField(max_length=50)
    description = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
