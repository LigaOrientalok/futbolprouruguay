"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-client"

export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <>
      <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md hover:bg-accent">
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4 fixed left-0 right-0 top-16 z-50">
          <nav className="flex flex-col gap-3">
            <Link href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Funcionalidades</Link>
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Cómo funciona</Link>
            <Link href="#premium" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Premium</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
                <Button variant="outline" onClick={() => { logout(); setMenuOpen(false) }} className="w-full">Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link>
                <Button asChild className="w-full"><Link href="/auth/register" onClick={() => setMenuOpen(false)}>Registrarse</Link></Button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
