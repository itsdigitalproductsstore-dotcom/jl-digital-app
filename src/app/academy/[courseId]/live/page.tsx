'use client';
import { useEffect, useState, useRef, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Radio, Send, ExternalLink, ChevronRight, Users, Mic, MicOff, Monitor } from 'lucide-react';

interface Props { params: Promise<{ courseId: string }> }

interface ChatMessage {
    id: string;
    user_id: string;
    body: string;
    created_at: string;
    sender_name?: string;
}

export default function LivePage({ params }: Props) {
    const { courseId } = use(params);
    const supabase = createClient();

    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [msgText, setMsgText] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewerCount, setViewerCount] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<any>(null);

    const fetchMessages = async (sessionId: string) => {
        // Using community posts table for live chat (filtered by session reference)
        const { data } = await supabase
            .from('academy_community_posts')
            .select('*, profiles:user_id(full_name)')
            .eq('course_id', courseId)
            .ilike('body', `[LIVE:${sessionId}]%`)
            .order('created_at', { ascending: true })
            .limit(100);

        if (data) {
            setMessages(data.map((p: any) => ({
                id: p.id,
                user_id: p.user_id,
                body: p.body.replace(`[LIVE:${sessionId}] `, ''),
                created_at: p.created_at,
                sender_name: (p.profiles as any)?.full_name || 'طالب',
            })));
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const [courseRes, sessionsRes] = await Promise.all([
                supabase.from('academy_courses').select('title_ar').eq('id', courseId).single(),
                supabase.from('academy_live_sessions').select('*').eq('course_id', courseId).order('scheduled_at', { ascending: false }),
            ]);

            setCourse(courseRes.data);
            setSessions(sessionsRes.data || []);

            const active = sessionsRes.data?.find((s: any) => s.is_active);
            if (active) {
                setActiveSession(active);
                await fetchMessages(active.id);
            }

            if (user) {
                const { data: enr } = await supabase.from('academy_enrollments').select('*').eq('user_id', user.id).eq('course_id', courseId).single();
                setEnrollment(enr);
            }
            setLoading(false);
        };
        init();
    }, [courseId]);

    // Realtime: live session changes + chat
    useEffect(() => {
        if (!activeSession) return;

        const ch = supabase.channel(`live-${activeSession.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'academy_community_posts' }, async () => {
                await fetchMessages(activeSession.id);
            })
            .on('presence', { event: 'sync' }, () => {
                setViewerCount(Object.keys(ch.presenceState()).length);
            })
            .subscribe(async (status: any) => {
                if (status === 'SUBSCRIBED' && user) {
                    await ch.track({ user_id: user.id, online_at: new Date().toISOString() });
                }
            });

        channelRef.current = ch;
        return () => { supabase.removeChannel(ch); };
    }, [activeSession, user]);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!msgText.trim() || !user || !enrollment || !activeSession) return;
        const body = `[LIVE:${activeSession.id}] ${msgText.trim()}`;
        await supabase.from('academy_community_posts').insert({ user_id: user.id, course_id: courseId, body });
        setMsgText('');
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    const isOwner = user?.email === 'jumpleadsjl@gmail.com' || user?.user_metadata?.role === 'owner';

    return (
        <div className="min-h-screen bg-black text-white" dir="rtl">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link href={`/academy/${courseId}`} className="text-gray-500 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-500">البث المباشر</p>
                        <h1 className="text-white font-black text-sm">{course?.title_ar}</h1>
                    </div>
                    {activeSession && (
                        <div className="mr-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 text-xs font-bold">مباشر الآن</span>
                            <span className="text-gray-600 text-xs flex items-center gap-1"><Users className="w-3 h-3" />{viewerCount}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeSession ? (
                    /* Active Session Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                        {/* Stream Area */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="flex-1 bg-black border border-white/10 rounded-[2rem] overflow-hidden relative">
                                {activeSession.meet_link ? (
                                    <>
                                        <iframe
                                            src={activeSession.meet_link.includes('meet.google.com')
                                                ? activeSession.meet_link
                                                : activeSession.meet_link}
                                            className="w-full h-full"
                                            allow="camera; microphone; fullscreen; display-capture"
                                            allowFullScreen
                                        />
                                        {/* Overlay for non-iframe-able Meet links */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/30 to-black pointer-events-none">
                                            <Radio className="w-16 h-16 text-red-400/50 mb-4" />
                                        </div>
                                        {/* Direct Join Button */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                            <a
                                                href={activeSession.meet_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 bg-red-500 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-2xl hover:scale-105"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                انضم للبث عبر Google Meet
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4">
                                        <Radio className="w-16 h-16 text-red-400/40" />
                                        <p className="text-gray-600">الجلسة نشطة — في انتظار رابط الانضمام</p>
                                    </div>
                                )}
                            </div>

                            {/* Session Info */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <h2 className="text-white font-black">{activeSession.title_ar}</h2>
                                {activeSession.description_ar && (
                                    <p className="text-gray-500 text-sm mt-1">{activeSession.description_ar}</p>
                                )}
                            </div>
                        </div>

                        {/* Live Chat */}
                        <div className="flex flex-col bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-white font-black text-sm">الدردشة المباشرة</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <p className="text-gray-700 text-xs text-center pt-8">لا رسائل بعد — كن أول من يكتب!</p>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-start' : 'items-start'}`}>
                                            <span className="text-gray-600 text-[10px] mb-0.5 px-1">{msg.sender_name}</span>
                                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.user_id === user?.id
                                                ? 'bg-purple-600/30 text-white'
                                                : 'bg-white/5 text-gray-300'
                                                }`}>
                                                {msg.body}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            {enrollment ? (
                                <div className="p-3 border-t border-white/10 flex gap-2">
                                    <input
                                        value={msgText}
                                        onChange={e => setMsgText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="اكتب رسالتك..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-white/20 text-right"
                                    />
                                    <button onClick={handleSendMessage} disabled={!msgText.trim()} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-40">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 border-t border-white/10 text-center text-xs text-gray-600">
                                    اشترك للمشاركة في الدردشة
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* No Active Session */
                    <div className="text-center py-20 space-y-6">
                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                            <Radio className="w-10 h-10 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-2xl mb-2">لا يوجد بث مباشر حالياً</h2>
                            <p className="text-gray-600">ستظهر هنا الجلسة عند انطلاقها</p>
                        </div>

                        {sessions.length > 0 && (
                            <div className="max-w-lg mx-auto">
                                <h3 className="text-white font-black mb-4">الجلسات القادمة</h3>
                                <div className="space-y-3">
                                    {sessions.filter(s => !s.is_active).map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                                            <div className="text-right">
                                                <p className="text-white font-bold text-sm">{s.title_ar}</p>
                                                <p className="text-gray-500 text-xs">{new Date(s.scheduled_at).toLocaleString('ar-OM')}</p>
                                            </div>
                                            {s.meet_link && enrollment && (
                                                <a href={s.meet_link} target="_blank" className="px-3 py-1.5 border border-white/10 text-gray-400 hover:text-white text-xs rounded-xl transition-colors">
                                                    رابط الانضمام
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
