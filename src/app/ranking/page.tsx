"use client"

import { useQuery } from "@tanstack/react-query"
import { getRankingPlayers } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Medal, Star, TrendingUp, Award, MapPin, Target, Clock, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { getInitials } from "@/lib/utils"

export default function RankingPage() {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => getRankingPlayers(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ranking de Jugadores</h1>
          <p className="text-muted-foreground">Jugadores más activos y destacados de la comunidad</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Atrás</Link>
        </Button>
      </div>

      <Tabs defaultValue="top">
        <TabsList>
          <TabsTrigger value="top">Top Jugadores</TabsTrigger>
          <TabsTrigger value="recommended">Recomendados para vos</TabsTrigger>
          <TabsTrigger value="player-week">Jugador de la Semana</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, index) => {
              const profile = player.profile ?? null
              const isTop3 = index < 3
              const accentClass = index === 0
                ? "bg-yellow-500/5 border-yellow-500"
                : index === 1
                  ? "bg-gray-300/5 border-gray-400"
                  : index === 2
                    ? "bg-amber-700/5 border-amber-700"
                    : ""
              const rankBg = index === 0
                ? "bg-yellow-500"
                : index === 1
                  ? "bg-gray-400"
                  : index === 2
                    ? "bg-amber-700"
                    : "bg-primary"
              return (
                <Card key={player.id} className={`${isTop3 ? accentClass : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {index === 0 && (
                          <div className="absolute -top-3 -left-3 z-10">
                            <Crown className="h-5 w-5 text-yellow-500" />
                          </div>
                        )}
                        <Avatar className={`h-14 w-14 ${isTop3 ? "ring-2 ring-offset-2" : ""} ${index === 0 ? "ring-yellow-500/50" : index === 1 ? "ring-gray-400/50" : index === 2 ? "ring-amber-700/50" : ""}`}>
                          <AvatarImage src={player.avatar_url || undefined} />
                          <AvatarFallback className="text-lg">{getInitials(player.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${rankBg}`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{player.full_name}</p>
                          {player.subscription_tier === "premium" && <Badge variant="default" className="text-[10px]">Premium</Badge>}
                          {index === 0 && <Medal className="h-4 w-4 text-yellow-500 shrink-0" />}
                          {index === 1 && <Medal className="h-4 w-4 text-gray-400 shrink-0" />}
                          {index === 2 && <Medal className="h-4 w-4 text-amber-700 shrink-0" />}
                        </div>
                        {profile && (
                          <>
                            <p className="text-xs text-muted-foreground mt-0.5">{profile.main_position}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {profile.city}
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
        </TabsContent>

        <TabsContent value="recommended" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Recomendaciones para tu equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.slice(0, 6).map((player) => {
              const profile = player.profile ?? null
                  return (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{player.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.main_position} · {profile?.city} · {profile?.availability}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {profile?.availability}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player-week" className="mt-4">
          <Card className="border-primary">
            <CardContent className="p-8 text-center">
              {players.length > 0 && (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm mb-6">
                    <Star className="h-4 w-4" />
                    <span className="font-semibold">Jugador de la Semana</span>
                  </div>
                  <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-yellow-500/30 animate-pulse-glow">
                    <AvatarImage src={players[0]?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{getInitials(players[0]?.full_name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{players[0]?.full_name}</h2>
                  <p className="text-muted-foreground">
                    {players[0]?.profile?.main_position} · {players[0]?.profile?.city}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Badge variant="secondary">{players[0]?.profile?.category}</Badge>
                    <Badge variant="secondary">{players[0]?.profile?.level}</Badge>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div className="text-center">
                      <Award className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                      <p>Jugador destacado</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p>Alta actividad</p>
                    </div>
                    <div className="text-center">
                      <Medal className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p>Top ranking</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
