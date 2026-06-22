"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { query, findById, insert, updateById } from "@/lib/db-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Camera, Save, User, Shield, Star, Trophy, Medal, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { POSITIONS, CATEGORIES, LEVELS, AVAILABILITIES, LEGS } from "@/lib/constants"
import type { User as UserType, PlayerProfile, Badge as BadgeType } from "@/lib/types"
import { uploadFiles } from "@/lib/uploadthing"

export default function ProfilePage() {
  const { user: authUser, refresh: refreshAuth } = useAuth()
  const [user, setUser] = useState<UserType | null>(null)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("view")
  const router = useRouter()

  // Form state
  const [form, setForm] = useState({
    age: 0,
    main_position: "",
    secondary_positions: [] as string[],
    city: "",
    neighborhood: "",
    preferred_leg: "",
    height_cm: 0,
    weight_kg: 0,
    availability: "",
    category: "",
    level: "",
    description: "",
    social_instagram: "",
    social_twitter: "",
    social_facebook: "",
    social_whatsapp: "",
    video_urls: [] as string[],
  })

  const loadProfile = useCallback(async () => {
    if (!authUser) { router.push("/auth/login"); return }
    try {
      const [userData, profileResult, userBadges] = await Promise.all([
        findById<UserType>("users", authUser.id),
        query<PlayerProfile>("SELECT * FROM player_profiles WHERE user_id = $1 LIMIT 1", [authUser.id]),
        query<BadgeType>("SELECT * FROM badges WHERE user_id = $1", [authUser.id]),
      ])
      setUser(userData)
      setBadges(userBadges || [])

      const profileData = profileResult?.[0] || null
      if (profileData) {
        setProfile(profileData)
        setForm({
          age: profileData.age || 0,
          main_position: profileData.main_position || "",
          secondary_positions: profileData.secondary_positions || [],
          city: profileData.city || "",
          neighborhood: profileData.neighborhood || "",
          preferred_leg: profileData.preferred_leg || "",
          height_cm: profileData.height_cm || 0,
          weight_kg: profileData.weight_kg || 0,
          availability: profileData.availability || "",
          category: profileData.category || "",
          level: profileData.level || "",
          description: profileData.description || "",
          social_instagram: profileData.social_instagram || "",
          social_twitter: profileData.social_twitter || "",
          social_facebook: profileData.social_facebook || "",
          social_whatsapp: profileData.social_whatsapp || "",
          video_urls: profileData.video_urls || [],
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
    setLoading(false)
  }, [authUser, router])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSave = async () => {
    if (!authUser) return
    setSaving(true)
    setSaveMessage(null)

    const profileData = {
      user_id: authUser.id,
      age: form.age,
      main_position: form.main_position,
      secondary_positions: form.secondary_positions,
      city: form.city,
      neighborhood: form.neighborhood,
      preferred_leg: form.preferred_leg,
      height_cm: form.height_cm,
      weight_kg: form.weight_kg,
      availability: form.availability,
      category: form.category,
      level: form.level,
      description: form.description,
      social_instagram: form.social_instagram || null,
      social_twitter: form.social_twitter || null,
      social_facebook: form.social_facebook || null,
      social_whatsapp: form.social_whatsapp || null,
      video_urls: form.video_urls,
    }

    try {
      if (profile) {
        await updateById("player_profiles", profile.id, profileData)
      } else {
        await insert("player_profiles", profileData)
      }

      setSaveMessage({ type: "success", text: "Perfil guardado correctamente" })
      const savedProfile = profile
        ? { ...profile, ...profileData }
        : { id: "tmp", ...profileData }

      setProfile(savedProfile as PlayerProfile)
      setTimeout(() => setActiveTab("view"), 600)
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveMessage({ type: "error", text: "Error al guardar. Intentá de nuevo." })
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const res = await uploadFiles("avatarUploader", { files: [file] })
      if (res?.[0]) {
        setUser(prev => prev ? { ...prev, avatar_url: res[0].url } : prev)
        await refreshAuth()
      }
    } catch (error) {
      console.error("Error al subir avatar", error)
    }
    setAvatarUploading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const badgeIcons: Record<string, React.ReactNode> = {
    player_of_week: <Star className="h-4 w-4 text-yellow-500" />,
    most_active: <Medal className="h-4 w-4 text-blue-500" />,
    captain: <Trophy className="h-4 w-4 text-primary" />,
    premium: <Shield className="h-4 w-4 text-purple-500" />,
    veteran: <Medal className="h-4 w-4 text-orange-500" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">{user ? getInitials(user.full_name) : "?"}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
            {avatarUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
          </label>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.full_name}</h1>
          <p className="text-muted-foreground">@{user?.username}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge) => (
              <Badge key={badge.id} variant="secondary" className="gap-1">
                {badgeIcons[badge.type]}
                {badge.type === "player_of_week" && "Jugador de la Semana"}
                {badge.type === "most_active" && "Más Activo"}
                {badge.type === "captain" && "Capitán"}
                {badge.type === "premium" && "Premium"}
                {badge.type === "veteran" && "Veterano"}
              </Badge>
            ))}
            {user?.subscription_tier === "premium" && (
              <Badge className="gap-1">
                <Shield className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={() => setActiveTab(activeTab === "edit" ? "view" : "edit")}>
          {activeTab === "edit" ? "Ver perfil" : "Editar perfil"}
        </Button>
      </div>

      {activeTab === "edit" ? (
        <Card>
          <CardHeader>
            <CardTitle>Editar perfil</CardTitle>
            <CardDescription>Completá tus datos para que los equipos te encuentren</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Edad</Label>
                <Input type="number" value={form.age || ""} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Posición principal</Label>
                <Select value={form.main_position} onValueChange={(v) => setForm({ ...form, main_position: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Montevideo" />
              </div>
              <div className="space-y-2">
                <Label>Barrio / Zona</Label>
                <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Pocitos" />
              </div>
              <div className="space-y-2">
                <Label>Pierna hábil</Label>
                <Select value={form.preferred_leg} onValueChange={(v) => setForm({ ...form, preferred_leg: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {LEGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nivel</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disponibilidad</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input type="number" value={form.height_cm || ""} onChange={(e) => setForm({ ...form, height_cm: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input type="number" value={form.weight_kg || ""} onChange={(e) => setForm({ ...form, weight_kg: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción personal</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contá sobre vos, tu experiencia, lo que buscás..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Redes sociales</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} placeholder="Instagram (opcional)" />
                <Input value={form.social_twitter} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} placeholder="Twitter (opcional)" />
                <Input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} placeholder="Facebook (opcional)" />
                <Input value={form.social_whatsapp} onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })} placeholder="WhatsApp (opcional)" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              {saveMessage && (
                <span className={`text-sm flex items-center gap-1 ${saveMessage.type === "success" ? "text-green-500" : "text-destructive"}`}>
                  {saveMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {saveMessage.text}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Información del jugador</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><span className="text-sm text-muted-foreground">Edad</span><p className="font-medium">{profile.age} años</p></div>
                  <div><span className="text-sm text-muted-foreground">Posición</span><p className="font-medium">{profile.main_position}</p></div>
                  <div><span className="text-sm text-muted-foreground">Ciudad</span><p className="font-medium">{profile.city}</p></div>
                  <div><span className="text-sm text-muted-foreground">Barrio</span><p className="font-medium">{profile.neighborhood}</p></div>
                  <div><span className="text-sm text-muted-foreground">Pierna hábil</span><p className="font-medium">{profile.preferred_leg}</p></div>
                </div>
                <div className="space-y-3">
                  <div><span className="text-sm text-muted-foreground">Categoría</span><p className="font-medium">{profile.category}</p></div>
                  <div><span className="text-sm text-muted-foreground">Nivel</span><p className="font-medium">{profile.level}</p></div>
                  <div><span className="text-sm text-muted-foreground">Disponibilidad</span><p className="font-medium">{profile.availability}</p></div>
                  <div><span className="text-sm text-muted-foreground">Altura / Peso</span><p className="font-medium">{profile.height_cm} cm / {profile.weight_kg} kg</p></div>
                </div>
                {profile.description && (
                  <div className="sm:col-span-2">
                    <span className="text-sm text-muted-foreground">Sobre mí</span>
                    <p className="mt-1">{profile.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Completá tu perfil para que los equipos te encuentren</p>
                <Button className="mt-4" onClick={() => setActiveTab("edit")}>Completar perfil</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
