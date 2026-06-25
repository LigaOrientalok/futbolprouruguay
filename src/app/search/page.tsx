"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import Link from "next/link"
import { getInitials } from "@/lib/utils"

export default function SearchPage() {
  const [searchText, setSearchText] = useState("")

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(200),
  })

  const filtered = useMemo(() => {
    if (!searchText) return users
    const q = searchText.toLowerCase()
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    )
  }, [users, searchText])

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Buscar jugadores</h1>
        <p className="text-destructive">Error al cargar usuarios. Revisá la consola.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buscar jugadores</h1>
          <p className="text-muted-foreground">Encontrá jugadores por nombre o usuario</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Ir al Dashboard</Link>
        </Button>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o usuario..."
          className="pl-9"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{users.length} usuarios cargados</p>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{users.length === 0 ? "No hay usuarios registrados" : "No se encontraron jugadores"}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((user) => (
                <Card key={user.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{user.full_name}</p>
                          {user.subscription_tier === "premium" && (
                            <Badge variant="default" className="text-[10px] h-5">Premium</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
