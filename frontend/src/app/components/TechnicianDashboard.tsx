import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  getTickets,
  getStatistics,
  clearAuth,
  type Statistics,
} from '@/lib/api'
import { toast } from 'sonner'
import {
  Loader2,
  LogOut,
  TrendingUp,
  Users,
  Wrench,
  AlertCircle,
} from 'lucide-react'
import { TicketList } from './TicketList'
import { StatisticsView } from './StatisticsView'
import type { Ticket } from '@/lib/api'

type TechnicianDashboardProps = {
  onLogout: () => void
}

export function TechnicianDashboard({ onLogout }: TechnicianDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<Ticket[]>([])
  const [completed, setCompleted] = useState<Ticket[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [p, c, s] = await Promise.all([
        getTickets('pending'),
        getTickets('completed'),
        getStatistics(),
      ])
      setPending(p.tickets)
      setCompleted(c.tickets)
      setStats(s)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Error al cargar datos'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleLogout = () => {
    clearAuth()
    toast.success('Sesión cerrada')
    onLogout()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#fffde7]">
      <div className="container mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between rounded-lg border-l-4 border-[#2d7a4f] bg-white p-4 shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e]">
              Panel de Control Técnico
            </h1>
            <p className="text-[#2d7a4f]">Gestión de tickets y reportes</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-[#2d7a4f] text-[#1a4d2e] hover:bg-[#e8f5e9]"
          >
            <LogOut className="mr-2 size-4" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-[#ffd54f] transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1a4d2e]">
                Tickets Pendientes
              </CardTitle>
              <AlertCircle className="size-4 text-[#ffd54f]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ffd54f]">
                {pending.length}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Esperando atención
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-[#2d7a4f] transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1a4d2e]">
                Completados
              </CardTitle>
              <Wrench className="size-4 text-[#2d7a4f]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d7a4f]">
                {completed.length}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Servicios finalizados
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-[#1a4d2e] transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1a4d2e]">
                Total Tickets
              </CardTitle>
              <TrendingUp className="size-4 text-[#1a4d2e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1a4d2e]">
                {stats?.totalTickets ?? 0}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Todos los registros
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-[#ffd54f] transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1a4d2e]">
                Técnicos Activos
              </CardTitle>
              <Users className="size-4 text-[#ffd54f]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ffd54f]">
                {stats?.technicians?.length ?? 0}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Personal en servicio
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#e8f5e9]">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#ffd54f] data-[state=active]:text-[#1a4d2e]"
            >
              Pendientes
              {pending.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 bg-[#1a4d2e]"
                >
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#2d7a4f] data-[state=active]:text-white"
            >
              Completados
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-[#2d7a4f] data-[state=active]:text-white"
            >
              Estadísticas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <TicketList
              tickets={pending}
              onRefresh={load}
              isPending
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TicketList
              tickets={completed}
              onRefresh={load}
              isPending={false}
            />
          </TabsContent>
          <TabsContent value="statistics" className="mt-4">
            <StatisticsView statistics={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
