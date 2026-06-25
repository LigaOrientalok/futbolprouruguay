"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getChallenges, getUserTeams, createChallenge, acceptChallenge, cancelChallenge } from "@/lib/actions"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Plus, Loader2, Swords, Check, X, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"
import Link from "next/link"

export default function ChallengesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    team_id: "",
    date: "",
    time: "",
    category: "",
    zone: "",
    location_type: "home" as "home" | "neutral",
    description: "",
  })

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => getChallenges(),
  })

  const { data: myTeams = [] } = useQuery({
    queryKey: ["my-teams", user?.id],
    queryFn: () => getUserTeams(user!.id),
    enabled: !!user,
  })

  const myTeamIds = myTeams.map(t => t.id)

  const handleCreate = async () => {
    if (!user || !form.team_id || !form.date || !form.time || !form.category || !form.zone) {
      setError("Completá todos los campos obligatorios")
      return
    }
    setError("")
    setCreating(true)
    try {
      await createChallenge(form)
      setForm({ team_id: "", date: "", time: "", category: "", zone: "", location_type: "home", description: "" })
      queryClient.invalidateQueries({ queryKey: ["challenges"] })
    } catch {
      setError("Error al publicar el desafío. Intentá de nuevo.")
    } finally {
      setCreating(false)
    }
  }

  const handleAccept = async (challengeId: string) => {
    if (!user) return
    const myTeam = myTeams[0]
    if (!myTeam) return
    setError("")
    try {
      await acceptChallenge(challengeId, myTeam.id)
      queryClient.invalidateQueries({ queryKey: ["challenges"] })
    } catch {
      setError("Error al aceptar el desafío.")
    }
  }

  const handleCancel = async (challengeId: string) => {
    setError("")
    try {
      await cancelChallenge(challengeId)
      queryClient.invalidateQueries({ queryKey: ["challenges"] })
    } catch {
      setError("Error al cancelar el desafío.")
    }
  }

  const isMyChallenge = (challenge: { team_id: string; opponent_team_id: string | null }) =>
    myTeamIds.includes(challenge.team_id) || (challenge.opponent_team_id != null && myTeamIds.includes(challenge.opponent_team_id))

  const openChallenges = challenges.filter(c => c.status === "open")
  const acceptedChallenges = challenges.filter(c => c.status === "accepted")
  const cancelledChallenges = challenges.filter(c => c.status === "cancelled")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Desafíos</h1>
          <p className="text-muted-foreground">Buscá rivales para amistosos o aceptá desafíos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/"><MapPin className="h-4 w-4 mr-2" />Principal</Link>
          </Button>
          {myTeams.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Publicar desafío</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo desafío</DialogTitle>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ubicación</Label>
                      <Select value={form.location_type} onValueChange={(v) => setForm({ ...form, location_type: v as "home" | "neutral" })}>
                        <SelectTrigger><SelectValue placeholder="Tipo de cancha" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Cancha propia</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Zona</Label>
                    <Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Centro, Costa, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalles del desafío..." />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button onClick={handleCreate} disabled={creating} className="w-full">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Publicar desafío
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && !creating && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Abiertos ({openChallenges.length})</TabsTrigger>
            <TabsTrigger value="accepted">Aceptados ({acceptedChallenges.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados ({cancelledChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4 mt-4">
            {openChallenges.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No hay desafíos abiertos
              </p>
            ) : (
              openChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Swords className="h-4 w-4 text-primary" />
                          <span className="font-medium">{challenge.team?.name}</span>
                          <Badge variant="secondary">{challenge.category}</Badge>
                        </div>
                        <p className="text-sm">Busca rival para amistoso</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(challenge.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{challenge.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{challenge.zone} · {challenge.location_type === "home" ? "Cancha propia" : "Neutral"}</span>
                        </div>
                        {challenge.description && <p className="text-xs mt-2 text-muted-foreground">{challenge.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {myTeams.length > 0 && (
                          <Button size="sm" onClick={() => handleAccept(challenge.id)}>
                            <Check className="h-4 w-4 mr-2" />Aceptar
                          </Button>
                        )}
                        {isMyChallenge(challenge) && (
                          <Button size="sm" variant="outline" onClick={() => handleCancel(challenge.id)}>
                            <X className="h-4 w-4 mr-2" />Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-4">
            {acceptedChallenges.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No hay desafíos aceptados aún
              </p>
            ) : (
              acceptedChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Swords className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{challenge.team?.name}</span>
                          <span className="text-muted-foreground"> vs </span>
                          <span className="font-medium">{challenge.opponent_team?.name || "Equipo rival"}</span>
                          <Badge variant="default">Aceptado</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(challenge.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{challenge.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{challenge.zone}</span>
                        </div>
                      </div>
                      {isMyChallenge(challenge) && (
                        <Button size="sm" variant="outline" onClick={() => handleCancel(challenge.id)}>
                          <X className="h-4 w-4 mr-2" />Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4 mt-4">
            {cancelledChallenges.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No hay desafíos cancelados
              </p>
            ) : (
              cancelledChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Swords className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{challenge.team?.name}</span>
                      {challenge.opponent_team && (
                        <>
                          <span className="text-muted-foreground"> vs </span>
                          <span className="font-medium">{challenge.opponent_team.name}</span>
                        </>
                      )}
                      <Badge variant="secondary">Cancelado</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(challenge.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{challenge.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
