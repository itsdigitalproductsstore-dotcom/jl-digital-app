import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';

// ── Validation schema ──────────────────────────────────
const EnrollSchema = z.object({
    course_id: z.string().uuid('Invalid course_id'),
    tier: z.enum(['month_1', 'month_2']).default('month_1'),
});

// ── Supabase SERVICE client (bypasses RLS for writes) ──
function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(req: NextRequest) {
    // 1. Build a server SSR client so we can verify the session from cookies
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 2. Auth guard — must be a logged-in user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse + validate body with Zod
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = EnrollSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
            { status: 422 }
        );
    }

    const { course_id, tier } = parsed.data;

    // 4. Verify the course exists and is published
    const serviceClient = getServiceClient();
    const { data: course, error: courseError } = await serviceClient
        .from('academy_courses')
        .select('id, price_omr, is_published')
        .eq('id', course_id)
        .single();

    if (courseError || !course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (!course.is_published) {
        return NextResponse.json({ error: 'Course is not available' }, { status: 403 });
    }

    // 5. For paid courses — require payment confirmation (Stripe subscription check)
    //    Free courses (price_omr === 0) are enrolled immediately.
    if (course.price_omr > 0) {
        // In a full Stripe webhook flow the enrollment is created *by the webhook*.
        // A direct call here for a paid course is rejected unless it comes from the webhook.
        const webhookSecret = req.headers.get('x-webhook-secret');
        if (webhookSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
            return NextResponse.json(
                { error: 'Payment required. Please complete checkout before enrolling.' },
                { status: 402 }
            );
        }
    }

    // 6. Upsert enrollment using service role (user_id is taken from the verified session)
    const { error: insertError } = await serviceClient
        .from('academy_enrollments')
        .upsert(
            {
                user_id: user.id,     // ← always from the server-verified session
                course_id,
                tier,
                status: 'active',
                enrolled_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,course_id' }
        );

    if (insertError) {
        console.error('[enroll] DB error:', insertError.message);
        return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
    }

    // 7. Increment subscriber count
    await serviceClient.rpc('increment_subscriber_count', { course_id });

    return NextResponse.json({ success: true });
}
