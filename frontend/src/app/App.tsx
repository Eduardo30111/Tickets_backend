import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { TicketForm } from '@/app/components/TicketForm'
import { AuthForm } from '@/app/components/AuthForm'
import { TechnicianDashboard } from '@/app/components/TechnicianDashboard'
import { isAuthenticated } from '@/lib/api'
import { Toaster } from 'sonner'
import { ClipboardList, Lock, Loader2 } from 'lucide-react'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuth(isAuthenticated())
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#fffde7]">
      <Toaster position="top-right" richColors />

      {auth ? (
        <TechnicianDashboard onLogout={() => setAuth(false)} />
      ) : (
        <div className="container mx-auto p-4">
          <div className="py-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-[#1a4d2e]">
              Sistema de Tickets de Soporte
            </h1>
            <p className="text-lg text-[var(--muted-foreground)]">
              Gestión integral de servicios técnicos
            </p>
          </div>

          <Tabs defaultValue="public" className="mx-auto max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 bg-[#e8f5e9]">
              <TabsTrigger
                value="public"
                className="gap-2 data-[state=active]:bg-[#2d7a4f] data-[state=active]:text-white"
              >
                <ClipboardList className="size-4" />
                Solicitar Servicio
              </TabsTrigger>
              <TabsTrigger
                value="technician"
                className="gap-2 data-[state=active]:bg-[#ffd54f] data-[state=active]:text-[#1a4d2e]"
              >
                <Lock className="size-4" />
                Portal Técnico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="public" className="mt-6">
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-[#81c784] bg-[#e8f5e9] p-4">
                  <h3 className="mb-2 font-semibold text-[#1a4d2e]">
                    Formulario Público de Solicitud
                  </h3>
                  <p className="text-sm text-[#2d7a4f]">
                    Complete el formulario para solicitar asistencia técnica. Recibirá confirmación y su ticket será atendido por nuestro equipo.
                  </p>
                </div>
                <TicketForm />
              </div>
            </TabsContent>

            <TabsContent value="technician" className="mt-6">
              <div className="space-y-6">
                <div className="rounded-lg border-2 border-[#ffd54f] bg-[#fffde7] p-4">
                  <h3 className="mb-2 font-semibold text-[#1a4d2e]">
                    Acceso Restringido – Personal Técnico
                  </h3>
                  <p className="text-sm text-[#1a4d2e]">
                    Esta sección es exclusiva para el personal técnico autorizado. Inicie sesión para acceder al panel de control y gestionar tickets.
                  </p>
                </div>
                <AuthForm onSuccess={() => setAuth(true)} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center text-sm text-[var(--muted-foreground)]">
            <p>© 2026 Sistema de Tickets de Soporte – Todos los derechos reservados</p>
            <p className="mt-2">
              <span className="font-semibold text-[#2d7a4f]">Nota de Seguridad:</span> Este sistema esta en fase de desarrollo con mejoras futuras.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
