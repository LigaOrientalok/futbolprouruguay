"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { insert } from "@/lib/db-client"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CATEGORIES } from "@/lib/constants"
import { slugify } from "@/lib/utils"

export default function NewTeamPage() {
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user) return

    try {
      await insert("teams", {
        name,
        slug: slugify(name),
        city,
        neighborhood,
        category,
        description,
        player_count: 1,
        created_by: user.id,
        is_active: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el equipo")
      setLoading(false)
      return
    }

    router.push("/teams")
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teams"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Crear equipo</h1>
          <p className="text-muted-foreground">Completá los datos de tu equipo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del equipo</CardTitle>
          <CardDescription>Estos datos serán visibles para todos los usuarios</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del equipo *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Los Gladiadores" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Montevideo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Barrio / Zona</Label>
                <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Pocitos" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger><SelectValue placeholder="Seleccioná la categoría" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contá sobre tu equipo, su historia, objetivos..." rows={4} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creando..." : "Crear equipo"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
