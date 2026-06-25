"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getOpportunities, getUserTeams, createOpportunity, applyToOpportunity } from "@/lib/actions"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Plus, Loader2, Send, Building2, AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { POSITIONS, CATEGORIES } from "@/lib/constants"
import type { Position, Category } from "@/lib/types"

const EMPTY_FORM = {
  team_id: "",
  position: "" as Position | "",
  date: "",
  category: "" as Category | "",
  location: "",
  description: "",
}

export default function OpportunitiesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => getOpportunities(),
  })

  const { data: myTeams = [] } = useQuery({
    queryKey: ["my-teams", user?.id],
    queryFn: () => getUserTeams(user!.id),
    enabled: !!user,
  })

  const handleCreate = async () => {
    if (!user || !form.team_id || !form.position || !form.date || !form.category || !form.location) {
      setError("Completá todos los campos obligatorios")
      return
    }
    setError("")
    setCreating(true)
    try {
      await createOpportunity({
        team_id: form.team_id,
        position: form.position,
        date: form.date,
        category: form.category,
        location: form.location,
        description: form.description,
      })
      setForm(EMPTY_FORM)
      setDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["opportunities"] })
    } catch {
      setError("Error al publicar la oportunidad. Intentá de nuevo.")
    } finally {
      setCreating(false)
    }
  }

  const handleApply = async (opportunityId: string) => {
    if (!user) return
    try {
      await applyToOpportunity(opportunityId)
      queryClient.invalidateQueries({ queryKey: ["opportunities"] })
    } catch {
      setError("Error al postularte. Intentá de nuevo.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground">Equipos buscando jugadores como vos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/"><Home className="h-4 w-4 mr-2" />Principal</Link>
          </Button>
          {myTeams.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Publicar oportunidad</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva oportunidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Equipo *</Label>
                  <Select value={form.team_id} onValueChange={(v) => setForm({ ...form, team_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná equipo" /></SelectTrigger>
                    <SelectContent>
                      {myTeams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Posición *</Label>
                  <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v as Position })}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná posición" /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                      <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ubicación *</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Montevideo, cancha X" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalles de la búsqueda..." />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Publicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay oportunidades disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{opp.team?.name}</span>
                    </div>
                    <h3 className="text-lg font-semibold">Buscamos {opp.position}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(opp.date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
                      <Badge variant="secondary">{opp.category}</Badge>
                    </div>
                    {opp.description && <p className="text-sm mt-2">{opp.description}</p>}
                  </div>
                  <Button size="sm" onClick={() => handleApply(opp.id)} className="shrink-0">
                    <Send className="h-4 w-4 mr-2" />Postularme
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
