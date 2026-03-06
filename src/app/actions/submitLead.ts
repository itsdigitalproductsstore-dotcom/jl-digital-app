'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Service client — operations are fully server-side, never exposed to the browser
const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Zod Schema ─────────────────────────────────────────────────────────────
const LeadSchema = z.object({
    full_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100)
        // Strip any HTML / script tags
        .transform((v) => v.replace(/<[^>]*>/g, '').trim()),

    email: z
        .string()
        .email('Please enter a valid email address')
        .max(254)
        .transform((v) => v.toLowerCase().trim()),

    phone: z
        .string()
        .max(30)
        .optional()
        .transform((v) => v?.replace(/[^\d\s+\-().]/g, '').trim() ?? ''),

    company_name: z
        .string()
        .max(150)
        .optional()
        .transform((v) => v?.replace(/<[^>]*>/g, '').trim() ?? ''),
});

export type LeadFormState =
    | { status: 'idle' }
    | { status: 'success' }
    | { status: 'error'; message: string };

export async function submitLeadAction(
    _prev: LeadFormState,
    formData: FormData
): Promise<LeadFormState> {
    const raw = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone') ?? undefined,
        company_name: formData.get('company_name') ?? undefined,
    };

    const parsed = LeadSchema.safeParse(raw);

    if (!parsed.success) {
        const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
        return { status: 'error', message: firstError ?? 'Validation failed' };
    }

    const { data } = parsed;

    const { error } = await serviceClient.from('leads').insert([
        {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone || null,
            company_name: data.company_name || null,
        },
    ]);

    if (error) {
        console.error('[submitLead] DB insert error:', error.message);
        return { status: 'error', message: 'An error occurred. Please try again.' };
    }

    return { status: 'success' };
}
