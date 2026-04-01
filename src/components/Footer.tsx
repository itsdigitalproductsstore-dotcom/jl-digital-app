"use client";

import Link from "next/link";
import { useConfig, currencies, type Currency } from "@/context/ConfigContext";
import { useState } from "react";
import { ChevronDown, Globe, MapPin, Shield } from "lucide-react";

export default function Footer() {
  const { config, currency, setCurrency } = useConfig();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const originCountry = config?.originCountry || "سلطنة عُمان";

  return (
    <footer className="relative z-10 w-full bg-black border-t border-gray-800 mt-20 footer-root">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-16 max-w-[1920px] mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-4">
              {config?.siteNameAr || "BAYYA BUSINESS"}
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              {config?.siteDescriptionAr || "أدوات تسويق رقمي عالية المستوى مبنية على بروتوكول البناء من الصفر لتعزيز نمو المشاريع الناشئة"}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6 brand-badges">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full oman-trust-badge">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">شريك موثوق</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full oman-origin-badge">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">{originCountry}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <div className="relative">
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <span>{currency}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50 min-w-[150px]">
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full px-4 py-2 hover:bg-gray-800 transition-colors flex items-center justify-between ${currency === curr.code ? 'bg-gray-800 text-white' : 'text-gray-300'
                          }`}
                      >
                        <span>{curr.code}</span>
                        <span className="text-sm text-gray-500">{curr.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">الخدمات</h3>
            <ul className="space-y-3">
              <li><Link href="/services/funnels" className="text-gray-400 hover:text-white transition-colors">بناء Funnels</Link></li>
              <li><Link href="/academy" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">BAYYA Community</Link></li>
              <li><Link href="/services/ads" className="text-gray-400 hover:text-white transition-colors">الإعلانات المدفوعة</Link></li>
              <li><Link href="/services/content" className="text-gray-400 hover:text-white transition-colors">إنتاج المحتوى</Link></li>
              <li><Link href="/services/branding" className="text-gray-400 hover:text-white transition-colors">هوية العلامة</Link></li>
              <li><Link href="/services/automation" className="text-gray-400 hover:text-white transition-colors">الأتمتة</Link></li>
              <li><Link href="/services/analytics" className="text-gray-400 hover:text-white transition-colors">التحليلات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">الشركاء المؤسسون</h3>
            <ul className="space-y-3">
              <li className="text-gray-300">{config?.partner1 || "الأستاذ فرج"}</li>
              <li className="text-gray-300">{config?.partner2 || "جاسم محمد"}</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-2 oman-badge">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-400">{originCountry}</span>
              </div>
              <p className="text-xs text-gray-500">صُنع بفخر في السلطنة</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 {config?.siteNameAr || "BAYYA BUSINESS"}. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-white transition-colors text-sm">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm">
              الشروط والأحكام
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-white transition-colors text-sm">
              الأسئلة الشائعة
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm">
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
