"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, Calendar, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/lib/actions"

const STATS_CONFIG = [
  {
    icon: Users,
    label: "Jugadores",
    href: "/search",
    color: "text-blue-500",
    gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
    key: "players" as const,
  },
  {
    icon: Trophy,
    label: "Equipos",
    href: "/teams",
    color: "text-green-500",
    gradient: "from-green-500/20 via-green-500/10 to-transparent",
    key: "teams" as const,
  },
  {
    icon: Calendar,
    label: "Oportunidades",
    href: "/opportunities",
    color: "text-orange-500",
    gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
    key: "opportunities" as const,
  },
  {
    icon: TrendingUp,
    label: "Desafíos",
    href: "/challenges",
    color: "text-purple-500",
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
    key: "challenges" as const,
  },
]

export function StatsCards({ initialStats }: { initialStats: { players: number; teams: number; opportunities: number; challenges: number } }) {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getUserStats,
    initialData: initialStats,
    refetchInterval: 30_000,
  })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS_CONFIG.map(({ icon: Icon, label, href, color, gradient, key }) => (
        <Link key={label} href={href}>
          <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-full bg-gradient-to-br ${gradient} p-2.5`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.[key] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
