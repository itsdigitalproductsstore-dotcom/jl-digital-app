'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RefreshCw } from 'lucide-react';

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
        id: "default-1",
        title: "قلعة البيانات الموحدة",
        description: "تشفير بمستوى عسكري وبنية تحتية معزولة تضمن حماية كاملة للبيانات وعدم تسريب أي معلومات استراتيجية.",
        label: "SECURITY",
        image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
        order: 1,
        is_active: true
    },
    {
        id: "default-2",
        title: "رصد العملاء في الوقت الفعلي",
        description: "نظام متقدم لتتبع وتحليل سلوك العملاء اللحظي مع تقارير تفصيلية شاملة.",
        label: "TELEMETRY",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000",
        order: 2,
        is_active: true
    },
    {
        id: "default-3",
        title: "توسع فوري — بدون تأخير",
        description: "بنية تحتية سحابية مرنة تتكيف فورياً مع حجم أي حملة تسويقية مهما بلغت.",
        label: "PERFORMANCE",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000",
        order: 3,
        is_active: true
    }
];

export default function InteractiveFeatures() {
    const [cards, setCards] = useState<HomeServiceCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('home_service_cards')
                    .select('*')
                    .eq('is_active', true)
                    .order('order', { ascending: true });

                if (error) {
                    console.error('Error fetching cards:', error);
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
                setIsLoading(false);
            }
        };

        fetchCards();
    }, []);

    if (isLoading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10 flex justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-white animate-spin mt-20" />
            </section>
        );
    }

    const renderCard = (card: HomeServiceCard, index: number) => {
        // We can assign different accent colors based on index to keep the visual variety
        const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'];
        const accentColor = colors[index % colors.length];

        return (
            <div
                key={card.id}
                className="rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col h-full"
                dir="rtl"
                style={{
                    boxShadow: `0 0 30px ${accentColor}15`
                }}
            >
                <div className="h-48 sm:h-56 w-full relative overflow-hidden">
                    <img
                        src={card.image_url}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <div className="text-gray-500 text-sm font-mono mb-4 flex justify-between">
                        <span style={{ color: `${accentColor}80` }} className="group-hover:opacity-80 transition-colors">
                            {card.label}
                        </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                        {card.title}
                    </h3>

                    <p className="text-gray-500 leading-relaxed font-light text-sm flex-1">
                        {card.description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => renderCard(card, index))}
            </div>
        </section>
    );
}
