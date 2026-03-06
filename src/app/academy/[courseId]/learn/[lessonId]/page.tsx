'use client';
import { useEffect, useRef, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, CheckCircle2, Lock, Download, Play, List } from 'lucide-react';

// ── Typed interfaces ────────────────────────────────────────────────────────
interface Lesson {
    id: string;
    module_id: string;
    course_id: string;
    title_ar: string;
    drive_file_id: string | null;
    content_type: string;
    duration_minutes: number;
    allow_download: boolean;
    position: number;
    is_preview: boolean;
}

interface Module {
    id: string;
    course_id: string;
    title_ar: string;
    position: number;
    unlock_after_days: number;
    academy_lessons: Lesson[];
}

interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    status: string;
    tier: string;
}

interface ProgressEntry {
    lesson_id: string;
}

interface Props { params: Promise<{ courseId: string; lessonId: string }> }

export default function LearnPage({ params }: Props) {
    const { courseId, lessonId } = use(params);
    const supabase = createClient();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progress, setProgress] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUserId(user.id);

            const [lessonRes, modulesRes] = await Promise.all([
                supabase.from('academy_lessons').select('*').eq('id', lessonId).single(),
                supabase
                    .from('academy_modules')
                    .select('*, academy_lessons(*)')
                    .eq('course_id', courseId)
                    .order('position'),
            ]);

            const loadedLesson = lessonRes.data as Lesson | null;
            const loadedModules = (modulesRes.data ?? []) as Module[];

            setLesson(loadedLesson);
            setModules(loadedModules);

            // Flatten lessons in correct order
            const flat: Lesson[] = [];
            loadedModules.forEach((m) => {
                const sorted = [...(m.academy_lessons ?? [])].sort((a, b) => a.position - b.position);
                flat.push(...sorted);
            });
            setAllLessons(flat);

            const [enrRes, progRes] = await Promise.all([
                supabase
                    .from('academy_enrollments')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('course_id', courseId)
                    .single(),
                supabase
                    .from('academy_progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .eq('course_id', courseId),
            ]);

            setEnrollment(enrRes.data as Enrollment | null);
            const progressIds = (progRes.data as ProgressEntry[] | null)?.map((p) => p.lesson_id) ?? [];
            setProgress(progressIds);
            setCompleted(progressIds.includes(lessonId));

            setLoading(false);
        };
        load();
    }, [courseId, lessonId]);

    const handleMarkComplete = async () => {
        if (!userId || !enrollment) return;
        const { error } = await supabase.from('academy_progress').upsert(
            { user_id: userId, lesson_id: lessonId, course_id: courseId, completed_at: new Date().toISOString() },
            { onConflict: 'user_id,lesson_id' }
        );
        if (!error) {
            setCompleted(true);
            setProgress((p) => [...p, lessonId]);
        }
    };

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const totalLessons = allLessons.length;
    const completedCount = progress.length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    // Server already enforces access via RLS; client-side check is a UX fallback only
    const currentModule = modules.find((m) => m.academy_lessons?.some((l) => l.id === lessonId));
    const isDripLocked = (): boolean => {
        if (!enrollment || !currentModule) return false;
        if (!currentModule.unlock_after_days) return false;
        const daysSinceEnroll = Math.floor(
            (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return currentModule.unlock_after_days > daysSinceEnroll && enrollment.tier === 'month_1';
    };

    if (!lesson || !enrollment) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-gray-500">
            <Lock className="w-16 h-16 opacity-30 text-purple-500" />
            <p className="text-xl font-bold text-white">يجب الاشتراك في الكورس للوصول إلى هذا الدرس</p>
            <Link
                href={`/academy/${courseId}`}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-purple-400 hover:bg-white/10 transition-all mt-4"
            >
                ← العودة لصفحة الكورس
            </Link>
        </div>
    );

    if (isDripLocked()) {
        const daysSinceEnroll = Math.floor(
            (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysRemaining = (currentModule?.unlock_after_days ?? 0) - daysSinceEnroll;

        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" dir="rtl">
                <header className="px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-md">
                    <Link href={`/academy/${courseId}`} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" /> العودة للكورس
                    </Link>
                </header>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden group shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative">
                            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-purple-500/20 group-hover:scale-110 transition-transform duration-700">
                                <Lock className="w-10 h-10 text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 leading-tight">هذا القسم مغلق حالياً</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                هذا المحتوى سيفتح لك تلقائياً بعد إكمال مدة الاشتراك المطلوبة
                            </p>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
                                <p className="text-purple-300 text-sm font-bold">الوقت المتبقي لفتح المحتوى:</p>
                                <p className="text-4xl font-black text-white mt-2">{daysRemaining} <span className="text-lg font-medium text-gray-500">يوم</span></p>
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                            >
                                عودة للدروس المتاحة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const videoSrc = lesson.drive_file_id
        ? `/api/academy/stream/${lesson.drive_file_id}`
        : null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" dir="rtl">
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-20">
                <Link href={`/academy/${courseId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                    <ChevronRight className="w-4 h-4" />
                    {lesson.title_ar}
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-gray-500 text-xs">{progressPct}%</span>
                    </div>
                    <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <List className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <div className="bg-black">
                        {videoSrc ? (
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                controls
                                controlsList={lesson.allow_download ? '' : 'nodownload'}
                                className="w-full max-h-[70vh] object-contain"
                                onEnded={handleMarkComplete}
                            />
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-black">
                                <div className="text-center space-y-3">
                                    <Play className="w-20 h-20 text-purple-400/30 mx-auto" />
                                    <p className="text-gray-600">لم يتم رفع الفيديو بعد</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-black text-white">{lesson.title_ar}</h1>
                            <div className="flex items-center gap-2 shrink-0">
                                {lesson.allow_download && videoSrc && (
                                    <a href={videoSrc} download className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs transition-colors">
                                        <Download className="w-3.5 h-3.5" /> تحميل
                                    </a>
                                )}
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={completed}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${completed
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {completed ? 'تم الإتمام ✓' : 'تحديد كمكتمل'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            {prevLesson ? (
                                <Link href={`/academy/${courseId}/learn/${prevLesson.id}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                    <ChevronRight className="w-4 h-4" /> الدرس السابق
                                </Link>
                            ) : <div />}
                            {nextLesson ? (
                                <Link href={`/academy/${courseId}/learn/${nextLesson.id}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                    الدرس التالي <ChevronLeft className="w-4 h-4" />
                                </Link>
                            ) : (
                                <Link href={`/academy/${courseId}`} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-bold">
                                    🎉 إتمام الكورس!
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {sidebarOpen && (
                    <aside className="hidden lg:block w-80 border-r border-white/10 bg-black/40 overflow-y-auto">
                        <div className="p-4 border-b border-white/10">
                            <p className="text-white font-black text-sm">محتوى الكورس</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${progressPct}%` }} />
                                </div>
                                <span className="text-gray-600 text-xs">{completedCount}/{totalLessons}</span>
                            </div>
                        </div>
                        {modules.map((mod) => (
                            <div key={mod.id}>
                                <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{mod.title_ar}</p>
                                </div>
                                {[...(mod.academy_lessons ?? [])].sort((a, b) => a.position - b.position).map((l) => {
                                    const isActive = l.id === lessonId;
                                    const isDone = progress.includes(l.id);
                                    return (
                                        <Link
                                            key={l.id}
                                            href={`/academy/${courseId}/learn/${l.id}`}
                                            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 transition-all ${isActive ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                                        >
                                            <div className="shrink-0">
                                                {isDone
                                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    : <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-purple-400' : 'border-gray-700'}`} />
                                                }
                                            </div>
                                            <span className={`text-sm leading-snug ${isActive ? 'text-white font-bold' : 'text-gray-500'}`}>{l.title_ar}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </aside>
                )}
            </div>
        </div>
    );
}
