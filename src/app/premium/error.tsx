"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, Crown } from "lucide-react"

export default function PremiumError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="animate-in fade-in zoom-in duration-300">
        <Crown className="h-16 w-16 text-destructive mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar Premium</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudo cargar la información de Premium. Intentalo de nuevo.
        </p>
        <Button onClick={reset} variant="default" size="lg">
          Reintentar
        </Button>
      </div>
    </div>
  )
}
