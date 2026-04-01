import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/utils/supabase/server-only";

export const dynamic = 'force-dynamic';

async function getSiteContent() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('site_content')
    .select('terms')
    .eq('id', 'main')
    .single();
  return data;
}

export default async function TermsPage() {
  const content = await getSiteContent();

  const defaultContent = `باستخدامك لموقع BAYYA BUSINESS أو شرائك لأي من خدماتنا أو دوراتنا أو منتجاتنا الرقمية، فإنك تقر بأنك قرأت هذه الشروط وفهمتها ووافقت على الالتزام بها. إذا لم توافق على أي جزء منها، يُرجى التوقف عن استخدام الموقع والخدمات.

1. نطاق الخدمات
نُقدّم من خلال هذا الموقع:
- خدمات التسويق الرقمي والاستشارات.
- دورات تدريبية وكورسات أونلاين.
- منتجات رقمية مثل الكتب الإلكترونية، الملفات الجاهزة، وقوالب المتاجر.
- إعداد وتنفيذ حملات وخدمات مخصصة للعملاء.

2. الحسابات والاشتراكات
- قد يتطلب الوصول إلى بعض الدورات أو المنتجات إنشاء حساب مستخدم وتسجيل الدخول.
- أنت مسؤول عن سرية بيانات الدخول الخاصة بك وعدم مشاركتها مع أي طرف آخر.
- يحق لنا تعليق أو إلغاء أي حساب يثبت سوء استخدامه أو مخالفته لهذه الشروط.

3. الأسعار والمدفوعات
- جميع الأسعار المعروضة قابلة للتغيير في أي وقت.
- يتم توضيح سعر كل خدمة أو منتج رقمي وقت الشراء.
- تتم عمليات الدفع عبر مزودي دفع معتمدين وآمنين.

4. سياسة الاسترجاع والإلغاء
- بسبب طبيعة المنتجات الرقمية والدورات الأونلاين، قد تكون بعض المشتريات غير قابلة للاسترجاع بعد إتاحة المحتوى.
- بالنسبة للخدمات الاستشارية أو حملات التسويق، يتم تنظيم الاسترجاع حسب الاتفاقية المبرمة.

5. الحقوق الفكرية
- جميع المحتويات المعروضة على الموقع مملوكة لـ BAYYA BUSINESS.
- لا يُسمح بنسخ أو إعادة نشر أو بيع أي جزء من المحتوى دون إذن خطّي مسبق.

6. استخدام الموقع
تلتزم بعدم استخدام الموقع أو الخدمات لأي أغراض غير قانونية أو مخالفة للأنظمة.

7. إخلاء المسؤولية
- يتم تقديم المحتوى والخدمات كما هي.
- لا نضمن تحقيق نتائج محددة في المبيعات أو الأرباح.

8. التعديلات على الشروط
قد نقوم بتحديث هذه الشروط من وقت لآخر. استمرار استخدامك للموقع يعني موافقتك على الشروط الجديدة.

9. القانون المختص
تُفسّر هذه الشروط وتُنفّذ وفق القوانين المعمول بها في سلطنة عُمان.`;

  const termsText = content?.terms || defaultContent;
  const sections = termsText.split('\n\n').filter((s: string) => s.trim());

  return (
    <div className="relative min-h-screen font-sans bg-black flex flex-col">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-24 w-full max-w-4xl mx-auto">
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            الشروط والأحكام – BAYYA BUSINESS
          </h1>

          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            {sections.map((section: string, index: number) => {
              if (section.match(/^\d+\./)) {
                const [title, ...body] = section.split('\n');
                return (
                  <div key={index} className="space-y-2">
                    <h2 className="text-xl font-bold text-white pt-4">{title}</h2>
                    {body.length > 0 && (
                      <div className="space-y-1">
                        {body.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return <p key={index}>{section}</p>;
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
