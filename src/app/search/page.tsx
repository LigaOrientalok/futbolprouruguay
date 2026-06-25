"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllUsersWithProfiles } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Filter, X } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { POSITIONS, CATEGORIES, LEVELS, AVAILABILITIES } from "@/lib/constants"

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState({
    position: "all",
    category: "all",
    level: "all",
    availability: "all",
    city: "",
  })

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["users-with-profiles"],
    queryFn: () => getAllUsersWithProfiles(),
  })

  const filtered = useMemo(() => {
    let list = results

    if (filters.position && filters.position !== "all") {
      list = list.filter(u => u.profile?.main_position === filters.position)
    }
    if (filters.category && filters.category !== "all") {
      list = list.filter(u => u.profile?.category === filters.category)
    }
    if (filters.level && filters.level !== "all") {
      list = list.filter(u => u.profile?.level === filters.level)
    }
    if (filters.availability && filters.availability !== "all") {
      list = list.filter(u => u.profile?.availability === filters.availability)
    }
    if (filters.city) {
      const c = filters.city.toLowerCase()
      list = list.filter(u => u.profile?.city?.toLowerCase().includes(c))
    }
    if (searchText) {
      const q = searchText.toLowerCase()
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.profile?.city?.toLowerCase().includes(q)
      )
    }

    return list
  }, [results, filters, searchText])

  const clearFilters = () => {
    setFilters({ position: "all", category: "all", level: "all", availability: "all", city: "" })
    setSearchText("")
  }

  const hasActiveFilters = filters.position !== "all" || filters.category !== "all" || filters.level !== "all" || filters.availability !== "all" || filters.city !== "" || searchText !== ""

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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
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
              <Select value={filters.position} onValueChange={(v) => setFilters({ ...filters, position: v })}>
                <SelectTrigger><SelectValue placeholder="Posición" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })}>
                <SelectTrigger><SelectValue placeholder="Nivel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.availability} onValueChange={(v) => setFilters({ ...filters, availability: v })}>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron jugadores con esos filtros</p>
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
                    <p className="text-xs text-muted-foreground">{user.profile?.main_position || "Sin posición"}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {user.profile?.city || "Sin ubicación"}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.profile?.category && <Badge variant="secondary" className="text-[10px]">{user.profile.category}</Badge>}
                      {user.profile?.level && <Badge variant="outline" className="text-[10px]">{user.profile.level}</Badge>}
                    </div>
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
