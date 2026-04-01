'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createClient } from '@supabase/supabase-js';
import { Briefcase, Target, Users, Globe, Building2, Star, CheckCircle, PenLine, Zap, TrendingUp, Waves, BarChart2, Lightbulb } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HomeServiceCard {
    id: string;
    title: string;
    label: string | null;
    description: string;
    image_url: string;
    order: number;
    is_active: boolean;
}

const defaultCards: HomeServiceCard[] = [
    {
        id: 'default-1',
        title: 'الأستاذ فرج',
        label: 'المؤسس والمدير التنفيذي',
        description: 'خبير في إدارة الأعمال وبناء المشاريع الناجحة من الصفر. يرافق الأستاذ فرج المبتدئين في رحلتهم الانتقالية نحو الاستقلالية المالية، عبر اتباع استراتيجيات مدروسة ومجربة بإتقان — من اختيار الفكرة الصحيحة وهندسة نموذج العمل، وصولاً إلى تحقيق أول إيراد حقيقي وبناء منظومة مشروع متينة وقابلة للتوسع.',
        image_url: '',
        order: 1,
        is_active: true,
    },
    {
        id: 'default-2',
        title: 'جاسم محمد',
        label: 'الشريك المؤسس',
        description: 'خبرة متعمقة في إدارة الأعمال وبناء المشاريع من الصفر حتى الربحية. يُقدّم جاسم استشارات استراتيجية مدروسة تُساعد رواد الأعمال على بناء نماذج أعمال متينة وقابلة للتوسع.',
        image_url: '',
        order: 2,
        is_active: true,
    },
    {
        id: 'default-3',
        title: 'ليث أحمد خديش',
        label: 'الشريك المؤسس',
        description: 'شريك مؤسس في BAYYA BUSINESS، متخصص في صياغة نصوص إعلانية تُحرّك المشاعر وتدفع القرار الشرائي بدقة حسابية. يجمع بين الإبداع اللغوي والتحليل التسويقي لبناء رسائل تُفضي إلى نتائج حقيقية.',
        image_url: '',
        order: 3,
        is_active: true,
    },
];

type Highlight = { Icon: React.ElementType; text: string };

const highlightSets: Highlight[][] = [
    // فرج - #1
    [
        { Icon: Briefcase, text: 'خبير في إدارة الأعمال وبناء المشاريع' },
        { Icon: Target, text: 'استراتيجيات مدروسة ومجربة بإتقان' },
        { Icon: Waves, text: 'يُرافق المبتدئين من الصفر حتى الربح' },
        { Icon: TrendingUp, text: 'نمو متسارع ومستدام للمشاريع الناشئة' },
    ],
    // جاسم - #2
    [
        { Icon: Building2, text: 'خبير في تأسيس الشركات وهيكلتها' },
        { Icon: Star, text: 'استشارات مخصصة لكل مرحلة نمو' },
        { Icon: Globe, text: 'شريك في BAYYA BUSINESS' },
        { Icon: CheckCircle, text: 'رؤية تحليلية واستراتيجية عميقة' },
    ],
    // ليث - #3
    [
        { Icon: PenLine, text: 'كتابة نصوص إعلانية احترافية' },
        { Icon: Zap, text: 'رسائل تُحرّك القرار الشرائي' },
        { Icon: BarChart2, text: 'خبرة في التسويق الرقمي المتكامل' },
        { Icon: Lightbulb, text: 'إبداع لغوي مدعوم بالتحليل' },
    ],
];

const accentColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];

function mapToCardData(card: HomeServiceCard, index: number) {
    return {
        step: String(index + 1).padStart(2, '0'),
        accentColor: accentColors[index % accentColors.length],
        badge: { text: card.label || '' },
        tag: card.label || '',
        name: card.title,
        tagline: card.label || '',
        body: card.description,
        highlights: highlightSets[index] || [],
    };
}

export default function StackingCards() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards, setCards] = useState<HomeServiceCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCards() {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('home_service_cards')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (error) {
                    console.error('Error fetching home service cards:', error);
                    setCards(defaultCards);
                } else if (data && data.length > 0) {
                    setCards(data as HomeServiceCard[]);
                } else {
                    setCards(defaultCards);
                }
            } catch (error) {
                console.error('Error in fetch:', error);
                setCards(defaultCards);
            } finally {
                setLoading(false);
            }
        }

        fetchCards();
    }, []);

    useEffect(() => {
        if (!containerRef.current || loading || cards.length === 0) return;

        const cardEls = gsap.utils.toArray('.stack-card') as HTMLElement[];
        if (cardEls.length === 0) return;

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: `+=${cardEls.length * 100}%`,
            pin: true,
            pinSpacing: true,
        });

        cardEls.forEach((card, i) => {
            if (i === 0) return;
            gsap.fromTo(card,
                { y: () => window.innerHeight, scale: 0.92, opacity: 0 },
                {
                    y: 0, scale: 1, opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: () => `top+=${(i - 1) * window.innerHeight} top`,
                        end: () => `top+=${i * window.innerHeight} top`,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    },
                }
            );
        });

        return () => { ScrollTrigger.getAll().forEach(st => st.kill()); };
    }, [loading, cards]);

    if (loading) {
        return (
            <section className="relative h-screen flex items-center justify-center w-full px-4 overflow-hidden">
                <div className="relative w-full max-w-4xl h-[72vh] sm:h-[62vh]" />
            </section>
        );
    }

    const cardData = cards.map((card, index) => mapToCardData(card, index));

    return (
        <section
            ref={containerRef}
            className="relative h-screen flex items-center justify-center w-full px-4 overflow-hidden"
        >
            <div className="relative w-full max-w-4xl h-[72vh] sm:h-[62vh]">
                {cardData.map((card, index) => {
                    return (
                        <div
                            key={index}
                            className="stack-card absolute top-0 left-0 w-full h-full rounded-[2rem] border border-white/10 flex flex-col justify-between overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                            style={{
                                zIndex: index + 1,
                                backgroundColor: index === 0 ? '#090909' : index === 1 ? '#0b0b0b' : '#0e0e0e',
                            }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)` }}
                            />

                            <div
                                className="absolute bottom-4 left-6 text-[8rem] font-black opacity-[0.04] select-none leading-none"
                                style={{ color: card.accentColor }}
                            >
                                {card.step}
                            </div>

                            <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col" dir="rtl">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <span
                                            className="inline-block text-xs font-mono px-3 py-1 rounded-full border mb-3"
                                            style={{ color: card.accentColor, borderColor: `${card.accentColor}40`, backgroundColor: `${card.accentColor}10` }}
                                        >
                                            {card.tag}
                                        </span>
                                        <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
                                            {card.name}
                                        </h3>
                                        <p className="text-sm font-mono" style={{ color: `${card.accentColor}cc` }}>
                                            {card.tagline}
                                        </p>
                                    </div>

                                    {card.badge.text && (
                                        <div
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0"
                                            style={{ color: card.accentColor, borderColor: `${card.accentColor}40`, backgroundColor: `${card.accentColor}10` }}
                                        >
                                            {card.badge.text}
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-300 text-base leading-relaxed mb-6 flex-shrink-0">
                                    {card.body}
                                </p>

                                {card.highlights.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        {card.highlights.map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
                                                style={{
                                                    borderColor: `${card.accentColor}25`,
                                                    backgroundColor: `${card.accentColor}08`,
                                                    color: '#d1d5db',
                                                }}
                                            >
                                                <h.Icon
                                                    className="w-3.5 h-3.5 flex-shrink-0"
                                                    style={{ color: card.accentColor }}
                                                />
                                                <span>{h.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
