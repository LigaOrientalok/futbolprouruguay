"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { query, count, updateById } from "@/lib/db-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Calendar, Star, Shield, Ban, CheckCircle } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { User } from "@/lib/types"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalPosts: 0,
    premiumUsers: 0,
  })
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/auth/login"); return }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  async function loadData() {
    if (user!.role !== "admin") {
      router.push("/dashboard")
      return
    }

    const [totalUsers, totalTeams, totalPosts, premiumUsers] = await Promise.all([
      count("users"),
      count("teams"),
      count("posts"),
      count("users", "subscription_tier = $1", ["premium"]),
    ])

    setStats({
      totalUsers: totalUsers || 0,
      totalTeams: totalTeams || 0,
      totalPosts: totalPosts || 0,
      premiumUsers: premiumUsers || 0,
    })

    const allUsers = await query("SELECT * FROM users ORDER BY created_at DESC LIMIT 50") as User[]
    setUsers(allUsers || [])
    setLoading(false)
  }

  const toggleUserStatus = async (userId: string, suspend: boolean) => {
    await updateById("users", userId, { is_suspended: suspend })
    loadData()
  }

  const toggleUserRole = async (userId: string, role: string) => {
    await updateById("users", userId, { role })
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestioná la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Usuarios", value: stats.totalUsers, color: "text-blue-500" },
          { icon: Trophy, label: "Equipos", value: stats.totalTeams, color: "text-green-500" },
          { icon: Calendar, label: "Publicaciones", value: stats.totalPosts, color: "text-orange-500" },
          { icon: Star, label: "Premium", value: stats.premiumUsers, color: "text-purple-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
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
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="suspended">Suspendidos</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(u.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{u.username} · {u.role}</p>
                      </div>
                      {u.is_suspended && <Badge variant="destructive">Suspendido</Badge>}
                      {u.subscription_tier === "premium" && <Badge variant="default">Premium</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(u.id, !u.is_suspended)}
                      >
                        {u.is_suspended ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-destructive" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserRole(u.id, u.role === "admin" ? "player" : "admin")}
                      >
                        <Shield className={`h-4 w-4 ${u.role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="premium">
              {users.filter((u) => u.subscription_tier === "premium").length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay usuarios premium</p>
              ) : (
                users.filter((u) => u.subscription_tier === "premium").map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{getInitials(u.full_name)}</AvatarFallback></Avatar>
                      <p className="text-sm font-medium">{u.full_name}</p>
                    </div>
                    <Badge>Premium</Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="suspended">
              {users.filter((u) => u.is_suspended).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay usuarios suspendidos</p>
              ) : (
                users.filter((u) => u.is_suspended).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{getInitials(u.full_name)}</AvatarFallback></Avatar>
                      <p className="text-sm font-medium">{u.full_name}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id, false)}>
                      Reactivar
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
