"""
Script para crear datos de prueba automáticamente.
Corre con: python manage.py shell < seed_data.py
"""

from django.contrib.auth.models import User
from api.models import Usuario, Equipo, Ticket

# Crear superuser si no existe
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("✅ Usuario admin creado")
else:
    print("ℹ️ Usuario admin ya existe")

# Usuario técnico para login por email (Portal Técnico)
if not User.objects.filter(email='tecnico@example.com').exists():
    u = User.objects.create_user('tecnico', 'tecnico@example.com', 'tecnico123')
    u.is_staff = True
    u.save()
    print("✅ Usuario técnico creado (tecnico@example.com / tecnico123)")
else:
    print("ℹ️ Usuario técnico ya existe")

# Crear usuarios de prueba
usuarios_data = [
    {'nombre': 'Juan Pérez', 'identificacion': '12345678', 'correo': 'juan@example.com', 'telefono': '3001234567'},
    {'nombre': 'María García', 'identificacion': '87654321', 'correo': 'maria@example.com', 'telefono': '3007654321'},
    {'nombre': 'Carlos López', 'identificacion': '11223344', 'correo': 'carlos@example.com', 'telefono': '3001122334'},
]

for datos in usuarios_data:
    if not Usuario.objects.filter(correo=datos['correo']).exists():
        Usuario.objects.create(**datos)
        print(f"✅ Usuario '{datos['nombre']}' creado")

# Crear equipos de prueba
equipos_data = [
    {'tipo': 'Laptop', 'serie': 'LAP-001', 'marca': 'Dell', 'modelo': 'Inspiron 15'},
    {'tipo': 'Desktop', 'serie': 'DES-001', 'marca': 'HP', 'modelo': 'ProDesk 400'},
    {'tipo': 'Impresora', 'serie': 'IMP-001', 'marca': 'Canon', 'modelo': 'MF445dw'},
]

for datos in equipos_data:
    if not Equipo.objects.filter(serie=datos['serie']).exists():
        Equipo.objects.create(**datos)
        print(f"✅ Equipo '{datos['tipo']}' ({datos['serie']}) creado")

print("\n✨ Datos de prueba creados exitosamente")
print("\nCredenciales de login:")
print("- Username: admin")
print("- Password: admin123")
