import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { default: Stripe } = await import("stripe")
    const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY!)

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any
      const userId = session.metadata?.user_id

      if (userId && session.subscription) {
        // Actualizar suscripción en la DB
        await query(
          `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, tier, status, current_period_start, current_period_end)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (stripe_customer_id) DO UPDATE SET
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             tier = EXCLUDED.tier,
             status = EXCLUDED.status,
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end`,
          [
            userId,
            session.customer as string,
            session.subscription as string,
            "premium",
            "active",
            new Date().toISOString(),
            new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          ]
        )

        // Actualizar usuario a premium
        await query(
          "UPDATE users SET subscription_tier = $1 WHERE id = $2",
          ["premium", userId]
        )

        // Otorgar insignia premium
        await query(
          "INSERT INTO badges (user_id, type) VALUES ($1, $2) ON CONFLICT (user_id, type) DO NOTHING",
          [userId, "premium"]
        )
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any
      const customerId = subscription.customer as string

      const rows = await query<any>(
        "SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1",
        [customerId]
      )
      const userSub = rows[0]

      if (userSub) {
        const isActive =
          subscription.status === "active" || subscription.status === "trialing"

        await query(
          `UPDATE subscriptions SET status = $1, tier = $2, current_period_end = $3 WHERE stripe_customer_id = $4`,
          [
            isActive ? "active" : "canceled",
            isActive ? "premium" : "free",
            new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            customerId,
          ]
        )

        await query(
          "UPDATE users SET subscription_tier = $1 WHERE id = $2",
          [isActive ? "premium" : "free", userSub.user_id]
        )
      }
      break
    }
  }

  return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
