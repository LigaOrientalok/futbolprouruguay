"use client"

import { cn } from "@/lib/utils"
import { Search, Users, MessageCircle, Trophy, Star, Swords, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const emptyStateConfig = {
  default: { icon: Search, title: "Sin resultados", desc: "No hay contenido para mostrar" },
  search: { icon: Search, title: "No se encontraron resultados", desc: "Probá cambiar los filtros o buscar otro término" },
  team: { icon: Users, title: "No hay equipos", desc: "Sé el primero en crear un equipo" },
  challenge: { icon: Swords, title: "No hay desafíos", desc: "Publicá un desafío o esperá a que alguien lo haga" },
  message: { icon: MessageCircle, title: "Sin mensajes", desc: "No tenés conversaciones activas" },
  feed: { icon: Star, title: "No hay publicaciones", desc: "Sé el primero en publicar algo" },
  premium: { icon: Trophy, title: "No hay contenido premium", desc: "Actualizá a Premium para acceder" },
}

interface EmptyStateProps {
  variant?: keyof typeof emptyStateConfig
  icon?: LucideIcon
  title?: string
  description?: string
  action?: { label: string; href: string }
  className?: string
}

export function EmptyState({ variant = "default", icon: IconOverride, title, description, action, className }: EmptyStateProps) {
  const config = emptyStateConfig[variant]
  const Icon = IconOverride || config.icon

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center animate-fade-in", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
        <Icon className="relative h-16 w-16 text-muted-foreground/40" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title || config.title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description || config.desc}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
