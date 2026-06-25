"use server"

import type { UserRow } from "./auth-server"
import { getCurrentUser } from "./auth-server"
import { query, findById, findAll, insert, updateById, remove } from "./db"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import type {
  User, Team, TeamMember, TeamNeed, PlayerProfile, PlayerApplication,
  Post, Comment, Opportunity, OpportunityApplication,
  Challenge, Chat, Message, Badge, PlayerRanking,
} from "./types"

function assertAuth(user: UserRow | null): asserts user is UserRow {
  if (!user) throw new Error("No autorizado")
}

function assertAdmin(user: UserRow | null): asserts user is UserRow {
  assertAuth(user)
  if (user.role !== "admin") throw new Error("Se requiere rol admin")
}

type CountRow = { count: number }

// ─── Auth ───────────────────────────────────────────────

export async function getMe() {
  return await getCurrentUser()
}

// ─── Users ──────────────────────────────────────────────

export async function getUserById(id: string) {
  return await findById<User>("users", id)
}

export async function getUsers(limit = 50) {
  return await query<User>("SELECT * FROM users ORDER BY created_at DESC LIMIT $1", [limit])
}

export async function getUserStats() {
  const [players, teams, opportunities, challenges] = await Promise.all([
    query<CountRow>("SELECT COUNT(*) as count FROM users"),
    query<CountRow>("SELECT COUNT(*) as count FROM teams"),
    query<CountRow>("SELECT COUNT(*) as count FROM opportunities"),
    query<CountRow>("SELECT COUNT(*) as count FROM challenges"),
  ])

  return {
    players: Number(players[0]?.count) || 0,
    teams: Number(teams[0]?.count) || 0,
    opportunities: Number(opportunities[0]?.count) || 0,
    challenges: Number(challenges[0]?.count) || 0,
  }
}

// ─── Posts ──────────────────────────────────────────────

export async function getRecentPosts(limit = 5) {
  return await query<Post>(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT $1", [limit]
  )
}

export async function getFeedPosts() {
  const data = await query<Post & { user: Record<string, unknown> }>(
    `SELECT p.*, row_to_json(u.*) as user
     FROM posts p JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC LIMIT 20`
  )
  return data.map(p => ({ ...p, user: p.user as unknown as User }))
}

export async function getPostComments(postIds: string[]) {
  if (postIds.length === 0) return []
  const placeholders = postIds.map((_, i) => `$${i + 1}`).join(",")
  const data = await query<Comment & { user: Record<string, unknown> }>(
    `SELECT c.*, row_to_json(u.*) as user
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.post_id IN (${placeholders}) ORDER BY c.created_at ASC`,
    postIds
  )
  return data.map(c => ({ ...c, user: c.user as unknown as User }))
}

export async function getUserLikes(userId: string, postIds: string[]) {
  if (postIds.length === 0) return []
  const placeholders = postIds.map((_, i) => `$${i + 1}`).join(",")
  return await query<{ post_id: string }>(
    `SELECT post_id FROM likes WHERE user_id = $${postIds.length + 1} AND post_id IN (${placeholders})`,
    [...postIds, userId]
  )
}

export async function createPost(content: string, imageUrls?: string[]) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("posts", {
    user_id: user.id,
    content,
    image_urls: imageUrls ?? [],
    video_url: null,
    likes_count: 0,
    comments_count: 0,
  })
  revalidatePath("/feed")
  revalidatePath("/dashboard")
}

export async function toggleLike(postId: string) {
  const user = await getCurrentUser()
  assertAuth(user)

  const existingLikes = await findAll<{ id: string }>("likes", {
    where: "post_id = $1 AND user_id = $2",
    params: [postId, user.id],
  })
  const existing = existingLikes?.[0]

  if (existing) {
    await query("DELETE FROM likes WHERE id = $1", [existing.id])
    await query("UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1", [postId])
  } else {
    await insert("likes", { post_id: postId, user_id: user.id })
    await query("UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1", [postId])
  }
  revalidatePath("/feed")
}

export async function addComment(postId: string, content: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("comments", { post_id: postId, user_id: user.id, content })
  await query("UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1", [postId])
  revalidatePath("/feed")
}

// ─── Teams ──────────────────────────────────────────────

export async function getTeams(options?: {
  where?: string
  params?: unknown[]
  orderBy?: string
  limit?: number
}) {
  return await findAll<Team>("teams", options)
}

export async function getTeamById(id: string) {
  return await findById<Team>("teams", id)
}

export async function getTeamMembers(teamId: string) {
  return await findAll<TeamMember>("team_members", {
    where: "team_id = $1", params: [teamId]
  })
}

export async function getTeamNeeds(teamId: string) {
  return await findAll<TeamNeed>("team_needs", {
    where: "team_id = $1 AND is_active = $2", params: [teamId, true]
  })
}

export async function getMultipleUsers(userIds: string[]) {
  if (userIds.length === 0) return []
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(",")
  return await query<User>(
    `SELECT * FROM users WHERE id IN (${placeholders})`,
    userIds
  )
}

export async function createTeam(data: {
  name: string; slug: string; city: string; neighborhood: string
  category: string; description: string; badge_url: string | null
}) {
  const user = await getCurrentUser()
  assertAuth(user)

  const team = await insert<Team>("teams", {
    ...data, created_by: user.id, is_active: true, player_count: 1,
  })

  if (team) {
    await insert<TeamMember>("team_members", {
      team_id: team.id, user_id: user.id, role: "captain",
    })
  }
  revalidatePath("/teams")
  return team
}

export async function updateTeamBadge(teamId: string, badgeUrl: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  const team = await findById<Team>("teams", teamId)
  if (!team || team.created_by !== user.id) throw new Error("No autorizado")
  await updateById("teams", teamId, { badge_url: badgeUrl })
  updateTag(`team-${teamId}`)
}

export async function deleteTeam(id: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  const team = await findById<Team>("teams", id)
  if (!team || team.created_by !== user.id) throw new Error("No autorizado")
  await remove("teams", id)
  revalidatePath("/teams")
  updateTag(`team-${id}`)
  redirect("/teams")
}

export async function addTeamNeed(teamId: string, position: string, description: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("team_needs", { team_id: teamId, position, description, is_active: true })
  revalidatePath(`/teams/${teamId}`)
}

export async function applyToTeam(teamId: string, message: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert<PlayerApplication>("player_applications", {
    player_id: user.id, team_id: teamId, message, status: "pending",
  })
}

// ─── Player Profile ─────────────────────────────────────

export async function getAllProfiles() {
  return await query<PlayerProfile>("SELECT * FROM player_profiles")
}

export async function getPlayerProfile(userId: string) {
  const profiles = await query<PlayerProfile>(
    "SELECT * FROM player_profiles WHERE user_id = $1", [userId]
  )
  return profiles[0] || null
}

export async function upsertPlayerProfile(userId: string, data: Partial<PlayerProfile>) {
  const user = await getCurrentUser()
  assertAuth(user)
  if (user.id !== userId) throw new Error("No autorizado")

  const existing = await getPlayerProfile(userId)
  if (existing) {
    await updateById("player_profiles", existing.id, data as Record<string, unknown>)
  } else {
    await insert("player_profiles", { ...data, user_id: userId } as Record<string, unknown>)
  }
  revalidatePath("/profile")
}

export async function getUserBadges(userId: string) {
  return await query<Badge>("SELECT * FROM badges WHERE user_id = $1", [userId])
}

// ─── Opportunities ──────────────────────────────────────

export async function getOpportunities() {
  const data = await query<Opportunity & { team: Record<string, unknown> }>(
    `SELECT o.*, row_to_json(t.*) as team
     FROM opportunities o JOIN teams t ON t.id = o.team_id
     WHERE o.is_active = true ORDER BY o.created_at DESC`
  )
  return data.map(o => ({ ...o, team: o.team as unknown as Team }))
}

export async function getUserTeams(userId: string) {
  return await findAll<Team>("teams", {
    where: "created_by = $1", params: [userId]
  })
}

export async function createOpportunity(data: {
  team_id: string; position: string; date: string
  category: string; location: string; description: string
}) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("opportunities", { ...data, is_active: true })
  revalidatePath("/opportunities")
}

export async function applyToOpportunity(opportunityId: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("opportunity_applications", {
    opportunity_id: opportunityId,
    player_id: user.id,
    message: "Me interesa esta oportunidad",
    status: "pending",
  })
}

// ─── Challenges ─────────────────────────────────────────

export async function getChallenges() {
  const data = await query<Challenge & { team: Record<string, unknown>; opponent_team: Record<string, unknown> | null }>(
    `SELECT c.*, row_to_json(t.*) as team, row_to_json(ot.*) as opponent_team
     FROM challenges c
     JOIN teams t ON t.id = c.team_id
     LEFT JOIN teams ot ON ot.id = c.opponent_team_id
     ORDER BY c.created_at DESC`
  )
  return data.map(c => ({
    ...c,
    team: c.team as unknown as Team,
    opponent_team: c.opponent_team ? (c.opponent_team as unknown as Team) : null,
  }))
}

export async function createChallenge(data: {
  team_id: string; date: string; time: string; category: string
  zone: string; location_type: string; description: string
}) {
  const user = await getCurrentUser()
  assertAuth(user)
  await insert("challenges", { ...data, status: "open" })
  revalidatePath("/challenges")
}

export async function acceptChallenge(challengeId: string, opponentTeamId: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  await updateById("challenges", challengeId, {
    opponent_team_id: opponentTeamId, status: "accepted",
  })
  revalidatePath("/challenges")
}

export async function cancelChallenge(challengeId: string) {
  const user = await getCurrentUser()
  assertAuth(user)
  const challenge = await findById<Challenge>("challenges", challengeId)
  if (!challenge) throw new Error("Desafío no encontrado")
  if (challenge.status === "accepted") {
    await updateById("challenges", challengeId, { status: "open", opponent_team_id: null })
  } else {
    await updateById("challenges", challengeId, { status: "cancelled" })
  }
  revalidatePath("/challenges")
}

// ─── Chat ───────────────────────────────────────────────

export async function getUserChats(userId: string) {
  return await query<Chat>(
    "SELECT * FROM chats WHERE $1 = ANY(participants) ORDER BY last_message_at DESC NULLS LAST",
    [userId]
  )
}

export async function getChatMessages(chatId: string) {
  return await findAll<Message>("messages", {
    where: "chat_id = $1", params: [chatId], orderBy: "created_at ASC",
  })
}

export async function findOrCreateChat(userId: string, otherUserId: string) {
  const existing = await query<Chat>(
    "SELECT * FROM chats WHERE $1 = ANY(participants) AND $2 = ANY(participants)",
    [userId, otherUserId]
  )
  if (existing?.[0]) return existing[0]
  return await insert<Chat>("chats", { participants: [userId, otherUserId] })
}

// ─── Rankings ──────────────────────────────────────────

export async function getRankingPlayers() {
  const data = await query<User & { profile: string | Record<string, unknown> }>(
    `SELECT u.*, row_to_json(pp.*) as profile
     FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id
     WHERE u.role != 'admin' ORDER BY u.subscription_tier DESC LIMIT 20`
  )
  return data.map(u => ({
    ...u,
    profile: typeof u.profile === "string" ? JSON.parse(u.profile) : u.profile,
  })) as (User & { profile?: PlayerProfile })[]
}

// ─── Admin ──────────────────────────────────────────────

export async function getAdminStats() {
  const [totalUsers, totalTeams, totalPosts, premiumUsers] = await Promise.all([
    query<CountRow>("SELECT COUNT(*) as count FROM users"),
    query<CountRow>("SELECT COUNT(*) as count FROM teams"),
    query<CountRow>("SELECT COUNT(*) as count FROM posts"),
    query<CountRow>("SELECT COUNT(*) as count FROM users WHERE subscription_tier = $1", ["premium"]),
  ])
  return {
    totalUsers: Number(totalUsers[0]?.count) || 0,
    totalTeams: Number(totalTeams[0]?.count) || 0,
    totalPosts: Number(totalPosts[0]?.count) || 0,
    premiumUsers: Number(premiumUsers[0]?.count) || 0,
  }
}

export async function toggleUserSuspend(userId: string) {
  const admin = await getCurrentUser()
  assertAdmin(admin)
  const target = await findById<UserRow>("users", userId)
  if (!target) throw new Error("Usuario no encontrado")
  await updateById("users", userId, { is_suspended: !target.is_suspended })
  revalidatePath("/admin")
}

export async function toggleUserRole(userId: string) {
  const admin = await getCurrentUser()
  assertAdmin(admin)
  const target = await findById<UserRow>("users", userId)
  if (!target) throw new Error("Usuario no encontrado")
  const newRole = target.role === "admin" ? "player" : "admin"
  await updateById("users", userId, { role: newRole })
  revalidatePath("/admin")
}

// ─── Search ─────────────────────────────────────────────

export async function getAllUsersWithProfiles() {
  const data = await query<User & { profile: string | Record<string, unknown> }>(
    `SELECT u.*, row_to_json(pp.*) as profile
     FROM users u LEFT JOIN player_profiles pp ON pp.user_id = u.id
     WHERE u.role != 'admin'
     ORDER BY u.subscription_tier DESC LIMIT 200`
  )
  return data.map(u => ({
    ...u,
    profile: typeof u.profile === "string" ? JSON.parse(u.profile) : u.profile,
  })) as (User & { profile?: PlayerProfile })[]
}
