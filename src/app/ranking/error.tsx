"use client"

import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export default function RankingError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="animate-in fade-in zoom-in duration-300">
        <Trophy className="h-16 w-16 text-destructive mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar el ranking</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudo cargar el ranking de jugadores. Intentalo de nuevo.
        </p>
        <Button onClick={reset} variant="default" size="lg">
          Reintentar
        </Button>
      </div>
    </div>
  )
}
