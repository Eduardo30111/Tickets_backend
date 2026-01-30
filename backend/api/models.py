from django.db import models

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    identificacion = models.CharField(max_length=50)
    correo = models.EmailField()
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre


class Equipo(models.Model):
    tipo = models.CharField(max_length=50)
    serie = models.CharField(max_length=50)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.tipo} - {self.serie}"


class Ticket(models.Model):
    ESTADOS = [
        ('ABIERTO', 'Abierto'),
        ('EN_PROCESO', 'En proceso'),
        ('CERRADO', 'Cerrado'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE)
    descripcion = models.TextField()
    tipo_dano = models.CharField(max_length=50, blank=True, default='')  # tipo de daño/falla
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ABIERTO')
    fecha = models.DateTimeField(auto_now_add=True)
    pdf = models.FileField(upload_to='tickets/', null=True, blank=True)
    atendido_por = models.CharField(max_length=100, null=True, blank=True)
    procedimiento = models.TextField(blank=True, default='')  # descripción del trabajo realizado

    def __str__(self):
        return f"Ticket #{self.id} - {self.estado}"

