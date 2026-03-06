export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  marqueeContent: string[];
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface PageItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
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
  timeline: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

export const defaultSiteSettings: SiteSettings = {
  id: "default",
  siteName: "JL Digital",
  siteDescription: "أدوات تسويق رقمي عالية المستوى",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  marqueeContent: [
    "🚀 بناء Funnels عالية التحويل",
    "📈 إعلانات مدفوعة بدقة",
    "🎬 إنتاج محتوى احترافي",
    "💡 أتمتة العمليات التجارية",
    "📊 تحليلات بيانات متقدمة",
    "🏆 حلول تسويق متكاملة",
  ],
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
  contactEmail: "info@jldigital.om",
  contactPhone: "+968 1234 5678",
  address: "مسقط، سلطنة عُمان",
  socialLinks: {
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
