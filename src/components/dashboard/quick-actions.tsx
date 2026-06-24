"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Calendar, Star, MessageCircle, ArrowRight } from "lucide-react"

const ACTIONS = [
  { icon: Users, label: "Buscar jugadores", href: "/search" },
  { icon: Trophy, label: "Crear equipo", href: "/teams/new" },
  { icon: Calendar, label: "Publicar oportunidad", href: "/opportunities" },
  { icon: Star, label: "Ver feed", href: "/feed" },
  { icon: MessageCircle, label: "Mensajes", href: "/chat" },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ACTIONS.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm">{label}</span>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
