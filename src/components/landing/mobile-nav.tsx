"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md hover:bg-accent">
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <nav className="flex flex-col gap-3">
            <Link href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Funcionalidades</Link>
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Cómo funciona</Link>
            <Link href="#premium" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Premium</Link>
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link>
            <Button asChild className="w-full"><Link href="/auth/register">Registrarse</Link></Button>
          </nav>
        </div>
      )}
    </>
  )
}
