"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-client"
import { query, findById, findAll, insert, updateById, count } from "@/lib/db-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Plus, Loader2, Send, Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { POSITIONS, CATEGORIES } from "@/lib/constants"
import type { Opportunity, Team, User } from "@/lib/types"

export default function OpportunitiesPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<(Opportunity & { team?: Team })[]>([])
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    team_id: "",
    position: "",
    date: "",
    category: "",
    location: "",
    description: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    if (user) {
      const teams = await findAll("teams", { where: "created_by = $1", params: [user.id] })
      setMyTeams((teams || []) as any)
    }

    const data = await query("SELECT o.*, row_to_json(t.*) as team FROM opportunities o JOIN teams t ON t.id = o.team_id WHERE o.is_active = true ORDER BY o.created_at DESC")
    setOpportunities((data || []) as any)
    setLoading(false)
  }

  const createOpportunity = async () => {
    if (!user || !form.team_id) return

    setCreating(true)
    await insert("opportunities", {
      team_id: form.team_id,
      position: form.position,
      date: form.date,
      category: form.category,
      location: form.location,
      description: form.description,
      is_active: true,
    })
    setCreating(false)
    setForm({ team_id: "", position: "", date: "", category: "", location: "", description: "" })
    loadData()
  }

  const applyToOpportunity = async (opportunityId: string) => {
    if (!user) return

    await insert("opportunity_applications", {
      opportunity_id: opportunityId,
      player_id: user.id,
      message: "Me interesa esta oportunidad",
      status: "pending",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground">Equipos buscando jugadores como vos</p>
        </div>
        {myTeams.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Publicar oportunidad</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva oportunidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Equipo</Label>
                  <Select value={form.team_id} onValueChange={(v) => setForm({ ...form, team_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná equipo" /></SelectTrigger>
                    <SelectContent>
                      {myTeams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Posición</Label>
                  <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná posición" /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Montevideo, cancha X" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalles de la búsqueda..." />
                </div>
                <Button onClick={createOpportunity} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Publicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
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
                  <Button size="sm" onClick={() => applyToOpportunity(opp.id)} className="shrink-0">
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
