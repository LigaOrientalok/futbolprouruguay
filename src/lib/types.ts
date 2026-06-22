export type UserRole = "player" | "captain" | "admin"
export type Position = "Arquero" | "Defensa Central" | "Lateral Derecho" | "Lateral Izquierdo" | "Mediocentro" | "Volante de Creación" | "Extremo Derecho" | "Extremo Izquierdo" | "Delantero Centro" | "Segundo Delantero"
export type Category = "+18" | "+30" | "+40"
export type Level = "Principiante" | "Intermedio" | "Avanzado"
export type Availability = "Mañana" | "Tarde" | "Noche" | "Fin de Semana" | "Flexible"
export type Leg = "Derecha" | "Izquierda" | "Ambas"
export type SubscriptionTier = "free" | "premium"
export type ApplicationStatus = "pending" | "approved" | "rejected"
export type ChallengeStatus = "open" | "accepted" | "completed" | "cancelled"
export type MatchRequestStatus = "open" | "closed"

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  subscription_tier: SubscriptionTier
  is_verified: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface PlayerProfile {
  id: string
  user_id: string
  age: number
  main_position: Position
  secondary_positions: Position[]
  city: string
  neighborhood: string
  preferred_leg: Leg
  height_cm: number
  weight_kg: number
  availability: Availability
  category: Category
  level: Level
  description: string
  social_instagram: string | null
  social_twitter: string | null
  social_facebook: string | null
  social_whatsapp: string | null
  video_urls: string[]
  is_captain: boolean
  weekly_applications: number
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  slug: string
  badge_url: string | null
  city: string
  neighborhood: string
  category: Category
  description: string
  player_count: number
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "captain" | "player" | "delegate"
  joined_at: string
}

export interface TeamNeed {
  id: string
  team_id: string
  position: Position
  description: string
  is_active: boolean
  created_at: string
}

export interface PlayerApplication {
  id: string
  player_id: string
  team_id: string
  team_need_id: string | null
  message: string
  status: ApplicationStatus
  created_at: string
}

export interface Opportunity {
  id: string
  team_id: string
  position: Position
  date: string
  category: Category
  location: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OpportunityApplication {
  id: string
  opportunity_id: string
  player_id: string
  message: string
  status: ApplicationStatus
  created_at: string
}

export interface Challenge {
  id: string
  team_id: string
  opponent_team_id: string | null
  date: string
  time: string
  category: Category
  zone: string
  location_type: "home" | "neutral" | "away"
  description: string
  status: ChallengeStatus
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_urls: string[]
  video_url: string | null
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Chat {
  id: string
  participants: string[]
  last_message: string | null
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: SubscriptionTier
  status: "active" | "canceled" | "past_due"
  current_period_start: string
  current_period_end: string
  created_at: string
}

export interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  description: string
  is_active: boolean
  created_at: string
}

export interface Badge {
  id: string
  user_id: string
  type: "player_of_week" | "most_active" | "captain" | "premium" | "veteran"
  awarded_at: string
}

export interface PlayerRanking {
  user_id: string
  full_name: string
  avatar_url: string | null
  score: number
  position: string
  city: string
  badges_count: number
  rank: number
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  status: "pending" | "reviewed" | "resolved"
  created_at: string
}
