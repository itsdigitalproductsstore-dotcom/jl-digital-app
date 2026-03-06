import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export interface SiteSettings {
  id: string
  site_name: string
  site_name_ar: string
  site_description: string
  site_description_ar: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  contact_email: string
  contact_phone: string
  address: string
  hero_title: string
  hero_title_ar: string
  hero_subtitle: string
  hero_subtitle_ar: string
  hero_cta_text: string
  hero_cta_text_ar: string
  currency_rates: {
    OMR: number
    SAR: number
    USD: number
    AED: number
  }
  partner_1: string
  partner_2: string
  origin_country: string
  created_at: string
  updated_at: string
}

export interface MarqueeItem {
  id: string
  text: string
  text_ar: string
  order: number
  is_active: boolean
  created_at: string
}

export interface VideoItem {
  id: string
  title: string
  title_ar: string
  description: string
  description_ar: string
  url: string
  thumbnail_url: string | null
  order: number
  is_active: boolean
  created_at: string
}

export interface FAQItem {
  question: string
  question_ar: string
  answer: string
  answer_ar: string
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error || !data) {
    return null
  }

  return data as SiteSettings
}

export async function getMarqueeItems(): Promise<MarqueeItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('marquee_items')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) {
    return []
  }

  return data as MarqueeItem[]
}

export async function getVideos(): Promise<VideoItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) {
    return []
  }

  return data as VideoItem[]
}

export async function getActivePages() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_visible', true)
    .order('order', { ascending: true })

  if (error) {
    return []
  }

  return data
}

export async function getFAQItems(): Promise<FAQItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('site_content')
    .select('faq_items')
    .eq('id', 'main')
    .single()

  if (error || !data || !data.faq_items) {
    return []
  }

  return data.faq_items as FAQItem[]
}

export type UserRole = 'owner' | 'admin' | 'staff' | 'client'

export interface StaffMember {
  id: string
  email: string
  full_name: string
  role: UserRole
  specialty: string | null
  is_active: boolean
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  service_interest: string | null
  budget: string | null
  notes: string | null
  status: 'new' | 'contacted' | 'proposal' | 'converted' | 'lost'
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  lead_id: string
  client_id: string
  service_slug: string
  package_type: 'basic' | 'pro' | 'enterprise'
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  start_date: string | null
  estimated_completion: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  assigned_to: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  hours_worked: number
  start_date: string
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export interface LMSCourse {
  id: string
  title: string
  title_ar: string
  description: string
  description_ar: string
  folder_id: string
  month_number: number
  is_active: boolean
  order: number
  created_at: string
}

export interface LMSVideo {
  id: string
  course_id: string
  title: string
  title_ar: string
  drive_embed_url: string
  duration_minutes: number
  order: number
  is_active: boolean
  created_at: string
}

export interface Client {
  id: string
  owner_id: string
  full_name: string
  email: string
  phone: string
  company: string | null
  source: string | null
  status: 'new' | 'in_progress' | 'closed' | 'lost'
  notes: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface PaymentSettings {
  stripe_enabled: boolean
  stripe_public_key: string
  stripe_secret_key: string
  paypal_enabled: boolean
  paypal_client_id: string
  paypal_secret: string
  bank_transfer_enabled: boolean
  bank_account_name: string
  bank_account_number: string
  bank_name: string
  bank_iban: string
  bank_swift: string
}

export interface Service {
  id: string
  slug: string
  title: string
  title_ar: string
  subtitle: string
  subtitle_ar: string
  description: string
  description_ar: string
  features: string[]
  features_ar: string[]
  pricing_basic: number
  pricing_pro: number
  pricing_enterprise: number
  timeline: string
  timeline_ar: string
  icon: string
  is_active: boolean
  order: number
  created_at: string
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) {
    return []
  }

  return data as Service[]
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Service
}

export interface FeatureCard {
  id: string
  title_ar: string
  description_ar: string
  badge_left_ar: string
  badge_right_ar: string
  icon_type: 'shuffler' | 'typewriter' | 'scheduler'
  accent_color: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getFeatureCards(): Promise<FeatureCard[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('features_cards')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    return []
  }

  return data as FeatureCard[]
}
