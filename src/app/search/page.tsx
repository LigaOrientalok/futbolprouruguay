"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUsers, getAllProfiles } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getInitials } from "@/lib/utils"
import Link from "next/link"
import type { Position, Category } from "@/lib/types"

const POSITIONS: Position[] = [
  "Arquero", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo",
  "Mediocentro", "Volante de Creación", "Extremo Derecho", "Extremo Izquierdo",
  "Delantero Centro", "Segundo Delantero",
]

const CATEGORIES: Category[] = ["+18", "+30", "+40"]

export default function SearchPage() {
  const [searchText, setSearchText] = useState("")
  const [position, setPosition] = useState("all")
  const [category, setCategory] = useState("all")

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(200),
  })

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getAllProfiles(),
  })

  const usersWithProfiles = useMemo(() => {
    return users.map(u => ({
      ...u,
      profile: profiles.find(p => p.user_id === u.id) ?? null,
    }))
  }, [users, profiles])

  const filtered = useMemo(() => {
    let list = usersWithProfiles

    if (searchText) {
      const q = searchText.toLowerCase()
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.profile?.city?.toLowerCase().includes(q)
      )
    }

    if (position && position !== "all") {
      list = list.filter(u => u.profile?.main_position === position)
    }

    if (category && category !== "all") {
      list = list.filter(u => u.profile?.category === category)
    }

    return list
  }, [usersWithProfiles, searchText, position, category])

  const isLoading = loadingUsers || loadingProfiles

  const totalWithProfile = users.filter(u => profiles.some(p => p.user_id === u.id)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buscar jugadores</h1>
          <p className="text-muted-foreground">{users.length} usuarios · {totalWithProfile} con perfil</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Ir al Dashboard</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, usuario o ciudad..."
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

        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Posición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las posiciones</SelectItem>
            {POSITIONS.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Edad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las edades</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState variant="search" />
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
                    {user.profile && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5">{user.profile.main_position}</Badge>
                        <Badge variant="secondary" className="text-[10px] h-5">{user.profile.category}</Badge>
                        {user.profile.city && (
                          <Badge variant="secondary" className="text-[10px] h-5">{user.profile.city}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
