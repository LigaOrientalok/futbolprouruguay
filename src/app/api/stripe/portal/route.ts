import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { findAll } from "@/lib/db"
import { validateOrigin } from "@/lib/csrf"

export async function POST(req: Request) {
  try {
    const csrf = validateOrigin(req)
    if (csrf) return csrf
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const subscriptions = await findAll<{ stripe_customer_id: string | null }>("subscriptions", {
      where: "user_id = $1",
      params: [user.id],
    })
    const subscription = subscriptions[0]

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Sin suscripción activa" },
        { status: 400 }
      )
    }

    const { default: Stripe } = await import("stripe")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/premium`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      { error: "Error al crear portal de facturación" },
      { status: 500 }
    )
  }
}
