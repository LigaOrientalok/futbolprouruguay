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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe no configurado" }, { status: 500 })
    }
    const { default: Stripe } = await import("stripe")
    const stripe = new Stripe(stripeSecretKey)

    // Crear o recuperar customer de Stripe
    const subscriptions = await findAll<{ id: string; stripe_customer_id: string | null }>("subscriptions", {
      where: "user_id = $1",
      params: [user.id],
    })
    const subscription = subscriptions[0]

    let customerId: string | null | undefined = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "FutbolMatch Premium",
              description: "Perfil destacado, postulaciones ilimitadas y estadísticas avanzadas",
            },
            unit_amount: 999, // $9.99 USD
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/premium?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/premium?canceled=true`,
      metadata: { user_id: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Error al crear sesión de pago" },
      { status: 500 }
    )
  }
}
