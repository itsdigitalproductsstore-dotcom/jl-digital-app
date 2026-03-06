"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Currency = "OMR" | "SAR" | "USD" | "AED";

interface CurrencyRates {
  OMR: number;
  SAR: number;
  USD: number;
  AED: number;
}

interface SiteConfig {
  siteName: string;
  siteNameAr: string;
  siteDescription: string;
  siteDescriptionAr: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroTitle: string;
  heroTitleAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  heroSmallTextAr: string;
  heroCtaText: string;
  heroCtaTextAr: string;
  currencyRates: CurrencyRates;
  partner1: string;
  partner2: string;
  originCountry: string;
  marqueeItems: MarqueeItem[];
  videos: VideoItem[];
  featureCards: FeatureCard[];
}

interface MarqueeItem {
  id: string;
  text: string;
  textAr: string;
  order: number;
  isActive: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  url: string;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
}

interface FeatureCard {
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

interface ConfigContextType {
  config: SiteConfig | null;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInOMR: number) => number;
  getCurrencySymbol: () => string;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const defaultConfig: SiteConfig = {
  siteName: "JL Digital",
  siteNameAr: "JL Digital",
  siteDescription: "أدوات تسويق رقمي عالية المستوى",
  siteDescriptionAr: "أدوات تسويق رقمي عالية المستوى",
  logoUrl: null,
  faviconUrl: null,
  heroTitle: "Aspirational Growth meets Digital Precision.",
  heroTitleAr: "النمو الطموح يلتقي بالدقّة الرقمية.",
  heroSubtitle: "A high-end data instrument built to execute the Zero-Base Build Protocol.",
  heroSubtitleAr: "أداة بيانات عالية المستوى، مبنية لتنفّذ بروتوكول بناء كامل يربط هندسة الفلنز، الإعلانات المدفوعة، إنتاج المحتوى، الذكاء بالبيانات، أتمتة العمليات وهندسة العلامة، ليحوّل كل زيارة إلى فرصة نمو حقيقية.",
  heroSmallTextAr: "حلول رقمية تُصمَّم حول أرقامك، لا حول التخمين.",
  heroCtaText: "Secure Your Strategy Session",
  heroCtaTextAr: "احجز جلسة استراتيجية",
  currencyRates: { OMR: 1, SAR: 9.75, USD: 2.6, AED: 9.75 },
  partner1: "جاسم محمد",
  partner2: "ليث أحمد خديش",
  originCountry: "سلطنة عُمان",
  marqueeItems: [],
  videos: [],
  featureCards: [],
};

const currencySymbols: Record<Currency, string> = {
  OMR: "ر.ع",
  SAR: "ر.س",
  USD: "$",
  AED: "د.إ",
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [currency, setCurrencyState] = useState<Currency>("OMR");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshConfig = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/config', {
        cache: 'no-store',
        next: { revalidate: 0 },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setConfig(data.settings);
        if (isClient) {
          const savedCurrency = localStorage.getItem("jl-currency") as Currency;
          if (savedCurrency && data.settings.currencyRates[savedCurrency]) {
            setCurrencyState(savedCurrency);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (isClient) {
      localStorage.setItem("jl-currency", newCurrency);
    }
  };

  const convertPrice = (priceInOMR: number): number => {
    if (!config) return priceInOMR;
    const rate = config.currencyRates[currency] || 1;
    return Math.round(priceInOMR * rate);
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency];
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        currency,
        setCurrency,
        convertPrice,
        getCurrencySymbol,
        isLoading,
        refreshConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
}

export function usePrice() {
  const { currency, convertPrice, getCurrencySymbol } = useConfig();

  const formatPrice = (priceInOMR: number, showCurrency = true) => {
    const converted = convertPrice(priceInOMR);
    const symbol = getCurrencySymbol();

    if (currency === 'USD') {
      return showCurrency ? `$${converted.toLocaleString()}` : converted.toLocaleString();
    }
    return showCurrency ? `${converted.toLocaleString('ar-SA')} ${symbol}` : converted.toLocaleString('ar-SA');
  };

  return { formatPrice, currency, convertPrice, getCurrencySymbol };
}

export const currencies: { code: Currency; name: string; nameAr: string; symbol: string }[] = [
  { code: "OMR", name: "Omani Rial", nameAr: "ريال عماني", symbol: "ر.ع" },
  { code: "SAR", name: "Saudi Riyal", nameAr: "ريال سعودي", symbol: "ر.س" },
  { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي", symbol: "$" },
  { code: "AED", name: "UAE Dirham", nameAr: "درهم إماراتي", symbol: "د.إ" },
];
