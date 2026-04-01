'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service client for elevated permissions
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface KPIMetric {
  id: string;
  category: string;
  metric_key: string;
  metric_name_ar: string;
  target_month: number;
  actual_value: number;
  unit: string;
  display_order: number;
  updated_at: string;
}

/**
 * Fetches all KPI metrics from Supabase
 */
export async function getKPIMetrics(): Promise<KPIMetric[]> {
  const { data, error } = await serviceClient
    .from('kpi_metrics')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error("[getKPIMetrics]", error);
    return [];
  }
  
  return data as KPIMetric[];
}

/**
 * Updates the monthly target for a specific KPI
 */
export async function updateKPITarget(id: string, target: number) {
  const { error } = await serviceClient
    .from('kpi_metrics')
    .update({ 
      target_month: target,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error("[updateKPITarget]", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * Manually updates the actual value for a specific KPI
 */
export async function updateKPIActual(id: string, actual: number) {
  const { error } = await serviceClient
    .from('kpi_metrics')
    .update({ 
      actual_value: actual,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error("[updateKPIActual]", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * Retrieves the secret Webhook API Key for display in Admin panel
 */
export async function getWebhookApiKey() {
  const { data, error } = await serviceClient
    .from('site_settings')
    .select('value')
    .eq('key', 'webhook_api_key')
    .single();
  
  if (error) return null;
  return data.value;
}
