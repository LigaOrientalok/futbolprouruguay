"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AuthNav() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />
  }

  if (user) {
    return (
      <>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <Button variant="outline" size="sm" onClick={logout}>
          Cerrar sesión
        </Button>
      </>
    )
  }

  return (
    <>
      <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Iniciar sesión
      </Link>
      <Button asChild>
        <Link href="/auth/register">Registrarse</Link>
      </Button>
    </>
  )
}
