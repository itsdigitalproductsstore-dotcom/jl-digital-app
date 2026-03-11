import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/utils/supabase/server-only";

export const dynamic = 'force-dynamic';

async function getSiteContent() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('site_content')
    .select('about_title, about_text')
    .eq('id', 'main')
    .single();
  return data;
}

export default async function AboutPage() {
  const content = await getSiteContent();

  const title = content?.about_title || 'JL Digital Marketing';
  const aboutText = content?.about_text || `نحن JL Digital Marketing، وكالة متخصصة في حلول التسويق الرقمي الموجّهة لأصحاب الأعمال وروّاد المشاريع الباحثين عن نمو حقيقي وعائد measurable على الاستثمار الإعلاني.

نعمل على تصميم وتنفيذ استراتيجيات تسويقية متكاملة، تجمع بين التخطيط الدقيق، وصياغة الرسائل الإعلانية الاحترافية، وبناء مسارات تسويق (Funnels) مدروسة، بهدف تحويل التفاعل إلى عملاء حقيقيين وعقود مبيعات مستمرة.

تعتمد منهجيتنا على فهم عميق لطبيعة نشاط العميل، وسلوك جمهوره المستهدف، ثم ترجمة ذلك إلى حملات رقمية قائمة على البيانات، يتم تحسينها بشكل دوري وفق مؤشرات أداء واضحة.

في JL Digital، ننظر إلى التسويق بوصفه شراكة طويلة الأمد، نلتزم فيها بالشفافية، ودقة الأرقام، وتطوير الأداء، بما يضمن للعميل منظومة تسويق رقمية مستقرة وقابلة للتوسع.`;

  const paragraphs = aboutText.split('\n\n').filter((p: string) => p.trim());

  return (
    <div className="relative min-h-screen font-sans bg-black flex flex-col">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-24 w-full max-w-4xl mx-auto">
        <div className="space-y-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
            {title}
          </h1>

          <div className="space-y-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl">
            {paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
