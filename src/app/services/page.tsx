import Link from "next/link";
import { getServices } from "@/utils/supabase/server-data";
import PriceDisplay from "@/components/PriceDisplay";

export const metadata = {
  title: "خدماتنا | JL Digital",
  description: "حلول تسويق رقمي شاملة لبناء وتوسيع أعمالك",
};

export default async function ServicesPage() {
  const services = await getServices();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-center">خدماتنا</h1>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          حلول رقمية شاملة مصممة لتوسيع أعمالك
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8 hover:border-gray-600 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
                <div className="relative z-10">
                <div className="inline-block px-3 py-1 rounded-full border border-gray-700 text-xs text-gray-400 mb-4">
                  {service.timeline_ar}
                </div>
                
                <h2 className="text-2xl font-bold mb-2 group-hover:text-gray-200 transition-colors">
                  {service.title_ar}
                </h2>
                <p className="text-gray-400 mb-6">{service.subtitle_ar}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">يبدأ من</span>
                  <span className="text-xl font-bold">
                    <PriceDisplay priceInOMR={service.pricing_basic} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">لا توجد خدمات متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
