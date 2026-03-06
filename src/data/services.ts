export interface Service {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  pricing: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  stripePriceIds: {
    basic: string;
    pro: string;
    enterprise: string;
  };
  timeline: string;
  timelineAr: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: "1",
    slug: "funnels",
    title: "Funnel Architecture",
    titleAr: "هندسة الفنلز",
    subtitle: "Zero-Base Funnel Building",
    subtitleAr: "بناء الفنلز من الصفر",
    description: "Custom high-converting funnels designed from scratch using data-driven methodology. Each funnel is built to maximize customer lifetime value.",
    descriptionAr: "فنلز عالية التحويل مصممة من الصفر باستخدام منهجية مبنية على البيانات. كل فنلز مبني لتعظيم قيمة العميل مدى الحياة.",
    features: [
      "Lead Magnet Integration",
      "Tripwire Optimization",
      "Upsell/Downsell Sequences",
      "A/B Testing Framework",
      "Analytics Dashboard",
      "Email Automation Setup"
    ],
    featuresAr: [
      "تكاملagnet LEAD",
      "تحسين Tripwire",
      "تسلسلات Upsell/Downsell",
      "إطار اختبار A/B",
      "لوحة التحليلات",
      "إعداد الأتمتة البريدية"
    ],
    pricing: {
      basic: 997,
      pro: 2497,
      enterprise: 4997
    },
    stripePriceIds: {
      basic: "price_1T59CWFwgSuBIypGYgNrNrL7",
      pro: "price_1T59CdFwgSuBIypGmcJyE85q",
      enterprise: "price_1T59CeFwgSuBIypGUr0JGiZm"
    },
    timeline: "2-4 weeks",
    timelineAr: "2-4 أسابيع",
    icon: "Filter"
  },
  {
    id: "2",
    slug: "ads",
    title: "Paid Advertising",
    titleAr: "الإعلانات المدفوعة",
    subtitle: "Multi-Platform Campaign Management",
    subtitleAr: "إدارة الحملات على منصات متعددة",
    description: "Strategic ad campaigns across Meta, Google, TikTok, and LinkedIn. We optimize for ROAS and scale what converts.",
    descriptionAr: "حملات إعلانات استراتيجية على ميتا وجوجل وتيك توك ولينكدين. نحسن العائد على الإنفاق ونوسع ما يحقق التحويل.",
    features: [
      "Audience Research & Segmentation",
      "Creative Strategy & Production",
      "Campaign Setup & Optimization",
      "Retargeting Funnels",
      "Conversion Tracking",
      "Weekly Performance Reports"
    ],
    featuresAr: [
      "بحث الجمهور والتجزئة",
      "الاستراتيجية الإبداعية والإنتاج",
      "إعداد الحملات والتحسين",
      "فنلز إعادة الاستهداف",
      "تتبع التحويل",
      "تقارير الأداء الأسبوعية"
    ],
    pricing: {
      basic: 1497,
      pro: 3497,
      enterprise: 7497
    },
    stripePriceIds: {
      basic: "price_1T59CfFwgSuBIypGyNZBe8yK",
      pro: "price_1T59CoFwgSuBIypGGRplbCwx",
      enterprise: "price_1T59CvFwgSuBIypGFm4NPCUD"
    },
    timeline: "4-8 weeks",
    timelineAr: "4-8 أسابيع",
    icon: "Target"
  },
  {
    id: "3",
    slug: "content",
    title: "Content Production",
    titleAr: "إنتاج المحتوى",
    subtitle: "High-Impact Content Engine",
    subtitleAr: "محرك محتوى عالي التأثير",
    description: "Professional content creation including video, copy, and graphics that captures attention and drives action.",
    descriptionAr: "إنشاء محتوى احترافي يشمل الفيديو والنصوص والرسومات التي تجذب الانتباه وتدفع للعمل.",
    features: [
      "Video Production (UGC & Professional)",
      "Copywriting (Ads, Emails, Landing Pages)",
      "Graphic Design & Branding",
      "Content Calendar",
      "Social Media Management",
      "Community Engagement"
    ],
    featuresAr: [
      "إنتاج الفيديو (UGC واحترافي)",
      "كتابة النصوص (إعلانات، رسائل، صفحات هبوط)",
      "التصميم الجرافيكي والهوية",
      "تقويم المحتوى",
      "إدارة وسائل التواصل",
      "تفاعل المجتمع"
    ],
    pricing: {
      basic: 997,
      pro: 2497,
      enterprise: 4997
    },
    stripePriceIds: {
      basic: "price_1T59CwFwgSuBIypGx22QSUaZ",
      pro: "price_1T59CxFwgSuBIypG7go3G8Sm",
      enterprise: "price_1T59CxFwgSuBIypGMKoftABJ"
    },
    timeline: "Ongoing",
    timelineAr: "مستمر",
    icon: "Video"
  },
  {
    id: "4",
    slug: "branding",
    title: "Brand Architecture",
    titleAr: "هندسة العلامة",
    subtitle: "Complete Brand Identity Systems",
    subtitleAr: "أنظمة الهوية الكاملة للعلامة",
    description: "Build a powerful brand from the ground up. We create visual identities that resonate with your audience and differentiate you in the market.",
    descriptionAr: "بناء علامة تجارية قوية من الصفر. ننشئ هويات بصرية تلقى صدى لدى جمهورك وتميزك في السوق.",
    features: [
      "Brand Strategy & Positioning",
      "Visual Identity Design",
      "Brand Guidelines Document",
      "Logo Design & Variations",
      "Typography & Color Systems",
      "Brand Voice & Messaging"
    ],
    featuresAr: [
      "استراتيجية العلامة والتوضع",
      "تصميم الهوية البصرية",
      "وثيقة إرشادات العلامة",
      "تصميم الشعار والتباينات",
      "أنظمة الخطوط والألوان",
      "صوت العلامة والرسائل"
    ],
    pricing: {
      basic: 1497,
      pro: 3497,
      enterprise: 6997
    },
    stripePriceIds: {
      basic: "price_1T59joFwgSuBIypGI1n2kq19",
      pro: "price_1T59joFwgSuBIypGb5cJlVXa",
      enterprise: "price_1T59jpFwgSuBIypG9pSB3PdT"
    },
    timeline: "3-5 weeks",
    timelineAr: "3-5 أسابيع",
    icon: "Palette"
  },
  {
    id: "5",
    slug: "automation",
    title: "Workflow Automation",
    titleAr: "أتمتة العمليات",
    subtitle: "Intelligent Business Automation",
    subtitleAr: "أتمتة ذكية للأعمال",
    description: "Automate your business processes with custom workflows that save time, reduce errors, and scale operations.",
    descriptionAr: "أتمتة عمليات عملك بمسارات عمل مخصصة توفر الوقت وتقلل الأخطاء وتوسع العمليات.",
    features: [
      "Process Mapping & Optimization",
      "CRM Integration",
      "Email Automation Sequences",
      "Lead Scoring & Routing",
      "Task Management Systems",
      "API Connections"
    ],
    featuresAr: [
      "رسم الخرائط وتحسين العمليات",
      "تكامل CRM",
      "تسلسلات الأتمتة البريدية",
      "تقييم وتأهيل العملاء المحتملين",
      "أنظمة إدارة المهام",
      "اتصالات API"
    ],
    pricing: {
      basic: 1997,
      pro: 4497,
      enterprise: 8997
    },
    stripePriceIds: {
      basic: "price_1T59jqFwgSuBIypGcGluIcCU",
      pro: "price_1T59jqFwgSuBIypGMdXLeS51",
      enterprise: "price_1T59jrFwgSuBIypGBaOg4aWu"
    },
    timeline: "2-6 weeks",
    timelineAr: "2-6 أسابيع",
    icon: "Workflow"
  },
  {
    id: "6",
    slug: "analytics",
    title: "Data Intelligence",
    titleAr: "الذكاء البيانات",
    subtitle: "Analytics & Conversion Optimization",
    subtitleAr: "التحليلات وتحسين التحويل",
    description: "Turn data into decisions. We set up comprehensive tracking and provide insights that drive growth.",
    descriptionAr: "حوّل البيانات إلى قرارات. نُعد تتبعاً شاملاً ونقدم رؤى تدفع للنمو.",
    features: [
      "GA4 Implementation",
      "Event Tracking Setup",
      "Conversion Attribution",
      "Heatmap Analysis",
      "A/B Testing Management",
      "Monthly Strategy Sessions"
    ],
    featuresAr: [
      "تنفيذ GA4",
      "إعداد تتبع الأحداث",
      "إسناد التحويل",
      "تحليل خرائط الحرارة",
      "إدارة اختبار A/B",
      "جلسات الاستراتيجية الشهرية"
    ],
    pricing: {
      basic: 797,
      pro: 1797,
      enterprise: 3997
    },
    stripePriceIds: {
      basic: "price_1T59jrFwgSuBIypGd2auxNMB",
      pro: "price_1T59jsFwgSuBIypGbpKFvqjp",
      enterprise: "price_1T59jsFwgSuBIypG4hiVSpig"
    },
    timeline: "1-3 weeks",
    timelineAr: "1-3 أسابيع",
    icon: "BarChart"
  }
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(service => service.slug === slug);
}
