"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, LayoutDashboard, Users, Search, Calendar, MessageCircle,
  Trophy, Star, Swords, ShoppingBag, Award,
} from "lucide-react"

export const sidebarItems = [
  { href: "/", icon: Home, label: "Principal" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/profile", icon: Users, label: "Mi Perfil" },
  { href: "/teams", icon: Trophy, label: "Equipos" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/opportunities", icon: Calendar, label: "Oportunidades" },
  { href: "/challenges", icon: Swords, label: "Desafíos" },
  { href: "/chat", icon: MessageCircle, label: "Mensajes" },
  { href: "/feed", icon: Star, label: "Feed" },
  { href: "/ranking", icon: Award, label: "Ranking" },
  { href: "/premium", icon: ShoppingBag, label: "Premium" },
]

export function SidebarNav({
  onItemClick,
}: {
  onItemClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
