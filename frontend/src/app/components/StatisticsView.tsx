import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { Statistics } from '@/lib/api'

const COLORS = ['#2d7a4f', '#66bb6a', '#ffd54f', '#81c784', '#ffeb3b', '#a5d6a7', '#fff176', '#4caf50']

type StatisticsViewProps = { statistics: Statistics | null }

export function StatisticsView({ statistics }: StatisticsViewProps) {
  if (!statistics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="py-8 text-center text-[var(--muted-foreground)]">No hay estadísticas disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const failureData = Object.entries(statistics.failureTypes ?? {}).map(([name, value]: [string, number]) => ({ name, value }))
  const techData = Object.entries(statistics.technicianPerformance ?? {}).map(([name, tickets]: [string, number]) => ({ name, tickets }))
  const equipmentData = (statistics.equipmentFrequency ?? []).map((e) => ({ name: e.equipmentType, count: e.count }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a4d2e]">Tipos de Fallas Más Frecuentes</CardTitle>
            <CardDescription>Distribución de fallas reportadas</CardDescription>
          </CardHeader>
          <CardContent>
            {failureData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={failureData} cx="50%" cy="50%" labelLine={false} label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
                    {failureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-[var(--muted-foreground)]">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a4d2e]">Rendimiento por Técnico</CardTitle>
            <CardDescription>Tickets atendidos por cada técnico</CardDescription>
          </CardHeader>
          <CardContent>
            {techData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={techData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#2d7a4f" />
                  <YAxis stroke="#2d7a4f" />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#2d7a4f" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-[var(--muted-foreground)]">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1a4d2e]">Equipos con Más Frecuencia de Servicio</CardTitle>
          <CardDescription>Top equipos que requieren servicio con más frecuencia</CardDescription>
        </CardHeader>
        <CardContent>
          {equipmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={equipmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" stroke="#2d7a4f" />
                <YAxis dataKey="name" type="category" width={120} stroke="#2d7a4f" />
                <Tooltip />
                <Bar dataKey="count" fill="#ffd54f" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-[var(--muted-foreground)]">No hay datos disponibles</p>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-[#2d7a4f]">
          <CardHeader><CardTitle className="text-[#1a4d2e]">Total de Servicios</CardTitle></CardHeader>
          <CardContent>
            <p className="text-center text-4xl font-bold text-[#2d7a4f]">{statistics.totalTickets ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-[#66bb6a]">
          <CardHeader><CardTitle className="text-[#1a4d2e]">Servicios Completados</CardTitle></CardHeader>
          <CardContent>
            <p className="text-center text-4xl font-bold text-[#66bb6a]">{statistics.completedTickets ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-[#ffd54f]">
          <CardHeader><CardTitle className="text-[#1a4d2e]">Tasa de Completación</CardTitle></CardHeader>
          <CardContent>
            <p className="text-center text-4xl font-bold text-[#ffd54f]">
              {statistics.totalTickets ? Math.round((statistics.completedTickets / statistics.totalTickets) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
