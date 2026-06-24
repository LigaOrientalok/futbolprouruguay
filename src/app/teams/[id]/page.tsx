"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTeamById, getTeamMembers, getTeamNeeds, getMultipleUsers, addTeamNeed, applyToTeam, updateTeamBadge } from "@/lib/actions"
import { useAuth } from "@/lib/auth-client"
import { uploadFiles } from "@/lib/uploadthing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, ArrowLeft, Send, UserPlus, Home, Upload } from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"
import { POSITIONS } from "@/lib/constants"
import type { Team, TeamMember, User } from "@/lib/types"

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [newNeedPosition, setNewNeedPosition] = useState("")
  const [newNeedDesc, setNewNeedDesc] = useState("")
  const [applicationMsg, setApplicationMsg] = useState("")
  const [showApply, setShowApply] = useState(false)
  const [badgeUploading, setBadgeUploading] = useState(false)

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: () => getTeamById(id),
  })

  const { data: members = [] } = useQuery({
    queryKey: ["team-members", id],
    queryFn: async () => {
      const data = await getTeamMembers(id)
      const userIds = [...new Set(data.map((m) => m.user_id))]
      const users = await getMultipleUsers(userIds)
      const userMap = new Map(users.map((u) => [u.id, u]))
      return data.map((m) => ({ ...m, user: userMap.get(m.user_id) })) as (TeamMember & { user?: User })[]
    },
    enabled: !!team,
  })

  const { data: needs = [] } = useQuery({
    queryKey: ["team-needs", id],
    queryFn: () => getTeamNeeds(id),
    enabled: !!team,
  })

  if (teamLoading || !team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const isMember = members.some((m) => m.user_id === user?.id)

  const handleBadgeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !team) return
    setBadgeUploading(true)
    try {
      const res = await uploadFiles("teamBadge", { files: [file] })
      const url = res?.[0]?.ufsUrl
      if (url) {
        await updateTeamBadge(team.id, url)
        queryClient.invalidateQueries({ queryKey: ["team", id] })
      }
    } catch {
      console.error("Error al subir escudo")
    }
    setBadgeUploading(false)
  }

  const handleAddNeed = async () => {
    if (!newNeedPosition || !user) return
    await addTeamNeed(id, newNeedPosition, newNeedDesc)
    setNewNeedPosition("")
    setNewNeedDesc("")
    queryClient.invalidateQueries({ queryKey: ["team-needs", id] })
  }

  const handleApply = async () => {
    if (!user) return
    await applyToTeam(id, applicationMsg)
    setShowApply(false)
    setApplicationMsg("")
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard"><Home className="h-4 w-4 mr-2" />Inicio</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teams"><ArrowLeft className="h-4 w-4 mr-2" />Volver a equipos</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16">
                {team.badge_url ? (
                  <AvatarImage src={team.badge_url} alt={team.name} />
                ) : null}
                <AvatarFallback className="text-primary font-bold text-2xl">
                  {team.name[0]}
                </AvatarFallback>
              </Avatar>
              {user?.id === team.created_by && (
                <Label
                  htmlFor="badge-upload"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  {badgeUploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                  <input
                    id="badge-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBadgeUpload}
                  />
                </Label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {team.city}{team.neighborhood ? `, ${team.neighborhood}` : ""}
                <Badge variant="secondary">{team.category}</Badge>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{team.player_count} jugadores</span>
              </div>
            </div>
            {!isMember && user && (
              <div className="flex gap-2">
                <Button onClick={() => setShowApply(!showApply)}>
                  <UserPlus className="h-4 w-4 mr-2" />Solicitar unirme
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showApply && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label>Mensaje para el equipo</Label>
            <Textarea value={applicationMsg} onChange={(e) => setApplicationMsg(e.target.value)} placeholder="Contá por qué querés unirte..." />
            <Button onClick={handleApply}><Send className="h-4 w-4 mr-2" />Enviar solicitud</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Plantel</TabsTrigger>
          <TabsTrigger value="needs">Necesidades</TabsTrigger>
          {team.description && <TabsTrigger value="info">Información</TabsTrigger>}
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay jugadores en este equipo aún</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar>
                    <AvatarFallback>{member.user ? getInitials(member.user.full_name) : "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.user?.full_name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {member.role === "captain" ? "Capitán" : member.role === "delegate" ? "Delegado" : "Jugador"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="needs" className="space-y-4">
          {isMember && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium">Agregar necesidad</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Select value={newNeedPosition} onValueChange={setNewNeedPosition}>
                    <SelectTrigger><SelectValue placeholder="Posición" /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={newNeedDesc} onChange={(e) => setNewNeedDesc(e.target.value)} placeholder="Descripción (opcional)" />
                </div>
                <Button size="sm" onClick={handleAddNeed}>Agregar</Button>
              </CardContent>
            </Card>
          )}
          {needs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay necesidades registradas</p>
          ) : (
            needs.map((need) => (
              <Card key={need.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{need.position}</p>
                    {need.description && <p className="text-sm text-muted-foreground">{need.description}</p>}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/search?position=${need.position}`}>Buscar jugadores</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {team.description && (
          <TabsContent value="info">
            <Card>
              <CardContent className="p-4">
                <p>{team.description}</p>
                <p className="text-sm text-muted-foreground mt-4">Creado el {formatDate(team.created_at)}</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
