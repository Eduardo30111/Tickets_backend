from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
from django.conf import settings
from datetime import datetime

def generar_pdf_ticket(ticket):
    carpeta = os.path.join(settings.BASE_DIR, 'api', 'pdfs')
    os.makedirs(carpeta, exist_ok=True)

    nombre_archivo = f"ticket_{ticket.id}.pdf"
    ruta = os.path.join(carpeta, nombre_archivo)

    c = canvas.Canvas(ruta, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "CONSTANCIA DE SOPORTE TÉCNICO")

    c.setFont("Helvetica", 11)
    c.drawString(50, height - 100, f"Ticket ID: {ticket.id}")
    c.drawString(50, height - 120, f"Usuario: {ticket.usuario.nombre}")
    c.drawString(50, height - 140, f"Equipo: {ticket.equipo.tipo}")
    c.drawString(50, height - 160, f"Serie: {ticket.equipo.serie}")
    c.drawString(50, height - 180, f"Estado: {ticket.estado}")
    c.drawString(50, height - 200, f"Fecha: {datetime.now()}")

    c.drawString(50, height - 240, "Descripción del problema:")
    text = c.beginText(50, height - 260)
    text.textLines(ticket.descripcion)
    c.drawText(text)

    c.showPage()
    c.save()

    return ruta
