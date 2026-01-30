"""Asegura que exista el usuario técnico y fuerza contraseña tecnico123."""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Crea o actualiza usuario técnico (tecnico@example.com / tecnico123) para Portal Técnico"

    def handle(self, *args, **options):
        email = "tecnico@example.com"
        password = "tecnico123"

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username="tecnico").first()
        if user:
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_active = True
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f"Usuario técnico actualizado: {email} / {password}"
            ))
        else:
            user = User.objects.create_user("tecnico", email=email, password=password)
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f"Usuario técnico creado: {email} / {password}"
            ))
        self.stdout.write("Entra al Portal Técnico con ese correo y contraseña.")
