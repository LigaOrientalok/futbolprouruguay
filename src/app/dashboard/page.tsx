"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { query, findById, count } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Calendar, MessageCircle, TrendingUp, ArrowRight, Star } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import type { User, Post, Team, Opportunity, Challenge } from "@/lib/types"

export default function DashboardPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({ players: 0, teams: 0, opportunities: 0, challenges: 0 })
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!authUser) {
        setLoading(false)
        return
      }

      const userData = await findById("users", authUser.id) as User | null
      setUser(userData)

      const playersCount = await count("users")
      const teamsCount = await count("teams")
      const oppsCount = await count("opportunities")
      const challCount = await count("challenges")

      setStats({
        players: playersCount || 0,
        teams: teamsCount || 0,
        opportunities: oppsCount || 0,
        challenges: challCount || 0,
      })

      const posts = await query("SELECT * FROM posts ORDER BY created_at DESC LIMIT 5") as Post[]
      setRecentPosts(posts || [])
      setLoading(false)
    }
    loadData()
  }, [authUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">Panel principal de FutbolMatch Uruguay</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile">Editar perfil</Link>
          </Button>
          <Button asChild>
            <Link href="/search">Buscar jugadores</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Jugadores", value: stats.players, href: "/search", color: "text-blue-500" },
          { icon: Trophy, label: "Equipos", value: stats.teams, href: "/teams", color: "text-green-500" },
          { icon: Calendar, label: "Oportunidades", value: stats.opportunities, href: "/opportunities", color: "text-orange-500" },
          { icon: TrendingUp, label: "Desafíos", value: stats.challenges, href: "/challenges", color: "text-purple-500" },
        ].map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Feed reciente</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/feed">Ver todo <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay publicaciones aún. ¡Sé el primero en publicar!
              </p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(post.user_id)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(post.created_at)} · {post.likes_count} likes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Users, label: "Buscar jugadores", href: "/search" },
              { icon: Trophy, label: "Crear equipo", href: "/teams/new" },
              { icon: Calendar, label: "Publicar oportunidad", href: "/opportunities" },
              { icon: Star, label: "Ver feed", href: "/feed" },
              { icon: MessageCircle, label: "Mensajes", href: "/chat" },
            ].map(({ icon: Icon, label, href }) => (
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
      </div>

      {user?.subscription_tier === "free" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <Star className="h-8 w-8 text-primary" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold">Actualizá a Premium</h3>
              <p className="text-sm text-muted-foreground">
                Perfil destacado, postulaciones ilimitadas y estadísticas avanzadas.
              </p>
            </div>
            <Button asChild>
              <Link href="/premium">Ver planes</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
