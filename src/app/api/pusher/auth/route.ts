import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher/server"
import { getCurrentUser } from "@/lib/auth-server"
import { validateOrigin } from "@/lib/csrf"

export async function POST(req: Request) {
  try {
    const csrf = validateOrigin(req)
    if (csrf) return csrf
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const socketId = formData.get("socket_id") as string
    const channelName = formData.get("channel_name") as string

    const auth = pusherServer.authorizeChannel(socketId, channelName)

    return NextResponse.json(auth)
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 })
  }
}
