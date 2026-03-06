import { getServiceBySlug, getServices } from "@/utils/supabase/server-data";
import PriceDisplay from "@/components/PriceDisplay";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  
  if (!service) {
    return {
      title: "الخدمة غير موجودة | JL Digital",
    };
  }

  return {
    title: `${service.title} | JL Digital`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const features = Array.isArray(service.features) ? service.features : [];
  const featuresAr = Array.isArray(service.features_ar) ? service.features_ar : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <Link 
          href="/services" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-12"
        >
          ← العودة للخدمات
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-block px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-400 mb-6">
              {service.timeline_ar}
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">{service.title_ar}</h1>
            <p className="text-2xl text-gray-400 mb-8">{service.subtitle_ar}</p>
            <p className="text-lg text-gray-300 leading-relaxed mb-12">
              {service.description_ar}
            </p>

            <h2 className="text-2xl font-bold mb-6">مميزات الخدمة</h2>
            <ul className="space-y-4">
              {featuresAr.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-[2rem] p-8">
              <h3 className="text-2xl font-bold mb-8 text-center">اختر الباقة</h3>
              
              <div className="space-y-4">
                <a 
                  href={`/checkout?service=${service.slug}&package=basic`}
                  className="block p-6 rounded-2xl border border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold">Basic</span>
                    <span className="text-2xl font-bold">
                      <PriceDisplay priceInOMR={service.pricing_basic} />
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">مميزات أساسية للبدء</p>
                </a>

                <a 
                  href={`/checkout?service=${service.slug}&package=pro`}
                  className="block p-6 rounded-2xl border border-gray-700 hover:border-white hover:bg-gray-900/50 transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold">Pro</span>
                    <span className="text-2xl font-bold">
                      <PriceDisplay priceInOMR={service.pricing_pro} />
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">حل متكامل للتوسع</p>
                </a>

                <a 
                  href={`/checkout?service=${service.slug}&package=enterprise`}
                  className="block p-6 rounded-2xl border border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold">Enterprise</span>
                    <span className="text-2xl font-bold">
                      <PriceDisplay priceInOMR={service.pricing_enterprise} />
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">مميزات كاملة مع دعم أولوية</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
