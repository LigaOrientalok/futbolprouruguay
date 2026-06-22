"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { findById, findAll, insert, query } from "@/lib/db"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, Calendar, MessageCircle, Loader2, ArrowLeft, Send, UserPlus } from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"
import { POSITIONS } from "@/lib/constants"
import type { Team, TeamMember, TeamNeed, User } from "@/lib/types"

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<(TeamMember & { user?: User })[]>([])
  const [needs, setNeeds] = useState<TeamNeed[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newNeedPosition, setNewNeedPosition] = useState("")
  const [newNeedDesc, setNewNeedDesc] = useState("")
  const [applicationMsg, setApplicationMsg] = useState("")
  const [showApply, setShowApply] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadTeam()
  }, [id])

  async function loadTeam() {
    const teamData = await findById<Team>("teams", id as string)
    if (!teamData) { router.push("/teams"); return }
    setTeam(teamData)

    const membersData = await findAll<TeamMember>("team_members", { where: "team_id = $1", params: [id] })
    const userIds = [...new Set((membersData || []).map((m) => m.user_id))]
    const userMap = new Map<string, User>()
    if (userIds.length > 0) {
      const usersResult = await query<User>("SELECT * FROM users WHERE id = ANY($1::uuid[])", [userIds])
      for (const u of usersResult) {
        userMap.set(u.id, u)
      }
    }
    const membersWithUsers = (membersData || []).map((m) => ({ ...m, user: userMap.get(m.user_id) })) as any
    setMembers(membersWithUsers)

    if (user) {
      setIsMember(membersData?.some((m) => m.user_id === user.id) || false)
    }

    const needsData = await findAll<TeamNeed>("team_needs", { where: "team_id = $1 AND is_active = $2", params: [id, true] })
    setNeeds(needsData || [])
    setLoading(false)
  }

  const addNeed = async () => {
    if (!newNeedPosition || !user) return
    await insert("team_needs", {
      team_id: id,
      position: newNeedPosition,
      description: newNeedDesc,
      is_active: true,
    })
    setNewNeedPosition("")
    setNewNeedDesc("")
    loadTeam()
  }

  const applyToTeam = async () => {
    if (!user) return
    await insert("player_applications", {
      player_id: user.id,
      team_id: id,
      message: applicationMsg,
      status: "pending",
    })
    setShowApply(false)
    setApplicationMsg("")
  }

  if (loading || !team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/teams"><ArrowLeft className="h-4 w-4 mr-2" />Volver a equipos</Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {team.name[0]}
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
            <Button onClick={applyToTeam}><Send className="h-4 w-4 mr-2" />Enviar solicitud</Button>
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
                <Button size="sm" onClick={addNeed}>Agregar</Button>
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
