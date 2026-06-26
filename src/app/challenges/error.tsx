"use client"

import { Button } from "@/components/ui/button"
import { Swords } from "lucide-react"

export default function ChallengesError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="animate-in fade-in zoom-in duration-300">
        <Swords className="h-16 w-16 text-destructive mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar los desafíos</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudieron cargar los desafíos. Por favor intentá de nuevo.
        </p>
        <Button onClick={reset} variant="default" size="lg">
          Reintentar
        </Button>
      </div>
    </div>
  )
}
