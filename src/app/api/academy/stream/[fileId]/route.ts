import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    // Service client — bypasses RLS
    const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { fileId } = await params;

    // Sanitise fileId — must be alphanumeric/dash/underscore only (Google Drive format)
    if (!/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
        return new NextResponse('Bad Request', { status: 400 });
    }

    // ── 1. Resolve the session from SSR cookies (most reliable on Next.js) ──
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

    // Also accept a Bearer token for programmatic clients / video tag src workaround
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let userId: string | null = null;

    if (bearerToken) {
        const { data: { user } } = await serviceClient.auth.getUser(bearerToken);
        userId = user?.id ?? null;
    } else {
        const { data: { user } } = await supabaseAuth.auth.getUser();
        userId = user?.id ?? null;
    }

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // ── 2. Verify lesson exists and belongs to the platform ──
    const { data: lesson } = await serviceClient
        .from('academy_lessons')
        .select('id, course_id, allow_download, is_preview, drive_file_id, module_id')
        .eq('drive_file_id', fileId)
        .single();

    if (!lesson) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // ── 3. Preview logic — anyone authenticated can watch previews ──
    if (!lesson.is_preview) {
        // Must have an active enrollment
        const { data: enrollment } = await serviceClient
            .from('academy_enrollments')
            .select('id, status, enrolled_at, tier')
            .eq('user_id', userId)
            .eq('course_id', lesson.course_id)
            .eq('status', 'active')
            .single();

        if (!enrollment) {
            return new NextResponse('Forbidden — Not enrolled', { status: 403 });
        }

        // ── 4. SERVER-SIDE DRIP CHECK ──────────────────────────────────
        // Fetch the module's unlock_after_days
        const { data: mod } = await serviceClient
            .from('academy_modules')
            .select('unlock_after_days')
            .eq('id', lesson.module_id)
            .single();

        if (mod && mod.unlock_after_days > 0 && enrollment.tier === 'month_1') {
            const enrolledAt = new Date(enrollment.enrolled_at).getTime();
            const daysSinceEnroll = Math.floor((Date.now() - enrolledAt) / (1000 * 60 * 60 * 24));

            if (mod.unlock_after_days > daysSinceEnroll) {
                const daysRemaining = mod.unlock_after_days - daysSinceEnroll;
                return NextResponse.json(
                    { error: `Content locked. Available in ${daysRemaining} days.` },
                    { status: 403 }
                );
            }
        }
    }

    // ── 5. Proxy the video from Google Drive ──────────────────────────
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.GOOGLE_DRIVE_API_KEY}`;

    const range = req.headers.get('range');
    const fetchHeaders: HeadersInit = {};
    if (range) fetchHeaders['Range'] = range;

    let driveRes: Response;
    try {
        driveRes = await fetch(driveUrl, { headers: fetchHeaders });
    } catch {
        return new NextResponse('Drive unreachable', { status: 502 });
    }

    if (!driveRes.ok) {
        return new NextResponse('Drive error: ' + driveRes.statusText, { status: driveRes.status });
    }

    // ── 6. Stream back with hardened headers ─────────────────────────
    const responseHeaders: Record<string, string> = {
        'Content-Type': driveRes.headers.get('Content-Type') || 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        // Prevent the video URL from being embedded in other pages
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'",
    };

    const contentLength = driveRes.headers.get('Content-Length');
    if (contentLength) responseHeaders['Content-Length'] = contentLength;

    const contentRange = driveRes.headers.get('Content-Range');
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    if (!lesson.allow_download) {
        responseHeaders['Content-Disposition'] = 'inline';
    }

    return new NextResponse(driveRes.body, {
        status: range ? 206 : 200,
        headers: responseHeaders,
    });
}
