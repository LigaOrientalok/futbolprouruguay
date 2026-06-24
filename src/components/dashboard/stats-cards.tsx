"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, Calendar, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserStats } from "@/lib/actions"

const STATS_CONFIG = [
  { icon: Users, label: "Jugadores", href: "/search", color: "text-blue-500", key: "players" as const },
  { icon: Trophy, label: "Equipos", href: "/teams", color: "text-green-500", key: "teams" as const },
  { icon: Calendar, label: "Oportunidades", href: "/opportunities", color: "text-orange-500", key: "opportunities" as const },
  { icon: TrendingUp, label: "Desafíos", href: "/challenges", color: "text-purple-500", key: "challenges" as const },
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
      {STATS_CONFIG.map(({ icon: Icon, label, href, color, key }) => (
        <Link key={label} href={href}>
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
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
