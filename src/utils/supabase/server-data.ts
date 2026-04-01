import { createServerSupabaseClient } from './server-only'
import type { 
  SiteSettings, 
  MarqueeItem, 
  VideoItem, 
  FAQItem, 
  Service, 
  FeatureCard, 
  HomeServiceCard,
  StaffMember,
  Lead,
  Project,
  Task,
  LMSCourse,
  LMSVideo,
  Client,
  PaymentSettings
} from '@/types/database'

export { createServerSupabaseClient }
export type { SiteSettings, MarqueeItem, VideoItem, FAQItem, Service, FeatureCard, HomeServiceCard }

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


export async function getHomeServiceCards(): Promise<HomeServiceCard[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('home_service_cards')
    .select('*')
    // We only filter by active on the frontend if needed, or we can fetch all for admin
    // For admin, we need all. It's better to fetch all and filter in the client component or pass a flag.
    // However, this file is mostly used by server components like `page.tsx` pulling active ones.
    // Let's just pull all ordered by 'order' and let the caller filter `is_active === true` if they want.
    .order('order', { ascending: true })

  if (error) {
    return []
  }

  return data as HomeServiceCard[]
}
