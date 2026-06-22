import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      subscription_tier: user.subscription_tier,
      is_suspended: user.is_suspended,
    },
  })
}
