"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="animate-in fade-in zoom-in duration-300">
        <AlertCircle className="h-16 w-16 text-destructive mb-4 mx-auto" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar el feed</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudieron cargar las publicaciones. Intentalo de nuevo más tarde.
        </p>
        <Button onClick={reset} variant="default" size="lg">
          Reintentar
        </Button>
      </div>
    </div>
  )
}
