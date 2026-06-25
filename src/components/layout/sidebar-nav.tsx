"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Trophy, Search, MessageCircle,
  Calendar, Swords, Star, Award, ShoppingBag, Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sections = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    ],
  },
  {
    label: "Perfil",
    items: [
      { href: "/profile", icon: Users, label: "Mi Perfil" },
    ],
  },
  {
    label: "Equipos",
    items: [
      { href: "/teams", icon: Trophy, label: "Equipos" },
    ],
  },
  {
    label: "Social",
    items: [
      { href: "/search", icon: Search, label: "Buscar" },
      { href: "/feed", icon: Star, label: "Feed" },
      { href: "/chat", icon: MessageCircle, label: "Mensajes" },
    ],
  },
  {
    label: "Competitivo",
    items: [
      { href: "/opportunities", icon: Calendar, label: "Oportunidades" },
      { href: "/challenges", icon: Swords, label: "Desafíos" },
      { href: "/ranking", icon: Award, label: "Ranking" },
    ],
  },
  {
    label: "Premium",
    items: [
      { href: "/premium", icon: ShoppingBag, label: "Premium" },
    ],
  },
]

export function SidebarNav({
  onItemClick,
  userRole,
}: {
  onItemClick?: () => void
  userRole?: string | null
}) {
  const pathname = usePathname()

  const adminSection = { label: "Admin", items: [{ href: "/admin", icon: Shield, label: "Panel Admin" }] }
  const socialIndex = sections.findIndex((s) => s.label === "Social")
  const allSections = userRole === "admin"
    ? [...sections.slice(0, socialIndex + 1), adminSection, ...sections.slice(socialIndex + 1)]
    : sections

  return (
    <nav className="space-y-4">
      {allSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-[1.02]",
                    isActive
                      ? "border-l-2 border-primary bg-primary/5 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
