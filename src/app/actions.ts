"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/utils/supabase/server-only";
import type { SiteSettings, MarqueeItem, VideoItem, FAQItem } from "@/utils/supabase/server-data";

export type { FAQItem };

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('site_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'default');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateCurrencyRates(rates: { OMR: number; SAR: number; USD: number; AED: number }) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('site_settings')
    .update({ currency_rates: rates, updated_at: new Date().toISOString() })
    .eq('id', 'default');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/checkout');
  return { success: true };
}

export async function uploadAsset(file: File, type: 'logo' | 'favicon') {
  const supabase = await createServerSupabaseClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${type}-${Date.now()}.${fileExt}`;
  const bucket = type === 'logo' ? 'logos' : 'favicons';

  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(fileName);

  const column = type === 'logo' ? 'logo_url' : 'favicon_url';

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ [column]: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', 'default');

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath('/');
  return { success: true, url: publicUrl };
}

export async function uploadServiceCardImage(file: File): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `service-card-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function addMarqueeItem(text: string, textAr: string) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('marquee_items')
    .select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('marquee_items')
    .insert({
      text,
      text_ar: textAr,
      order: (count || 0) + 1,
      is_active: true
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateMarqueeItem(id: string, text: string, textAr: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('marquee_items')
    .update({ text, text_ar: textAr })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteMarqueeItem(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('marquee_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleMarqueeItem(id: string, isActive: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('marquee_items')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function reorderMarqueeItems(items: { id: string; order: number }[]) {
  const supabase = await createServerSupabaseClient();

  for (const item of items) {
    const { error } = await supabase
      .from('marquee_items')
      .update({ order: item.order })
      .eq('id', item.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function addVideo(title: string, titleAr: string, description: string, descriptionAr: string, url: string) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('videos')
    .insert({
      title,
      title_ar: titleAr,
      description,
      description_ar: descriptionAr,
      url,
      order: (count || 0) + 1,
      is_active: true
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateVideo(id: string, title: string, titleAr: string, description: string, descriptionAr: string, url: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('videos')
    .update({ title, title_ar: titleAr, description, description_ar: descriptionAr, url })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteVideo(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleVideo(id: string, isActive: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('videos')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function togglePageVisibility(id: string, isVisible: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('pages')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateHeroContent(
  heroTitle: string,
  heroTitleAr: string,
  heroSubtitle: string,
  heroSubtitleAr: string,
  heroCtaText: string,
  heroCtaTextAr: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('site_settings')
    .update({
      hero_title: heroTitle,
      hero_title_ar: heroTitleAr,
      hero_subtitle: heroSubtitle,
      hero_subtitle_ar: heroSubtitleAr,
      hero_cta_text: heroCtaText,
      hero_cta_text_ar: heroCtaTextAr,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'default');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { success: true };
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  description: string;
  description_ar: string;
  features: string[];
  features_ar: string[];
  pricing_basic: number;
  pricing_pro: number;
  pricing_enterprise: number;
  timeline: string;
  timeline_ar: string;
  icon: string;
  is_active: boolean;
  order: number;
}

export async function addService(
  slug: string,
  title: string,
  titleAr: string,
  subtitle: string,
  subtitleAr: string,
  description: string,
  descriptionAr: string,
  features: string[],
  featuresAr: string[],
  pricingBasic: number,
  pricingPro: number,
  pricingEnterprise: number,
  timeline: string,
  timelineAr: string,
  icon: string
) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('services')
    .insert({
      slug,
      title,
      title_ar: titleAr,
      subtitle,
      subtitle_ar: subtitleAr,
      description,
      description_ar: descriptionAr,
      features,
      features_ar: featuresAr,
      pricing_basic: pricingBasic,
      pricing_pro: pricingPro,
      pricing_enterprise: pricingEnterprise,
      timeline,
      timeline_ar: timelineAr,
      icon,
      order: (count || 0) + 1,
      is_active: true
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/services');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateService(
  id: string,
  slug: string,
  title: string,
  titleAr: string,
  subtitle: string,
  subtitleAr: string,
  description: string,
  descriptionAr: string,
  features: string[],
  featuresAr: string[],
  pricingBasic: number,
  pricingPro: number,
  pricingEnterprise: number,
  timeline: string,
  timelineAr: string,
  icon: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('services')
    .update({
      slug,
      title,
      title_ar: titleAr,
      subtitle,
      subtitle_ar: subtitleAr,
      description,
      description_ar: descriptionAr,
      features,
      features_ar: featuresAr,
      pricing_basic: pricingBasic,
      pricing_pro: pricingPro,
      pricing_enterprise: pricingEnterprise,
      timeline,
      timeline_ar: timelineAr,
      icon
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/services');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/services');
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleService(id: string, isActive: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/services');
  revalidatePath('/admin');
  return { success: true };
}

export interface PaymentGateway {
  stripe_enabled: boolean;
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_secret: string;
  bank_transfer_enabled: boolean;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  bank_iban: string;
  bank_swift: string;
}

export async function updatePaymentSettings(settings: PaymentGateway) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('site_settings')
    .update({
      payment_settings: settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'default');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  revalidatePath('/checkout');
  return { success: true };
}

export async function inviteStaffMember(
  email: string,
  fullName: string,
  role: 'admin' | 'staff',
  specialty: string
) {
  const supabase = await createServerSupabaseClient();

  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    data: {
      full_name: fullName,
      role: role,
      specialty: specialty,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true, tempPassword };
}

export async function updateStaffMember(
  userId: string,
  fullName: string,
  specialty: string,
  isActive: boolean
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email: undefined,
    email_confirm: undefined,
    user_metadata: {
      full_name: fullName,
      specialty: specialty,
      is_active: isActive,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getStaffMembers() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return [];
  }

  return data.users
    .filter(u => u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'staff')
    .map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.user_metadata?.full_name || '',
      role: u.user_metadata?.role || 'staff',
      specialty: u.user_metadata?.specialty || '',
      isActive: u.user_metadata?.is_active !== false,
    }));
}

export async function createLead(
  fullName: string,
  email: string,
  phone: string,
  companyName: string,
  notes: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('leads')
    .insert({
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      notes,
      status: 'New',
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getLeads() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'contacted' | 'proposal' | 'converted' | 'lost',
  assignedTo?: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('leads')
    .update({
      status,
      assigned_to: assignedTo || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function assignLeadToStaff(leadId: string, staffId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('leads')
    .update({
      assigned_to: staffId,
      status: 'contacted',
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function createProject(
  leadId: string,
  clientId: string,
  serviceSlug: string,
  packageType: 'basic' | 'pro' | 'enterprise'
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('projects')
    .insert({
      lead_id: leadId,
      client_id: clientId,
      service_slug: serviceSlug,
      package_type: packageType,
      status: 'pending',
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getProjects() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*, leads(*), profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function createTask(
  projectId: string,
  assignedTo: string,
  title: string,
  description: string,
  dueDate: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      assigned_to: assignedTo,
      title,
      description,
      status: 'pending',
      start_date: new Date().toISOString(),
      due_date: dueDate,
      hours_worked: 0,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getTasks(projectId?: string) {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('tasks')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return data;
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed',
  hoursWorked?: number
) {
  const supabase = await createServerSupabaseClient();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  if (hoursWorked !== undefined) {
    updates.hours_worked = hoursWorked;
  }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getLMSCourses() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('lms_courses')
    .select('*, lms_videos(*)')
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) {
    return [];
  }

  return data;
}

export async function addLMSCourse(
  title: string,
  titleAr: string,
  description: string,
  descriptionAr: string,
  folderId: string,
  monthNumber: number
) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('lms_courses')
    .select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('lms_courses')
    .insert({
      title,
      title_ar: titleAr,
      description,
      description_ar: descriptionAr,
      folder_id: folderId,
      month_number: monthNumber,
      order: (count || 0) + 1,
      is_active: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function addLMSVideo(
  courseId: string,
  title: string,
  titleAr: string,
  driveEmbedUrl: string,
  durationMinutes: number
) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('lms_videos')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { error } = await supabase
    .from('lms_videos')
    .insert({
      course_id: courseId,
      title,
      title_ar: titleAr,
      drive_embed_url: driveEmbedUrl,
      duration_minutes: durationMinutes,
      order: (count || 0) + 1,
      is_active: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getClientProjects(clientId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*, tasks(*), leads(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function addFeatureCard(
  titleAr: string,
  descriptionAr: string,
  badgeLeftAr: string,
  badgeRightAr: string,
  iconType: string,
  accentColor: string
) {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from('features_cards')
    .select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('features_cards')
    .insert({
      title_ar: titleAr,
      description_ar: descriptionAr,
      badge_left_ar: badgeLeftAr,
      badge_right_ar: badgeRightAr,
      icon_type: iconType,
      accent_color: accentColor,
      order_index: (count || 0) + 1,
      is_active: true
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateFeatureCard(
  id: string,
  titleAr: string,
  descriptionAr: string,
  badgeLeftAr: string,
  badgeRightAr: string,
  iconType: string,
  accentColor: string,
  orderIndex: number
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('features_cards')
    .update({
      title_ar: titleAr,
      description_ar: descriptionAr,
      badge_left_ar: badgeLeftAr,
      badge_right_ar: badgeRightAr,
      icon_type: iconType,
      accent_color: accentColor,
      order_index: orderIndex,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteFeatureCard(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('features_cards')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleFeatureCard(id: string, isActive: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('features_cards')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function createClient(data: {
  full_name: string
  email: string
  phone: string
  company?: string
  source?: string
  status?: 'new' | 'in_progress' | 'closed' | 'lost'
  notes?: string
}) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('clients')
    .insert({
      owner_id: user.id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      source: data.source || null,
      status: data.status || 'new',
      notes: data.notes || null,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function updateClient(id: string, data: {
  full_name?: string
  email?: string
  phone?: string
  company?: string
  source?: string
  status?: 'new' | 'in_progress' | 'closed' | 'lost'
  notes?: string
}) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('clients')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function archiveClient(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('clients')
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function deleteClient(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function getClients(includeArchived = false) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  let query = supabase
    .from('clients')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data || [];
}

export async function updatePageContent(id: string, updates: any) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('site_content')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/about');
  revalidatePath('/faq');
  revalidatePath('/privacy-policy');
  revalidatePath('/terms');
  revalidatePath('/admin');
  revalidatePath('/dashboard/admin');
  return { success: true };
}


export async function getFAQItems(): Promise<FAQItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('faq_items')
    .eq('id', 'main')
    .single();

  if (error || !data || !data.faq_items) {
    return [];
  }

  return data.faq_items as FAQItem[];
}

export async function addHomeServiceCard(
  title: string,
  label: string,
  description: string,
  imageUrl: string
) {
  const supabase = await createServerSupabaseClient();

  // Get the current max order
  const { data: maxOrderData } = await supabase
    .from('home_service_cards')
    .select('order')
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = maxOrderData ? maxOrderData.order + 1 : 1;

  const { error } = await supabase
    .from('home_service_cards')
    .insert({
      title,
      label,
      description,
      image_url: imageUrl,
      order: nextOrder,
      is_active: true
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function updateHomeServiceCard(
  id: string,
  title: string,
  label: string,
  description: string,
  imageUrl: string,
  order: number
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('home_service_cards')
    .update({
      title,
      label,
      description,
      image_url: imageUrl,
      order
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function deleteHomeServiceCard(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('home_service_cards')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function toggleHomeServiceCard(id: string, isActive: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('home_service_cards')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/dashboard/admin');
  return { success: true };
}
