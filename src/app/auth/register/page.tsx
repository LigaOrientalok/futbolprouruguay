"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-client"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<"player" | "captain">("player")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await register({ email, password, full_name: fullName, username, role })
    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FutbolMatch Uruguay</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>Completá los datos para registrarte</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" placeholder="Juan Pérez" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input id="username" placeholder="juanperez" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Quiero registrarme como</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={role === "player" ? "default" : "outline"} className="flex-1" onClick={() => setRole("player")}>Jugador</Button>
                  <Button type="button" variant={role === "captain" ? "default" : "outline"} className="flex-1" onClick={() => setRole("captain")}>Capitán</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tenés cuenta?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">Iniciá sesión</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
