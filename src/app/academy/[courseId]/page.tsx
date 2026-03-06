'use client';
import { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Star, Users, Lock, Play, ChevronRight, CheckCircle2,
    MessageSquare, Radio, Calendar, Clock, BookOpen
} from 'lucide-react';

interface Props { params: Promise<{ courseId: string }> }

export default function CourseDetailPage({ params }: Props) {
    const { courseId } = use(params);
    const supabase = createClient();
    const router = useRouter();

    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [liveSessions, setLiveSessions] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [myReview, setMyReview] = useState({ rating: 0, body: '' });
    const [submitReview, setSubmitReview] = useState(false);
    const [reviewMsg, setReviewMsg] = useState('');

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const [courseRes, modulesRes, reviewsRes, liveRes] = await Promise.all([
                supabase.from('academy_courses').select('*').eq('id', courseId).single(),
                supabase.from('academy_modules').select('*, academy_lessons(*)').eq('course_id', courseId).order('position'),
                supabase.from('academy_reviews').select('*, profiles:user_id(full_name)').eq('course_id', courseId).order('created_at', { ascending: false }),
                supabase.from('academy_live_sessions').select('*').eq('course_id', courseId).order('scheduled_at'),
            ]);

            setCourse(courseRes.data);
            setModules(modulesRes.data || []);
            setReviews(reviewsRes.data || []);
            setLiveSessions(liveRes.data || []);

            if (user) {
                const { data: enr } = await supabase
                    .from('academy_enrollments')
                    .select('*').eq('user_id', user.id).eq('course_id', courseId).single();
                setEnrollment(enr);
            }
            setLoading(false);
        };
        load();
    }, [courseId]);

    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    const totalLessons = modules.reduce((acc, m) => acc + (m.academy_lessons?.length || 0), 0);

    const handleEnroll = async () => {
        if (!user) { router.push('/login'); return; }
        setEnrolling(true);
        const res = await fetch('/api/academy/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_id: courseId, user_id: user.id })
        });
        if (res.ok) {
            const { data } = await supabase.from('academy_enrollments').select('*')
                .eq('user_id', user.id).eq('course_id', courseId).single();
            setEnrollment(data);
        }
        setEnrolling(false);
    };

    const handleReviewSubmit = async () => {
        if (!user || !enrollment) return;
        setSubmitReview(true);
        const { error } = await supabase.from('academy_reviews').upsert({
            user_id: user.id, course_id: courseId, rating: myReview.rating, body: myReview.body,
        }, { onConflict: 'user_id,course_id' });
        setSubmitReview(false);
        if (!error) {
            setReviewMsg('✅ تم إرسال تقييمك بنجاح!');
            const { data } = await supabase.from('academy_reviews').select('*, profiles:user_id(full_name)').eq('course_id', courseId).order('created_at', { ascending: false });
            if (data) setReviews(data);
        } else {
            setReviewMsg('خطأ: ' + error.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    if (!course) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">الكورس غير موجود</div>
    );

    const isLocked = (module: any) => {
        if (!course.drip_enabled || !enrollment) return false;
        const daysSinceEnroll = enrollment
            ? Math.floor((Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        return module.unlock_after_days > daysSinceEnroll && enrollment?.tier === 'month_1';
    };

    return (
        <div className="min-h-screen bg-black text-white" dir="rtl">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-purple-900/40 via-black to-black border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Info */}
                    <div className="lg:col-span-3 space-y-6">
                        <Link href="/academy" className="text-purple-400 text-sm hover:underline flex items-center gap-1">
                            ← الأكاديمية
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight">{course.title_ar}</h1>
                        <p className="text-gray-400 text-lg leading-relaxed">{course.description_ar}</p>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-5 text-sm">
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                                    ))}
                                    <span className="text-gray-400 font-bold">{avgRating.toFixed(1)}</span>
                                    <span className="text-gray-600">({reviews.length} تقييم)</span>
                                </div>
                            )}
                            <span className="flex items-center gap-1 text-gray-400"><Users className="w-4 h-4" /> {course.subscriber_count} طالب</span>
                            <span className="flex items-center gap-1 text-gray-400"><BookOpen className="w-4 h-4" /> {totalLessons} درس</span>
                            {course.start_date && (
                                <span className="flex items-center gap-1 text-gray-400"><Calendar className="w-4 h-4" /> يبدأ: {new Date(course.start_date).toLocaleDateString('ar-OM')}</span>
                            )}
                        </div>

                        {/* Navigation bar */}
                        {enrollment && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link href={`/academy/${courseId}/community`} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                    <MessageSquare className="w-4 h-4" /> المجتمع
                                </Link>
                                <Link href={`/academy/${courseId}/live`} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                    <Radio className="w-4 h-4" /> البث المباشر
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CTA Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 space-y-5 sticky top-6">
                            {/* Trailer */}
                            {course.trailer_drive_id ? (
                                <div className="relative h-40 bg-black rounded-2xl overflow-hidden group cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-black fill-black mr-[-2px]" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-3 text-gray-400 text-xs">عرض تشويقي</div>
                                </div>
                            ) : (
                                <div className="h-40 bg-gradient-to-br from-purple-900/30 to-black rounded-2xl flex items-center justify-center">
                                    <Play className="w-12 h-12 text-purple-400/30" />
                                </div>
                            )}

                            {enrollment ? (
                                <>
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                                        <p className="text-green-400 font-black text-sm">✅ أنت مسجّل في هذا الكورس</p>
                                        <p className="text-gray-600 text-xs mt-1">المستوى: {enrollment.tier === 'month_2' ? 'الشهر الثاني (متقدم)' : 'الشهر الأول'}</p>
                                    </div>
                                    <Link
                                        href={`/academy/${courseId}/learn/${modules[0]?.academy_lessons?.[0]?.id || ''}`}
                                        className="block w-full bg-white text-black font-black py-4 rounded-2xl text-center hover:bg-gray-200 transition-all"
                                    >
                                        متابعة التعلم →
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-white">{course.price_omr === 0 ? 'مجاناً' : `${course.price_omr} ر.ع`}</p>
                                        {course.price_omr > 0 && <p className="text-gray-600 text-xs mt-1">شهرياً</p>}
                                    </div>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 hover:scale-[1.02]"
                                    >
                                        {enrolling ? 'جاري التسجيل...' : course.price_omr === 0 ? 'سجّل مجاناً' : 'اشترك الآن'}
                                    </button>
                                    <ul className="space-y-2 text-sm text-gray-500">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> وصول كامل للمحتوى</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> عضوية المجتمع</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> جلسات مباشرة مع المدرب</li>
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Curriculum */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <h2 className="text-2xl font-black mb-6">محتوى الكورس</h2>
                        <div className="space-y-3">
                            {modules.map((mod, mi) => {
                                const locked = isLocked(mod);
                                return (
                                    <div key={mod.id} className="border border-white/10 rounded-2xl overflow-hidden">
                                        <div className={`flex items-center justify-between px-5 py-4 ${locked ? 'opacity-60' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                {locked ? <Lock className="w-4 h-4 text-yellow-500" /> : <ChevronRight className="w-4 h-4 text-purple-400" />}
                                                <span className="font-bold">{mod.title_ar}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                                {locked && <span className="text-yellow-500 font-bold">يُفتح بعد {mod.unlock_after_days} يوم</span>}
                                                <span>{mod.academy_lessons?.length || 0} درس</span>
                                            </div>
                                        </div>
                                        {!locked && mod.academy_lessons?.map((lesson: any) => (
                                            <div key={lesson.id} className="border-t border-white/5">
                                                {enrollment || lesson.is_preview ? (
                                                    <Link href={`/academy/${courseId}/learn/${lesson.id}`} className="flex items-center justify-between px-8 py-3 hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <Play className="w-3.5 h-3.5 text-gray-500" />
                                                            <span className="text-gray-300 text-sm">{lesson.title_ar}</span>
                                                            {lesson.is_preview && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">معاينة</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{lesson.duration_minutes} دق</span>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center justify-between px-8 py-3 opacity-50">
                                                        <div className="flex items-center gap-3">
                                                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                                                            <span className="text-gray-500 text-sm">{lesson.title_ar}</span>
                                                        </div>
                                                        <Clock className="w-3 h-3 text-gray-700" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Sessions */}
                    {liveSessions.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <Radio className="w-6 h-6 text-red-400" /> الجلسات المباشرة
                            </h2>
                            <div className="space-y-3">
                                {liveSessions.map((session) => (
                                    <LiveSessionCard key={session.id} session={session} enrolled={!!enrollment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Star className="w-6 h-6 text-yellow-400" />
                            التقييمات والمراجعات
                        </h2>

                        {/* Write review (enrolled users only) */}
                        {enrollment && !reviews.find(r => r.user_id === user?.id) && (
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
                                <h3 className="font-black text-white">اكتب تقييمك</h3>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <button key={i} onClick={() => setMyReview(r => ({ ...r, rating: i + 1 }))}>
                                            <Star className={`w-8 h-8 transition-colors ${i < myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 hover:text-yellow-400'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={myReview.body}
                                    onChange={e => setMyReview(r => ({ ...r, body: e.target.value }))}
                                    placeholder="شاركنا تجربتك مع هذا الكورس..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none h-24 focus:border-white/30 transition-colors text-right"
                                />
                                {reviewMsg && <p className="text-sm text-green-400">{reviewMsg}</p>}
                                <button
                                    onClick={handleReviewSubmit}
                                    disabled={!myReview.rating || submitReview}
                                    className="bg-white text-black font-black px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-all disabled:opacity-40"
                                >
                                    {submitReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-8">لا توجد تقييمات بعد — كن أول من يقيّم!</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-white font-bold text-sm">{review.profiles?.full_name || 'طالب مجهول'}</p>
                                                <p className="text-gray-600 text-xs">{new Date(review.created_at).toLocaleDateString('ar-OM')}</p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.body && <p className="text-gray-400 text-sm leading-relaxed">{review.body}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 space-y-4">
                        <h3 className="font-black text-white">ماذا ستتعلم؟</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> بناء فنلز تسويقية متكاملة</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> إدارة إعلانات Meta وGoogle</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> أتمتة التسويق بالذكاء الاصطناعي</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> تحليل البيانات واتخاذ القرارات</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LiveSessionCard({ session, enrolled }: { session: any; enrolled: boolean }) {
    const isPast = new Date(session.scheduled_at) < new Date();
    const isActive = session.is_active;

    return (
        <div className={`flex items-center justify-between p-5 border rounded-2xl ${isActive ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${isActive ? 'bg-red-500/20' : 'bg-white/5'}`}>
                    <Radio className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-gray-500'}`} />
                </div>
                <div>
                    <p className="text-white font-bold">{session.title_ar}</p>
                    <p className="text-gray-500 text-xs">{new Date(session.scheduled_at).toLocaleString('ar-OM')}</p>
                </div>
            </div>
            {enrolled && session.meet_link ? (
                <a
                    href={session.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : isPast
                            ? 'border border-white/10 text-gray-600 cursor-not-allowed'
                            : 'border border-purple-500/40 text-purple-400 hover:bg-purple-500/10'
                        }`}
                >
                    {isActive ? '● انضم الآن' : isPast ? 'انتهت' : 'سينطلق قريباً'}
                </a>
            ) : (
                <span className="text-gray-600 text-xs">{enrolled ? 'لا يوجد رابط' : 'للمشتركين'}</span>
            )}
        </div>
    );
}
