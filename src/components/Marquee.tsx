"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MarqueeProps {
  content?: string[];
  isRtl?: boolean;
}

const defaultContent = [
  "🚀 بناء الفنلز عالية التحويل",
  "📈 إعلانات مدفوعة بدقة",
  "🎬 إنتاج محتوى احترافي",
  "💡 أتمتة العمليات التجارية",
  "📊 تحليلات بيانات متقدمة",
  "🏆 حلول تسويق متكاملة",
];

export default function Marquee({ content, isRtl = true }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Resolve the content array — always fall back to defaults
    const resolved =
      content && content.filter((c) => c && c.trim()).length > 0
        ? content.filter((c) => c && c.trim())
        : defaultContent;

    if (resolved.length === 0) return;

    // ─── Build DOM ────────────────────────────────────────────
    // Clear and rebuild. We build from `resolved`, NOT from DOM children,
    // so there's never a "0 items" race condition.
    track.innerHTML = "";
    const CLONES = 5;
    for (let i = 0; i < CLONES; i++) {
      resolved.forEach((item) => {
        const span = document.createElement("span");
        span.className =
          "inline-flex items-center gap-4 px-8 text-xl font-bold text-white/80 whitespace-nowrap";
        const dot = document.createElement("span");
        dot.className = "inline-block w-2 h-2 rounded-full bg-white/50 flex-shrink-0";
        span.appendChild(dot);
        span.appendChild(document.createTextNode(item));
        track.appendChild(span);
      });
    }

    // ─── Animate ──────────────────────────────────────────────
    const dir = isRtl ? 20 : -20;
    gsap.set(track, { xPercent: 0 });

    const tween = gsap.to(track, {
      xPercent: dir,
      ease: "none",
      duration: 25,
      repeat: -1,
    });

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        gsap.set(track, { xPercent: dir * self.progress });
      },
    });

    return () => {
      tween.kill();
      st.kill();
    };
  }, [content, isRtl]);

  return (
    <section
      ref={containerRef}
      className="relative z-10 py-8 mx-4 md:mx-8 lg:mx-12 my-8 bg-gradient-to-r from-gray-900/50 via-black/80 to-gray-900/50 border border-gray-800 rounded-[2rem] overflow-hidden backdrop-blur-sm"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div ref={trackRef} className="flex" />
    </section>
  );
}
