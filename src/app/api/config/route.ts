import { NextResponse } from "next/server";
import { getSiteSettings, getMarqueeItems, getVideos, getServices, getFeatureCards } from "@/utils/supabase/server-data";
import { createServerSupabaseClient } from "@/utils/supabase/server-only";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const [settings, marqueeItems, videos, services, featureCards] = await Promise.all([
      getSiteSettings(),
      getMarqueeItems(),
      getVideos(),
      getServices(),
      getFeatureCards()
    ]);

    const { data: siteContent } = await supabase.from('site_content').select('*').eq('id', 'main').single();

    const defaultCurrencyRates = { OMR: 1, SAR: 9.75, USD: 2.6, AED: 9.75 };

    const defaultMarqueeItems = [
      { id: "default-1", text: "🚀 بناء Funnels عالية التحويل", textAr: "🚀 بناء Funnels عالية التحويل", order: 1, isActive: true },
      { id: "default-2", text: "📈 إعلانات مدفوعة بدقة", textAr: "📈 إعلانات مدفوعة بدقة", order: 2, isActive: true },
      { id: "default-3", text: "🎬 إنتاج محتوى احترافي", textAr: "🎬 إنتاج محتوى احترافي", order: 3, isActive: true },
      { id: "default-4", text: "💡 أتمتة العمليات التجارية", textAr: "💡 أتمتة العمليات التجارية", order: 4, isActive: true },
      { id: "default-5", text: "📊 تحليلات بيانات متقدمة", textAr: "📊 تحليلات بيانات متقدمة", order: 5, isActive: true },
      { id: "default-6", text: "🏆 حلول تسويق متكاملة", textAr: "🏆 حلول تسويق متكاملة", order: 6, isActive: true },
    ];

    const defaultVideos = [
      { id: "default-1", title: "مقدمة عن خدماتنا", titleAr: "مقدمة عن خدماتنا", description: "استكشف كيف نحول وجودك الرقمي", descriptionAr: "استكشف كيف نحول وجودك الرقمي", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: null, order: 1, isActive: true },
      { id: "default-2", title: "بناء Funnels", titleAr: "بناء Funnels", description: "شرح تفصيلي لعملية بناء Funnel", descriptionAr: "شرح تفصيلي لعملية بناء Funnel", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: null, order: 2, isActive: true },
      { id: "default-3", title: "استراتيجيات الإعلانات", titleAr: "استراتيجيات الإعلانات", description: "كيف نضمن عائد استثمار عالي", descriptionAr: "كيف نضمن عائد استثمار عالي", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: null, order: 3, isActive: true },
    ];

    const defaultFeatureCards = [
      { id: "default-1", titleAr: "قلعة البيانات الموحدة", descriptionAr: "تشفير بمستوى عسكري وبنية تحتية معزولة تضمن حماية كاملة للبيانات.", badgeLeftAr: "SECURITY", badgeRightAr: "ARTIFACT_01", iconType: "shuffler", accentColor: "#3b82f6", orderIndex: 1, isActive: true },
      { id: "default-2", titleAr: "رصد العملاء في الوقت الفعلي", descriptionAr: "نظام متقدم لتتبع وتحليل سلوك العملاء اللحظي مع تقارير تفصيلية.", badgeLeftAr: "TELEMETRY", badgeRightAr: "ARTIFACT_02", iconType: "typewriter", accentColor: "#22c55e", orderIndex: 2, isActive: true },
      { id: "default-3", titleAr: "توسع فوري — بدون تأخير", descriptionAr: "بنية تحتية سحابية مرنة تتكيف فورياً مع حجم أي حملة تسويقية.", badgeLeftAr: "PERFORMANCE", badgeRightAr: "ARTIFACT_03", iconType: "scheduler", accentColor: "#a855f7", orderIndex: 3, isActive: true },
    ];

    const responseData = {
      settings: {
        siteName: settings?.site_name || "BAYYA BUSINESS",
        siteNameAr: settings?.site_name_ar || "BAYYA BUSINESS",
        siteDescription: settings?.site_description || "أدوات تسويق رقمي عالية المستوى لتعزيز نمو المشاريع الناشئة",
        siteDescriptionAr: settings?.site_description_ar || "أدوات تسويق رقمي عالية المستوى مبنية على بروتوكول البناء من الصفر لتعزيز نمو المشاريع الناشئة",
        logoUrl: settings?.logo_url || null,
        faviconUrl: settings?.favicon_url || null,
        heroTitle: siteContent?.hero_title || settings?.hero_title || "Aspirational Growth meets Digital Precision.",
        heroTitleAr: siteContent?.hero_title_ar || settings?.hero_title_ar || "النمو الطموح يلتقي بالدقّة الرقمية.",
        heroSubtitle: siteContent?.hero_subtitle || settings?.hero_subtitle || "A high-end data instrument built to execute the Zero-Base Build Protocol.",
        heroSubtitleAr: siteContent?.hero_subtitle_ar || settings?.hero_subtitle_ar || "أداة بيانات عالية المستوى، مبنية لتنفّذ بروتوكول بناء كامل يربط هندسة الفلنز، الإعلانات المدفوعة، إنتاج المحتوى، الذكاء بالبيانات، أتمتة العمليات وهندسة العلامة، ليحوّل كل زيارة إلى فرصة نمو حقيقية.",
        heroSmallTextAr: siteContent?.hero_small_text_ar || "",
        heroCtaText: siteContent?.hero_cta_primary || settings?.hero_cta_text || "Secure Your Strategy Session",
        heroCtaTextAr: siteContent?.hero_cta_primary || settings?.hero_cta_text_ar || "احجز جلسة استراتيجية",
        currencyRates: settings?.currency_rates || defaultCurrencyRates,
        partner1: settings?.partner_1 || "الأستاذ فرج",
        partner2: settings?.partner_2 || "جاسم محمد",
        originCountry: settings?.origin_country || "سلطنة عُمان",
        marqueeItems: marqueeItems.length > 0 ? marqueeItems.map(item => ({
          id: item.id,
          text: item.text,
          textAr: item.text_ar,
          order: item.order,
          isActive: item.is_active
        })) : defaultMarqueeItems,
        videos: videos.length > 0 ? videos.map(video => ({
          id: video.id,
          title: video.title,
          titleAr: video.title_ar,
          description: video.description || "",
          descriptionAr: video.description_ar || "",
          url: video.url,
          thumbnailUrl: video.thumbnail_url,
          order: video.order,
          isActive: video.is_active
        })) : defaultVideos,
        services: services.map(service => ({
          id: service.id,
          slug: service.slug,
          title: service.title,
          titleAr: service.title_ar,
          subtitle: service.subtitle,
          subtitleAr: service.subtitle_ar,
          description: service.description,
          descriptionAr: service.description_ar,
          features: service.features,
          featuresAr: service.features_ar,
          pricingBasic: service.pricing_basic,
          pricingPro: service.pricing_pro,
          pricingEnterprise: service.pricing_enterprise,
          timeline: service.timeline,
          timelineAr: service.timeline_ar,
          icon: service.icon,
          isActive: service.is_active,
          order: service.order
        })),
        featureCards: featureCards.length > 0 ? featureCards.map(card => ({
          id: card.id,
          titleAr: card.title_ar,
          descriptionAr: card.description_ar,
          badgeLeftAr: card.badge_left_ar,
          badgeRightAr: card.badge_right_ar,
          iconType: card.icon_type,
          accentColor: card.accent_color,
          orderIndex: card.order_index,
          isActive: card.is_active
        })) : defaultFeatureCards
      }
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}
