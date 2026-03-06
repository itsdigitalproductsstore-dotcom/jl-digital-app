'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Pen, Building2, Star, CheckCircle2, Sparkles, Award, Users, Zap, Globe, TrendingUp, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
    {
        step: "01",
        accentColor: "#3b82f6",     // blue
        badge: { icon: MapPin, text: "سلطنة عُمان 🇴🇲" },
        tag: "المؤسس والمدير التنفيذي",
        name: "جاسم محمد",
        tagline: "رائد أعمال • مستشار استراتيجي • خبير إدارة",
        body: "خبرة متعمقة في إدارة الأعمال وبناء المشاريع من الصفر حتى الربحية. يُقدّم جاسم استشارات استراتيجية مدروسة تُساعد رواد الأعمال على بناء نماذج أعمال متينة وقابلة للتوسع.",
        highlights: [
            { icon: Award, text: "خبير في تأسيس الشركات وهيكلتها" },
            { icon: Star, text: "استشارات مخصصة لكل مرحلة نمو" },
            { icon: CheckCircle2, text: "رؤية تحليلية واستراتيجية عميقة" },
            { icon: Globe, text: "شريك في JL Digital Marketing" },
        ],
    },
    {
        step: "02",
        accentColor: "#f59e0b",     // amber
        badge: { icon: MapPin, text: "اليمن 🇾🇪" },
        tag: "المؤسس الشريك والمالك المشارك",
        name: "ليث أحمد خديش",
        tagline: "شريك مؤسس • Copywriter • استراتيجي إعلانات • محرك تحويل",
        body: "شريك مؤسس ومالك مشارك في JL Digital Marketing إلى جانب جاسم محمد. متخصص في صياغة نصوص إعلانية تُحرّك المشاعر وتدفع القرار بدقة حسابية، يجمع ليث بين الرؤية التجارية وعلم النفس التسويقي لإنتاج حملات فائقة الأداء على كل المنصات.",
        highlights: [
            { icon: Building2, text: "شريك مؤسس ومالك مشارك للوكالة" },
            { icon: Pen, text: "نصوص إعلانية عالية التحويل (CRO)" },
            { icon: Star, text: "استراتيجيات مدروسة لكل منصة" },
            { icon: Zap, text: "نتائج قياسية في أوقات قصيرة" },
        ],
    },
    {
        step: "03",
        accentColor: "#8b5cf6",
        badge: { icon: Building2, text: "JL Digital Marketing 🚀" },
        tag: "وكالتنا · فريقنا · رؤيتنا",
        name: "وكالة JL Digital",
        tagline: "إبداع لا حدود له · بيانات حقيقية · نتائج مضمونة",
        body: "أسّس جاسم محمد وليث أحمد خديش هذه الوكالة من رؤية واحدة: بناء آلة تسويق رقمي ضخمة تعطي العميل ما لا يجده في أي مكان آخر — استراتيجية متكاملة، تنفيذ فائق الدقة، ونتائج قابلة للقياس في كل خطوة.",
        highlights: [
            { icon: Sparkles, text: "✨ استراتيجية تسويق مخصصة 100% لمشروعك" },
            { icon: Zap, text: "⚡ تنفيذ فوري بفريق عالي الكفاءة والطموح" },
            { icon: TrendingUp, text: "📈 فنلات وإعلانات وكوبي يحقق أرقاماً حقيقية" },
            { icon: Globe, text: "🌍 نخدم الخليج · السلطنة · اليمن والعالم العربي" },
            { icon: Shield, text: "🛡️ شفافية تامة — تقارير وأداء يومي" },
            { icon: Users, text: "🤝 شراكة حقيقية لا مجرد خدمة" },
        ],
    },
];

export default function StackingCards() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

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
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative h-screen flex items-center justify-center w-full px-4 overflow-hidden"
        >
            <div className="relative w-full max-w-4xl h-[72vh] sm:h-[62vh]">
                {cards.map((card, index) => {
                    const BadgeIcon = card.badge.icon;
                    return (
                        <div
                            key={index}
                            className="stack-card absolute top-0 left-0 w-full h-full rounded-[2rem] border border-white/10 flex flex-col justify-between overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                            style={{
                                zIndex: index + 1,
                                backgroundColor: index === 0 ? '#090909' : index === 1 ? '#0b0b0b' : '#0e0e0e',
                            }}
                        >
                            {/* Top accent bar */}
                            <div
                                className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)` }}
                            />

                            {/* Step number — background watermark */}
                            <div
                                className="absolute bottom-4 left-6 text-[8rem] font-black opacity-[0.04] select-none leading-none"
                                style={{ color: card.accentColor }}
                            >
                                {card.step}
                            </div>

                            <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col" dir="rtl">
                                {/* Header row */}
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

                                    {/* Location badge */}
                                    <div
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0"
                                        style={{ color: card.accentColor, borderColor: `${card.accentColor}40`, backgroundColor: `${card.accentColor}10` }}
                                    >
                                        <BadgeIcon className="w-3.5 h-3.5" />
                                        {card.badge.text}
                                    </div>
                                </div>

                                {/* Body text */}
                                <p className="text-gray-300 text-base leading-relaxed mb-6 flex-shrink-0">
                                    {card.body}
                                </p>

                                {/* Highlights grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-auto">
                                    {card.highlights.map((h, hi) => {
                                        const HIcon = h.icon;
                                        return (
                                            <div
                                                key={hi}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                                                style={{ borderColor: `${card.accentColor}25`, backgroundColor: `${card.accentColor}08` }}
                                            >
                                                <HIcon className="w-4 h-4 flex-shrink-0" style={{ color: card.accentColor }} />
                                                <span className="text-sm text-gray-300">{h.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
