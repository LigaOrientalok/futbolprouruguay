"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap } from "lucide-react"
import Link from "next/link"

export default function PremiumPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handlePremium = async () => {
    window.open("https://buy.stripe.com/test_placeholder", "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  if (user?.subscription_tier === "premium") {
    return (
      <div className="space-y-6 text-center py-16">
        <Crown className="h-16 w-16 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">¡Ya sos Premium!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Disfrutás de todos los beneficios de FutbolMatch Premium. Perfil destacado, postulaciones ilimitadas y estadísticas avanzadas.
        </p>
        <Button asChild>
          <Link href="/dashboard">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Crown className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold">FutbolMatch Premium</h1>
        <p className="text-muted-foreground mt-2">Llevá tu experiencia al siguiente nivel</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Gratuito</CardTitle>
            <CardDescription>Para empezar</CardDescription>
            <p className="text-3xl font-bold">$0</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                "Perfil básico con foto",
                "3 postulaciones por semana",
                "Búsqueda de equipos y jugadores",
                "Chat con otros usuarios",
                "Feed de la comunidad",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Tu plan actual</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            RECOMENDADO
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Premium
              <Badge>Popular</Badge>
            </CardTitle>
            <CardDescription>Todo lo que necesitás</CardDescription>
            <p className="text-3xl font-bold">
              $9.99 <span className="text-sm text-muted-foreground font-normal">/mes</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                "Todo lo del plan gratuito",
                "Perfil destacado con badge exclusivo",
                "Postulaciones ilimitadas a equipos",
                "Aparición prioritaria en búsquedas",
                "Estadísticas avanzadas de perfil",
                "Insignia Premium en tu perfil",
                "Soporte prioritario",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handlePremium}>
              <Zap className="h-4 w-4 mr-2" />
              Suscribirse ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
