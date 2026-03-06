'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useConfig } from '@/context/ConfigContext';

gsap.registerPlugin(TextPlugin);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

interface FeatureCardData {
  id: string;
  titleAr: string;
  descriptionAr: string;
  badgeLeftAr: string;
  badgeRightAr: string;
  iconType: string;
  accentColor: string;
  orderIndex: number;
  isActive: boolean;
}

const Shuffler = ({ card }: { card: FeatureCardData }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const originalText = card.titleAr;
    let interval: NodeJS.Timeout;

    const handleMouseEnter = () => {
        let iteration = 0;
        clearInterval(interval);

        interval = setInterval(() => {
            if (textRef.current) {
                textRef.current.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                if (iteration >= originalText.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }
        }, 30);
    };

    const handleMouseLeave = () => {
        clearInterval(interval);
        if (textRef.current) textRef.current.innerText = originalText;
    };

    return (
        <div
            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 group cursor-crosshair overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            dir="rtl"
            style={{
                boxShadow: `0 0 30px ${card.accentColor}15`
            }}
        >
            <div className="text-gray-500 text-sm font-mono mb-6 flex justify-between">
                <span>{card.badgeRightAr}</span>
                <span style={{ color: `${card.accentColor}80` }} className="group-hover:opacity-80 transition-colors">{card.badgeLeftAr}</span>
            </div>
            <h3
                ref={textRef}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white min-h-[2.5rem]"
            >
                {originalText}
            </h3>
            <p className="text-gray-500 mt-4 leading-relaxed font-light">
                {card.descriptionAr}
            </p>
        </div>
    );
};

const Typewriter = ({ card }: { card: FeatureCardData }) => {
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!logRef.current) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

        tl.to(logRef.current, {
            duration: 3,
            text: "> جارٍ تأسيس الاتصال الآمن... [تم]<br/>> توجيه تدفق البيانات... [تم]<br/>> في انتظار نبضة العميل القادم..._",
            ease: "none"
        });

    }, []);

    return (
        <div 
            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]" 
            dir="rtl"
            style={{
                boxShadow: `0 0 30px ${card.accentColor}15`
            }}
        >
            <div className="text-gray-500 text-sm font-mono mb-6 flex justify-between">
                <span>{card.badgeRightAr}</span>
                <span style={{ color: `${card.accentColor}80` }} className="group-hover:opacity-80 transition-colors">{card.badgeLeftAr}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {card.titleAr}
            </h3>
            <div
                ref={logRef}
                className="font-mono text-xs sm:text-sm bg-black/50 p-4 rounded-xl min-h-[100px] border"
                style={{ 
                    color: `${card.accentColor}cc`,
                    borderColor: `${card.accentColor}25`,
                    backgroundColor: `${card.accentColor}08`
                }}
            >
                _
            </div>
        </div>
    );
};

const Scheduler = ({ card }: { card: FeatureCardData }) => {
    return (
        <div 
            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]" 
            dir="rtl"
            style={{
                boxShadow: `0 0 30px ${card.accentColor}15`
            }}
        >
            <div className="text-gray-500 text-sm font-mono mb-6 flex justify-between">
                <span>{card.badgeRightAr}</span>
                <span style={{ color: `${card.accentColor}80` }} className="group-hover:opacity-80 transition-colors">{card.badgeLeftAr}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {card.titleAr}
            </h3>

            <div className="h-24 w-full flex items-center justify-center gap-2 mt-6">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2 rounded-full"
                        style={{
                            height: `${20 + Math.random() * 60}px`,
                            backgroundColor: `${card.accentColor}66`,
                            animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                            animationDelay: `${i * 0.15}s`,
                            boxShadow: `0 0 10px ${card.accentColor}80`
                        }}
                    />
                ))}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scaleY(1); }
            50% { opacity: 1; transform: scaleY(1.3); box-shadow: 0 0 10px ${card.accentColor}80; }
          }
        `}} />
            </div>
            <p className="text-gray-500 mt-4 leading-relaxed font-light text-sm">
                {card.descriptionAr}
            </p>
        </div>
    );
};

const defaultCards = [
    {
        id: "default-1",
        titleAr: "قلعة البيانات الموحدة",
        descriptionAr: "تشفير بمستوى عسكري وبنية تحتية معزولة تضمن حماية كاملة للبيانات وعدم تسريب أي معلومات استراتيجية.",
        badgeLeftAr: "SECURITY",
        badgeRightAr: "ARTIFACT_01",
        iconType: "shuffler",
        accentColor: "#3b82f6",
        orderIndex: 1,
        isActive: true
    },
    {
        id: "default-2",
        titleAr: "رصد العملاء في الوقت الفعلي",
        descriptionAr: "نظام متقدم لتتبع وتحليل سلوك العملاء اللحظي مع تقارير تفصيلية شاملة.",
        badgeLeftAr: "TELEMETRY",
        badgeRightAr: "ARTIFACT_02",
        iconType: "typewriter",
        accentColor: "#22c55e",
        orderIndex: 2,
        isActive: true
    },
    {
        id: "default-3",
        titleAr: "توسع فوري — بدون تأخير",
        descriptionAr: "بنية تحتية سحابية مرنة تتكيف فورياً مع حجم أي حملة تسويقية مهما بلغت.",
        badgeLeftAr: "PERFORMANCE",
        badgeRightAr: "ARTIFACT_03",
        iconType: "scheduler",
        accentColor: "#a855f7",
        orderIndex: 3,
        isActive: true
    }
];

export default function InteractiveFeatures() {
    const { config } = useConfig();
    const featureCards = config?.featureCards && config.featureCards.length > 0 ? config.featureCards : defaultCards;

    const renderCard = (card: FeatureCardData) => {
        switch (card.iconType) {
            case 'typewriter':
                return <Typewriter key={card.id} card={card} />;
            case 'scheduler':
                return <Scheduler key={card.id} card={card} />;
            case 'shuffler':
            default:
                return <Shuffler key={card.id} card={card} />;
        }
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featureCards.filter(card => card.isActive).map(card => renderCard(card))}
            </div>
        </section>
    );
}
