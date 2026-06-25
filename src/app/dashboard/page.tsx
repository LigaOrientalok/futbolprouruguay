import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth-server"
import { query } from "@/lib/db"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentFeed } from "@/components/dashboard/recent-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PremiumUpsell } from "@/components/dashboard/premium-upsell"
import { AdminCard } from "@/components/dashboard/admin-card"
import DashboardLoading from "./loading"
import type { Post } from "@/lib/types"

interface CountResult { count: number }

async function getUserStats() {
  const [players, teams, opportunities, challenges] = await Promise.all([
    query<CountResult>("SELECT COUNT(*) as count FROM users"),
    query<CountResult>("SELECT COUNT(*) as count FROM teams"),
    query<CountResult>("SELECT COUNT(*) as count FROM opportunities"),
    query<CountResult>("SELECT COUNT(*) as count FROM challenges"),
  ])

  return {
    players: Number(players[0]?.count) || 0,
    teams: Number(teams[0]?.count) || 0,
    opportunities: Number(opportunities[0]?.count) || 0,
    challenges: Number(challenges[0]?.count) || 0,
  }
}

async function getRecentPosts(limit = 5) {
  return await query<Post>(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT $1",
    [limit]
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Iniciá sesión para ver el dashboard</p>
      </div>
    )
  }

  const [stats, recentPosts] = await Promise.all([
    getUserStats(),
    getRecentPosts(5),
  ])

  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent
          user={user}
          stats={stats}
          recentPosts={recentPosts}
        />
      </Suspense>
    </div>
  )
}

async function DashboardContent({
  user,
  stats,
  recentPosts,
}: {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  stats: Awaited<ReturnType<typeof getUserStats>>
  recentPosts: Awaited<ReturnType<typeof getRecentPosts>>
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">Panel principal de FutbolMatch Uruguay</p>
        </div>
      </div>

      <StatsCards initialStats={stats} />

      <AdminCard />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentFeed posts={recentPosts} />
        <QuickActions />
      </div>

      {user.subscription_tier === "free" && <PremiumUpsell />}
    </>
  )
}
