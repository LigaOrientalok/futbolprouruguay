import { NextResponse } from "next/server"
import { query, findById, findAll, insert, updateById, remove, count, queryRaw } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-server"

const ALLOWED_TABLES = [
  "users", "teams", "team_needs", "team_applications",
  "posts", "likes", "comments",
  "chats", "messages",
  "opportunities", "opportunity_applications",
  "challenges", "challenge_participants",
  "player_ratings", "player_of_week",
  "notifications",
  "badges", "user_badges",
]

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { action, table, id, data, sql, params, options } = body

    if (!action) {
      return NextResponse.json({ error: "Falta action" }, { status: 400 })
    }

    if (table && !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Tabla no permitida" }, { status: 403 })
    }

    if (sql) {
      const normalized = sql.trim().toUpperCase()
      if (!normalized.startsWith("SELECT")) {
        return NextResponse.json({ error: "Solo SELECT permitido en query directa" }, { status: 403 })
      }
    }

    switch (action) {
      case "query": {
        const rows = await query(sql, params)
        return NextResponse.json({ data: rows })
      }
      case "findById": {
        const row = await findById(table, id)
        return NextResponse.json({ data: row })
      }
      case "findAll": {
        const rows = await findAll(table, options)
        return NextResponse.json({ data: rows })
      }
      case "insert": {
        const row = await insert(table, data)
        return NextResponse.json({ data: row })
      }
      case "updateById": {
        const row = await updateById(table, id, data)
        return NextResponse.json({ data: row })
      }
      case "remove": {
        const success = await remove(table, id)
        return NextResponse.json({ success })
      }
      case "count": {
        const total = await count(table, body.where, body.params)
        return NextResponse.json({ data: total })
      }
      case "queryRaw": {
        const rows = await queryRaw(sql, params)
        return NextResponse.json({ data: rows })
      }
      default:
        return NextResponse.json({ error: "Action no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("DB proxy error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
