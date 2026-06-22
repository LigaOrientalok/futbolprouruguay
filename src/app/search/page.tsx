"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { query } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Filter, X, MessageCircle } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { POSITIONS, CATEGORIES, LEVELS, AVAILABILITIES } from "@/lib/constants"
import type { User, PlayerProfile } from "@/lib/types"

export default function SearchPage() {
  const [results, setResults] = useState<(User & { profile?: PlayerProfile })[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const [filters, setFilters] = useState({
    query: "",
    position: "",
    category: "",
    level: "",
    availability: "",
    city: "",
  })

  useEffect(() => {
    searchPlayers()
  }, [filters.category, filters.level, filters.availability, filters.position])

  async function searchPlayers() {
    setLoading(true)

    let sql = `SELECT u.*, row_to_json(pp.*) as profile FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id WHERE u.role != 'admin'`
    const conditions: string[] = []

    if (filters.position) {
      conditions.push(`(pp.main_position = '${filters.position}' OR pp.secondary_positions @> ARRAY['${filters.position}'])`)
    }
    if (filters.category) {
      conditions.push(`pp.category = '${filters.category}'`)
    }
    if (filters.level) {
      conditions.push(`pp.level = '${filters.level}'`)
    }
    if (filters.availability) {
      conditions.push(`pp.availability = '${filters.availability}'`)
    }
    if (filters.city) {
      conditions.push(`pp.city ILIKE '%${filters.city}%'`)
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(" AND ")}`
    }

    sql += ` ORDER BY u.subscription_tier DESC LIMIT 50`

    const data = await query(sql)
    let filtered = (Array.isArray(data) ? data : []).map((u: any) => ({
      ...u,
      profile: typeof u.profile === "string" ? JSON.parse(u.profile) : u.profile
    }))

    if (filters.query) {
      const q = filters.query.toLowerCase()
      filtered = filtered.filter((u: any) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.profile?.city?.toLowerCase().includes(q)
      )
    }

    setResults(filtered as any)
    setLoading(false)
  }

  const clearFilters = () => {
    setFilters({ query: "", position: "", category: "", level: "", availability: "", city: "" })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buscar jugadores</h1>
        <p className="text-muted-foreground">Encontrá jugadores por posición, ubicación y nivel</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, usuario o ciudad..."
            className="pl-9"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && searchPlayers()}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />Limpiar
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Select value={filters.position} onValueChange={(v) => setFilters({ ...filters, position: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Posición" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Nivel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.availability} onValueChange={(v) => setFilters({ ...filters, availability: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Disponibilidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {AVAILABILITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Ciudad"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron jugadores con esos filtros</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((user: any) => {
            const profile = user.profile as PlayerProfile | null
            return (
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
                      {profile && (
                        <>
                          <p className="text-xs text-muted-foreground">{profile.main_position}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {profile.city}{profile.neighborhood ? `, ${profile.neighborhood}` : ""}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="text-[10px]">{profile.category}</Badge>
                            <Badge variant="outline" className="text-[10px]">{profile.level}</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
