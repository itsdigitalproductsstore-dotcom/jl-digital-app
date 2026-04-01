'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Star, Users, BookOpen, Lock, Play, ChevronRight, Award, Zap, Radio } from 'lucide-react';

interface Course {
    id: string;
    title_ar: string;
    description_ar: string;
    price_omr: number;
    thumbnail_url: string;
    trailer_drive_id: string;
    start_date: string;
    subscriber_count: number;
    drip_enabled: boolean;
    avg_rating?: number;
    review_count?: number;
    enrolled?: boolean;
    progress?: number;
}

export default function AcademyPage() {
    const supabase = createClient();
    const [courses, setCourses] = useState<Course[]>([]);
    const [myCourses, setMyCourses] = useState<string[]>([]);
    const [liveSessions, setLiveSessions] = useState<any[]>([]);
    const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                // Fetch published courses
                const { data: coursesData } = await supabase
                    .from('academy_courses')
                    .select('*')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false });

                // Fetch active live sessions
                const { data: liveRes } = await supabase
                    .from('academy_live_sessions')
                    .select('*, academy_courses(title_ar)')
                    .eq('is_active', true);
                setLiveSessions(liveRes || []);

                if (coursesData) {
                    const coursesWithRatings = await Promise.all(coursesData.map(async (c: any) => {
                        const { data: reviews } = await supabase
                            .from('academy_reviews')
                            .select('rating')
                            .eq('course_id', c.id);

                        const avg = reviews?.length
                            ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length
                            : 0;

                        return { ...c, avg_rating: avg, review_count: reviews?.length || 0 };
                    }));
                    setCourses(coursesWithRatings);
                }

                if (user) {
                    const { data: enrollments } = await supabase
                        .from('academy_enrollments')
                        .select('course_id')
                        .eq('user_id', user.id)
                        .eq('status', 'active');

                    if (enrollments) {
                        const enrolledIds = enrollments.map((e: any) => e.course_id);
                        setMyCourses(enrolledIds);

                        const progressData: Record<string, number> = {};
                        await Promise.all(enrolledIds.map(async (courseId: any) => {
                            const { count: total } = await supabase.from('academy_lessons')
                                .select('id', { count: 'exact', head: true })
                                .eq('course_id', courseId);

                            const { count: done } = await supabase.from('academy_progress')
                                .select('lesson_id', { count: 'exact', head: true })
                                .eq('user_id', user.id)
                                .eq('course_id', courseId);

                            progressData[courseId] = total ? Math.round(((done || 0) / total) * 100) : 0;
                        }));
                        setCourseProgress(progressData);
                    }
                }
            } catch (err) {
                console.error('Academy load error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const enrolled = courses.filter(c => myCourses.includes(c.id)).map(c => ({
        ...c,
        progress: courseProgress[c.id] || 0
    }));
    const explore = courses.filter(c => !myCourses.includes(c.id));

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
            <p className="text-purple-400 font-bold animate-pulse">جاري تحميل الأكاديمية...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white" dir="rtl">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm font-bold">أكاديمية JL للتسويق الرقمي</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        تعلّم. طبّق. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            انتصر.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        كورسات متكاملة في التسويق الرقمي، الإعلانات الممولة، وبناء الفنلز — مع مجتمع حي يدعمك في كل خطوة.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-10 text-center">
                        {[
                            { icon: Users, label: 'طالب نشط', value: '500+' },
                            { icon: BookOpen, label: 'كورس متخصص', value: courses.length.toString() },
                            { icon: Award, label: 'معدل الإتمام', value: '94%' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <stat.icon className="w-6 h-6 text-purple-400 mb-1" />
                                <p className="text-3xl font-black text-white">{stat.value}</p>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 pb-24 space-y-20 relative z-10">

                {/* Live Now Pulsing Section */}
                {liveSessions.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="bg-gradient-to-r from-red-500/10 via-purple-500/5 to-transparent border border-red-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-red-500/20 transition-colors duration-1000" />

                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-right">
                                    <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-1.5 self-center md:self-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                        <span className="text-red-400 text-xs font-black uppercase tracking-widest">مباشر الآن</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                        انضم إلى الجلسة المباشرة <br />
                                        <span className="text-gray-400 text-2xl md:text-3xl">{liveSessions[0].title_ar}</span>
                                    </h2>
                                    <p className="text-gray-500 font-medium">مع المدرب جاسم محمد — ابدأ التعلم التفاعلي الآن.</p>
                                </div>
                                <a
                                    href={liveSessions[0].meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn relative px-10 py-5 bg-red-600 rounded-2xl overflow-hidden active:scale-95 transition-all shadow-[0_0_50px_rgba(220,38,38,0.3)] hover:shadow-[0_0_70px_rgba(220,38,38,0.5)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 group-hover/btn:opacity-0 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center gap-3 text-white font-black text-lg">
                                        <Radio className="w-6 h-6 animate-pulse" />
                                        دخول البث المباشر
                                    </span>
                                </a>
                            </div>
                        </div>
                    </section>
                )}

                {/* My Courses */}
                {enrolled.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                            كورساتي
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {enrolled.map(course => (
                                <CourseCard key={course.id} course={course} enrolled={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Explore */}
                <section>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-400" />
                        استكشف الكورسات
                    </h2>
                    {explore.length === 0 && !loading ? (
                        <div className="text-center py-20 text-gray-600">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">قريباً — الكورسات قيد التحضير</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {explore.map(course => (
                                <CourseCard key={course.id} course={course} enrolled={false} />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}

function CourseCard({ course, enrolled }: { course: Course; enrolled: boolean }) {
    const stars = Math.round(course.avg_rating || 0);

    return (
        <Link href={`/academy/${course.id}`} className="group block">
            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-purple-500/40 transition-all duration-700 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)] h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-black overflow-hidden shrink-0">
                    {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title_ar} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-16 h-16 text-purple-400/20 group-hover:text-purple-400/40 transition-colors" />
                        </div>
                    )}
                    {enrolled && (
                        <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                            عليك المتابعة
                        </div>
                    )}
                    {course.trailer_drive_id && !enrolled && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                <Play className="w-7 h-7 text-black fill-black mr-[-3px]" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex-1">
                        <h3 className="text-white font-black text-xl mb-3 leading-snug group-hover:text-purple-400 transition-colors">{course.title_ar}</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2">{course.description_ar}</p>

                        {/* Progress Bar for Enrolled */}
                        {enrolled && (
                            <div className="mb-6 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter">
                                    <span className="text-purple-400">إنجازك</span>
                                    <span className="text-gray-400">{course.progress || 0}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${course.progress || 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stars */}
                        {(course.review_count || 0) > 0 && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-800'}`} />
                                    ))}
                                </div>
                                <span className="text-gray-600 text-[10px] font-bold">({course.review_count})</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                            <Users className="w-4 h-4 text-purple-400/50" />
                            <span>{course.subscriber_count} طالب</span>
                        </div>
                        {enrolled ? (
                            <div className="flex items-center gap-2 text-white font-black text-sm group-hover:translate-x-[-4px] transition-transform">
                                استمر الآن <ChevronRight className="w-4 h-4 text-purple-500" />
                            </div>
                        ) : (
                            <div className="text-white font-black text-xl tracking-tighter">
                                {course.price_omr === 0 ? (
                                    <span className="text-green-400">مجاناً</span>
                                ) : (
                                    <span className="text-white font-black">{course.price_omr} <span className="text-sm font-medium text-gray-500">ر.ع</span></span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
