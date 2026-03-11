"use client";

import { useState, useEffect } from "react";
import LeadModal from "@/components/LeadModal";
import MagneticButton from "@/components/MagneticButton";
import StackingCards from "@/components/StackingCards";
import Marquee from "@/components/Marquee";
import Header from "@/components/Header";
import VideoHub from "@/components/VideoHub";
import Footer from "@/components/Footer";
import { useConfig } from "@/context/ConfigContext";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const { config, isLoading } = useConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const marqueeText = config?.marqueeItems
    ?.filter(item => item.isActive)
    .map(item => item.textAr || item.text) || [
      "🚀 بناء الفنلز عالية التحويل",
      "📈 إعلانات مدفوعة بدقة",
      "🎬 إنتاج محتوى احترافي",
      "💡 أتمتة العمليات التجارية",
      "📊 تحليلات بيانات متقدمة",
      "🏆 حلول تسويق متكاملة",
    ];

  return (
    <div className="relative min-h-screen font-sans bg-black flex flex-col items-center justify-start overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <Header />

      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-12 w-full max-w-5xl min-h-screen pt-20">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
          {config?.heroTitleAr || "النمو الطموح يلتقي بالدقّة الرقمية."}<br />
          <span className="text-gray-500">{config?.heroSubtitleAr || "دقة رقمية متناهية"}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-400 mb-4 max-w-3xl font-light">
          {config?.heroSubtitleAr || "أداة بيانات عالية المستوى، مبنية لتنفّذ بروتوكول بناء كامل يربط هندسة الفلنز، الإعلانات المدفوعة، إنتاج المحتوى، الذكاء بالبيانات، أتمتة العمليات وهندسة العلامة، ليحوّل كل زيارة إلى فرصة نمو حقيقية."}
        </p>

        {config?.heroSmallTextAr && (
          <p className="text-lg text-gray-500 mb-12 max-w-2xl">
            {config?.heroSmallTextAr}
          </p>
        )}

        <MagneticButton
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-10 py-5 text-xl font-bold hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
        >
          {config?.heroCtaTextAr || "احجز جلسة استراتيجية الآن"}
        </MagneticButton>
      </section>

      <Marquee content={marqueeText} />

      <VideoHub />

      <StackingCards />

      <Footer />

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
