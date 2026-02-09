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
import { Button } from '@/app/components/ui/button'
import { login } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, LogIn } from 'lucide-react'

type AuthFormProps = {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Inicio de sesión exitoso')
      onSuccess()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-t-4 border-[#ffd54f] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#fffde7] to-[#e8f5e9]">
        <CardTitle className="text-[#1a4d2e]">Portal Técnico</CardTitle>
        <CardDescription className="text-[#1a4d2e]/80">
          Acceso exclusivo para personal técnico. Use correo o usuario y contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-[#1a4d2e]">
              Correo o usuario
            </Label>
            <Input
              id="login-email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tecnico@example.com o tecnico"
              className="border-[#2d7a4f]/30 focus:border-[#2d7a4f]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-[#1a4d2e]">
              Contraseña
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
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
                Iniciando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 size-4" />
                Iniciar Sesión
              </>
            )}
          </Button>
          
        </form>
      </CardContent>
    </Card>
  )
}
