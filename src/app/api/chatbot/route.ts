import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getCurrentUser } from "@/lib/auth-server"
import { validateOrigin } from "@/lib/csrf"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `Sos "FutbolBot", el asistente virtual de FutbolMatch Uruguay, una red social de fútbol amateur en Uruguay.
Tu rol es ayudar a los usuarios a usar la plataforma: encontrar jugadores, armar equipos, publicar oportunidades, desafíos, el ranking, el feed y el chat.
Respondé siempre en español rioplatense, de forma breve, clara y amigable. Si no sabés algo de la plataforma, sé honesto y sugiere consultar la documentación o al soporte.
Reglas:
- No inventes funciones ni datos de usuarios.
- No des consejos médicos, legales ni financieros.
- Si te piden acciones fuera de tu rol, redirigí amablemente a un ser humano.`

export async function POST(req: Request) {
  try {
    const csrf = validateOrigin(req)
    if (csrf) return csrf

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "El asistente no está configurado" },
        { status: 500 }
      )
    }

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const history = messages
      .slice(-10)
      .filter(
        (m): m is { role: "user" | "assistant"; content: string } =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ],
    })

    return new Response(stream.toReadableStream())
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      { error: "Error al conectar con el asistente" },
      { status: 500 }
    )
  }
}
