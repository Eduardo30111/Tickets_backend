import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { completeTicket, downloadTicketPdf, type Ticket } from '@/lib/api'
import { toast } from 'sonner'
import { Calendar, CheckCircle, Loader2, User, Wrench, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const EQUIPMENT_LABELS: Record<string, string> = {
  laptop: 'Laptop', desktop: 'Computadora de Escritorio', monitor: 'Monitor',
  printer: 'Impresora', scanner: 'Escáner', phone: 'Teléfono', tablet: 'Tableta',
  network: 'Equipo de Red', other: 'Otro',
}
const DAMAGE_LABELS: Record<string, string> = {
  hardware: 'Falla de Hardware', software: 'Falla de Software', network: 'Problema de Red',
  performance: 'Bajo Rendimiento', screen: 'Pantalla Dañada', battery: 'Problemas de Batería',
  power: 'Problema de Energía', virus: 'Virus/Malware', other: 'Otro',
}

type TicketListProps = { tickets: Ticket[]; onRefresh: () => void; isPending: boolean }

export function TicketList({ tickets, onRefresh, isPending }: TicketListProps) {
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [technicianName, setTechnicianName] = useState('')
  const [procedureDescription, setProcedureDescription] = useState('')

  const handleComplete = async () => {
    if (!selected || !technicianName.trim() || !procedureDescription.trim()) {
      toast.error('Complete todos los campos')
      return
    }
    setLoading(true)
    try {
      await completeTicket(selected.id, { technicianName: technicianName.trim(), procedureDescription: procedureDescription.trim() })
      toast.success('Ticket completado')
      setOpen(false)
      setTechnicianName('')
      setProcedureDescription('')
      setSelected(null)
      onRefresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al completar el ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (t: Ticket) => {
    try {
      toast.info('Generando PDF...')
      await downloadTicketPdf(t.id)
      toast.success('PDF descargado')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al generar el PDF')
    }
  }

  const getEq = (s: string) => EQUIPMENT_LABELS[s] ?? s
  const getDmg = (s: string) => DAMAGE_LABELS[s] ?? s

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-8 text-center text-[var(--muted-foreground)]">
            No hay tickets {isPending ? 'pendientes' : 'completados'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((t) => (
          <Card key={t.id} className="border-t-4 border-[#2d7a4f] transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-[#1a4d2e]">{t.personName}</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)]">ID: {t.personId}</p>
                </div>
                <Badge variant={isPending ? 'destructive' : 'default'} className={isPending ? 'bg-[#ffd54f] text-[#1a4d2e]' : 'bg-[#2d7a4f]'}>
                  {isPending ? 'Pendiente' : 'Completado'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="size-4 text-[#2d7a4f]" />
                <span className="font-medium text-[#1a4d2e]">Equipo:</span>
                <span>{getEq(t.equipmentType)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-[#ffd54f]" />
                <span className="font-medium text-[#1a4d2e]">Daño:</span>
                <span>{getDmg(t.damageType)}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#1a4d2e]">Descripción:</p>
                <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">{t.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Calendar className="size-4 text-[#2d7a4f]" />
                <span>{format(new Date(t.createdAt), "PPP 'a las' HH:mm", { locale: es })}</span>
              </div>
              {t.atendido_por && (
                <div className="border-t border-[#2d7a4f]/20 pt-2">
                  <p className="text-sm"><span className="font-medium text-[#1a4d2e]">Técnico:</span> {t.atendido_por}</p>
                </div>
              )}
              {isPending ? (
                <Button className="mt-2 w-full bg-[#2d7a4f] hover:opacity-90" onClick={() => { setSelected(t); setOpen(true) }}>
                  <CheckCircle className="mr-2 size-4" /> Completar Ticket
                </Button>
              ) : (
                <Button variant="outline" className="mt-2 w-full border-[#2d7a4f] text-[#1a4d2e] hover:bg-[#e8f5e9]" onClick={() => handleDownloadPdf(t)}>
                  <Download className="mr-2 size-4" /> Descargar PDF
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Completar Ticket de Servicio</DialogTitle>
            <DialogDescription>Registre los detalles del servicio técnico realizado</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-[var(--muted)] p-4">
                <div><p className="text-sm font-medium">Cliente</p><p className="text-sm text-[var(--muted-foreground)]">{selected.personName}</p></div>
                <div><p className="text-sm font-medium">Equipo</p><p className="text-sm text-[var(--muted-foreground)]">{getEq(selected.equipmentType)}</p></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianName">Nombre del Técnico *</Label>
                <Input id="technicianName" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} placeholder="Juan Técnico" className="border-[var(--border)]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedureDescription">Descripción del Procedimiento *</Label>
                <Textarea id="procedureDescription" value={procedureDescription} onChange={(e) => setProcedureDescription(e.target.value)} placeholder="Describa el procedimiento realizado..." rows={6} className="border-[var(--border)]" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                <Button className="flex-1 bg-[#2d7a4f] hover:opacity-90" onClick={handleComplete} disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando...</> : <><CheckCircle className="mr-2 size-4" /> Completar Servicio</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
