"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export function PremiumUpsell() {
  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
        <Star className="h-8 w-8 text-primary animate-pulse-glow" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-semibold">Actualizá a Premium</h3>
          <p className="text-sm text-muted-foreground">
            Perfil destacado, postulaciones ilimitadas y estadísticas avanzadas.
          </p>
        </div>
        <Button asChild>
          <Link href="/premium">Ver planes</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
