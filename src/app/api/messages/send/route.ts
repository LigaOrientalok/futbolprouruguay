import { NextResponse } from "next/server"
import { query, updateById } from "@/lib/db"
import { pusherServer } from "@/lib/pusher/server"
import { getCurrentUser } from "@/lib/auth-server"
import { validateOrigin } from "@/lib/csrf"

interface ChatRow {
  participants: string[]
}

interface MessageRow {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export async function POST(req: Request) {
  try {
    const csrf = validateOrigin(req)
    if (csrf) return csrf
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { chatId, content } = await req.json()
    if (!chatId || !content?.trim()) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const chats = await query<ChatRow>(
      "SELECT participants FROM chats WHERE id = $1",
      [chatId]
    )
    if (!chats?.[0]) {
      return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 })
    }
    if (!chats[0].participants?.includes(user.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const result = await query<MessageRow>(
      `INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [chatId, user.id, content.trim()]
    )
    const message = result[0]

    await updateById("chats", chatId, {
      last_message: content.trim(),
      last_message_at: new Date().toISOString(),
    })

    await pusherServer.trigger(`chat-${chatId}`, "new-message", {
      ...message,
      sender_id: user.id,
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}
