import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { createTicket } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Send, Mail, Phone } from 'lucide-react'

const EQUIPMENT_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Computadora de Escritorio' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'printer', label: 'Impresora' },
  { value: 'scanner', label: 'Escáner' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'tablet', label: 'Tableta' },
  { value: 'network', label: 'Equipo de Red' },
  { value: 'other', label: 'Otro' },
]

const DAMAGE_OPTIONS = [
  { value: 'hardware', label: 'Falla de Hardware' },
  { value: 'software', label: 'Falla de Software' },
  { value: 'network', label: 'Problema de Red' },
  { value: 'performance', label: 'Bajo Rendimiento' },
  { value: 'screen', label: 'Pantalla Dañada' },
  { value: 'battery', label: 'Problemas de Batería' },
  { value: 'power', label: 'Problema de Energía' },
  { value: 'virus', label: 'Virus/Malware' },
  { value: 'other', label: 'Otro' },
]

export function TicketForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    personName: '',
    personId: '',
    equipmentType: '',
    damageType: '',
    description: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createTicket({
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      })
      toast.success(`Ticket creado. ID: ${result.ticketId}`)
      if (formData.email || formData.phone) {
        toast.info('Recibirá notificación con los detalles del ticket')
      }
      setFormData({
        personName: '',
        personId: '',
        equipmentType: '',
        damageType: '',
        description: '',
        email: '',
        phone: '',
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-t-4 border-[#2d7a4f] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#e8f5e9] to-[#fffde7]">
        <CardTitle className="text-2xl text-[#1a4d2e]">
          Solicitud de Reparación
        </CardTitle>
        <CardDescription className="text-[#1a4d2e]/80">
          Complete el formulario para solicitar un servicio técnico
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personName" className="text-[#1a4d2e]">
              Nombre Completo *
            </Label>
            <Input
              id="personName"
              value={formData.personName}
              onChange={(e) =>
                setFormData({ ...formData, personName: e.target.value })
              }
              required
              placeholder="Juan Pérez"
              className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personId" className="text-[#1a4d2e]">
              Identificación *
            </Label>
            <Input
              id="personId"
              value={formData.personId}
              onChange={(e) =>
                setFormData({ ...formData, personId: e.target.value })
              }
              required
              placeholder="12345678"
              className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-[#1a4d2e]"
              >
                <Mail className="size-4 text-[#ffd54f]" />
                Email (opcional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="correo@ejemplo.com"
                className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Para notificaciones por correo
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="flex items-center gap-2 text-[#1a4d2e]"
              >
                <Phone className="size-4 text-[#ffd54f]" />
                Teléfono (opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+57 300 123 4567"
                className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Para notificaciones por WhatsApp
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipmentType" className="text-[#1a4d2e]">
              Tipo de Equipo *
            </Label>
            <Select
              value={formData.equipmentType}
              onValueChange={(v: string) =>
                setFormData({ ...formData, equipmentType: v })
              }
              required
            >
              <SelectTrigger className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]">
                <SelectValue placeholder="Seleccione el tipo de equipo" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="damageType" className="text-[#1a4d2e]">
              Tipo de Daño *
            </Label>
            <Select
              value={formData.damageType}
              onValueChange={(v: string) =>
                setFormData({ ...formData, damageType: v })
              }
              required
            >
              <SelectTrigger className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]">
                <SelectValue placeholder="Seleccione el tipo de daño" />
              </SelectTrigger>
              <SelectContent>
                {DAMAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#1a4d2e]">
              Descripción del Problema *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Describa detalladamente el problema que presenta el equipo..."
              rows={5}
              className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2d7a4f] hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
