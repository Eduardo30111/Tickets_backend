import os
from pathlib import Path


def generar_pdf_ticket(ticket):
    """Genera un PDF (o un .txt de respaldo) para el `ticket` dado.

    Intenta usar reportlab si está disponible; si no, crea un archivo de texto
    en la carpeta `tickets/` para evitar errores de importación y permitir que
    el servidor arranque.
    
    Retorna:
        str: Ruta absoluta del archivo generado (PDF o TXT)
    """
    tickets_dir = Path(__file__).resolve().parent / 'tickets'
    tickets_dir.mkdir(exist_ok=True)

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        path = tickets_dir / f"ticket_{ticket.id}.pdf"
        c = canvas.Canvas(str(path), pagesize=letter)
        c.drawString(72, 720, f"Ticket #{ticket.id}")
        c.drawString(72, 700, f"Usuario: {ticket.usuario.nombre}")
        c.drawString(72, 680, f"Equipo: {ticket.equipo.tipo} - {ticket.equipo.serie}")
        c.drawString(72, 660, f"Estado: {ticket.estado}")
        c.drawString(72, 640, f"Atendido por: {getattr(ticket, 'atendido_por', '') or '-'}")
        c.drawString(72, 620, f"Tipo daño: {getattr(ticket, 'tipo_dano', '') or '-'}")
        c.drawString(72, 600, "Descripción:")
        c.drawString(72, 580, (ticket.descripcion[:200] + "...") if len(ticket.descripcion) > 200 else ticket.descripcion)
        proc = getattr(ticket, 'procedimiento', '') or ''
        if proc:
            c.drawString(72, 540, "Procedimiento realizado:")
            c.drawString(72, 520, (proc[:200] + "...") if len(proc) > 200 else proc)
        c.save()
        return str(path)
    except Exception as e:
        # Fallback simple: escribir un .txt para no romper el flujo
        path = tickets_dir / f"ticket_{ticket.id}.txt"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(f"Ticket #{ticket.id}\n")
            f.write(f"Usuario: {ticket.usuario.nombre}\n")
            f.write(f"Equipo: {ticket.equipo.tipo} - {ticket.equipo.serie}\n")
            f.write(f"Estado: {ticket.estado}\n")
            f.write(f"Atendido por: {getattr(ticket, 'atendido_por', '') or '-'}\n")
            f.write(f"Tipo daño: {getattr(ticket, 'tipo_dano', '') or '-'}\n")
            f.write(f"Descripción:\n{ticket.descripcion}\n")
            proc = getattr(ticket, 'procedimiento', '') or ''
            if proc:
                f.write(f"Procedimiento:\n{proc}\n")
        return str(path)
