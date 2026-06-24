"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAdminStats, getUsers, toggleUserSuspend, toggleUserRole } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Calendar, Star, Shield, Ban, CheckCircle } from "lucide-react"
import { getInitials } from "@/lib/utils"

export default function AdminPage() {
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  })

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getUsers(),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => toggleUserSuspend(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  })

  const toggleRoleMutation = useMutation({
    mutationFn: (userId: string) => toggleUserRole(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  })

  if (isLoading) {
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
          { icon: Users, label: "Usuarios", value: stats?.totalUsers ?? 0, color: "text-blue-500" },
          { icon: Trophy, label: "Equipos", value: stats?.totalTeams ?? 0, color: "text-green-500" },
          { icon: Calendar, label: "Publicaciones", value: stats?.totalPosts ?? 0, color: "text-orange-500" },
          { icon: Star, label: "Premium", value: stats?.premiumUsers ?? 0, color: "text-purple-500" },
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
                        onClick={() => toggleStatusMutation.mutate(u.id)}
                      >
                        {u.is_suspended ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-destructive" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRoleMutation.mutate(u.id)}
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
                    <Button size="sm" variant="outline" onClick={() => toggleStatusMutation.mutate(u.id)}>
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
