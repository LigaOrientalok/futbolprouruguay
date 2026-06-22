"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { findAll } from "@/lib/db-client"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Users } from "lucide-react"
import type { Team } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    loadTeams()
  }, [categoryFilter])

  async function loadTeams() {
    setLoading(true)
    const opts: any = { orderBy: "created_at DESC" }
    if (categoryFilter) {
      opts.where = "category = $1"
      opts.params = [categoryFilter]
    }
    const data = await findAll<Team>("teams", opts)
    setTeams(data || [])
    setLoading(false)
  }

  const filteredTeams = teams.filter((team) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      team.name.toLowerCase().includes(q) ||
      team.city.toLowerCase().includes(q) ||
      team.neighborhood?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Equipos</h1>
          <p className="text-muted-foreground">Encontrá equipos en tu zona</p>
        </div>
        <Button asChild>
          <Link href="/teams/new"><Plus className="h-4 w-4 mr-2" />Crear equipo</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium">No hay equipos</h2>
          <p className="text-muted-foreground">Sé el primero en crear un equipo</p>
          <Button asChild className="mt-4"><Link href="/teams/new">Crear equipo</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {team.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{team.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {team.city}{team.neighborhood ? `, ${team.neighborhood}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{team.category}</Badge>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{team.player_count}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
