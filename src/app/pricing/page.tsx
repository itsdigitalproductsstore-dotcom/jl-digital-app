import { getServices } from "@/utils/supabase/server-data";
import PriceDisplay from "@/components/PriceDisplay";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "التسعير | JL Digital",
  description: "أسعار خدمات التسويق الرقمي - اختر الخطة المناسبة لاحتياجاتك",
};

export default async function PricingPage() {
  const services = await getServices();

  const packages = [
    { key: "basic", label: "الأساسي", labelEn: "Basic", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", button: "bg-blue-600 hover:bg-blue-700" },
    { key: "pro", label: "احترافي", labelEn: "Pro", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", button: "bg-purple-600 hover:bg-purple-700", popular: true },
    { key: "enterprise", label: "مؤسسي", labelEn: "Enterprise", color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30", button: "bg-amber-600 hover:bg-amber-700" },
  ];

  const getPrice = (service: any, packageKey: string) => {
    switch (packageKey) {
      case "basic": return service.pricing_basic;
      case "pro": return service.pricing_pro;
      case "enterprise": return service.pricing_enterprise;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-center">التسعير</h1>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          اختر الخطة المثالية لتطوير عملك الرقمي
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] overflow-hidden"
            >
              <div className="p-8">
                <div className="inline-block px-3 py-1 rounded-full border border-gray-700 text-xs text-gray-400 mb-4">
                  {service.timeline_ar}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{service.title_ar}</h2>
                <p className="text-gray-400 mb-6">{service.subtitle_ar}</p>

                <div className="space-y-4 mb-8">
                  {packages.map((pkg) => (
                    <div key={pkg.key} className={`bg-gradient-to-r ${pkg.color} rounded-xl p-4 border ${pkg.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{pkg.label}</span>
                        {pkg.popular && (
                          <span className="text-xs bg-white/10 px-2 py-1 rounded-full">الأكثر شعبية</span>
                        )}
                      </div>
                      <div className="text-3xl font-bold">
                        <PriceDisplay priceInOMR={getPrice(service, pkg.key)} />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/services/${service.slug}`}
                  className="block w-full bg-white text-black text-center py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">لا توجد خدمات متاحة حالياً</p>
            <Link href="/services" className="inline-block mt-4 text-white underline">
              العودة للخدمات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
