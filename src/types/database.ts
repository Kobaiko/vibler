export type UserRole = 'admin' | 'member' | 'viewer'
export type FunnelStatus = 'draft' | 'active' | 'paused' | 'archived'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: UserRole
  invited_by?: string
  joined_at: string
}

export interface ICP {
  id: string
  team_id: string
  created_by: string
  name: string
  description?: string
  demographics?: Record<string, any>
  psychographics?: Record<string, any>
  pain_points?: string[]
  goals?: string[]
  preferred_channels?: string[]
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: string
  team_id: string
  created_by: string
  icp_id?: string
  name: string
  description?: string
  objectives?: string[]
  tactics?: Record<string, any>
  budget_allocation?: Record<string, any>
  timeline?: Record<string, any>
  kpis?: string[]
  created_at: string
  updated_at: string
}

export interface Funnel {
  id: string
  team_id: string
  created_by: string
  strategy_id?: string
  icp_id?: string
  name: string
  description?: string
  status: FunnelStatus
  stages: any[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreativeAsset {
  id: string
  team_id: string
  created_by: string
  funnel_id?: string
  strategy_id?: string
  name: string
  type: string
  content?: Record<string, any>
  file_url?: string
  file_size?: number
  file_type?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  team_id: string
  funnel_id?: string
  strategy_id?: string
  metric_name: string
  metric_value?: number
  metric_type: string
  period_start: string
  period_end: string
  metadata?: Record<string, any>
  recorded_at: string
}

export interface Subscription {
  id: string
  team_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: SubscriptionStatus
  plan_name: string
  plan_price?: number
  current_period_start?: string
  current_period_end?: string
  trial_end?: string
  created_at: string
  updated_at: string
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      teams: {
        Row: Team
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>
      }
      team_members: {
        Row: TeamMember
        Insert: Omit<TeamMember, 'id' | 'joined_at'>
        Update: Partial<Omit<TeamMember, 'id' | 'joined_at'>>
      }
      icps: {
        Row: ICP
        Insert: Omit<ICP, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ICP, 'id' | 'created_at' | 'updated_at'>>
      }
      strategies: {
        Row: Strategy
        Insert: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Strategy, 'id' | 'created_at' | 'updated_at'>>
      }
      funnels: {
        Row: Funnel
        Insert: Omit<Funnel, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Funnel, 'id' | 'created_at' | 'updated_at'>>
      }
      creative_assets: {
        Row: CreativeAsset
        Insert: Omit<CreativeAsset, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CreativeAsset, 'id' | 'created_at' | 'updated_at'>>
      }
      analytics: {
        Row: Analytics
        Insert: Omit<Analytics, 'id' | 'recorded_at'>
        Update: Partial<Omit<Analytics, 'id' | 'recorded_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
} 