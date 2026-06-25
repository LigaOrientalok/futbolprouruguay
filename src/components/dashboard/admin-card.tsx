"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight } from "lucide-react"

export function AdminCard() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") return null

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Panel de Administración</p>
            <p className="text-xs text-muted-foreground">Gestioná usuarios, contenido y estadísticas</p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin">Ir al panel <ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </CardContent>
    </Card>
  )
}
