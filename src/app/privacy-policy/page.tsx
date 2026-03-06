import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/utils/supabase/server-data";

export const dynamic = 'force-dynamic';

async function getSiteContent() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('site_content')
    .select('privacy_policy')
    .eq('id', 'main')
    .single();
  return data;
}

export default async function PrivacyPolicyPage() {
  const content = await getSiteContent();

  const defaultContent = `نحن في JL Digital Marketing نحترم خصوصية زوّارنا وعملائنا، ونلتزم بحماية البيانات الشخصية التي يتم جمعها ومعالجتها عبر موقعنا الإلكتروني ومنصاتنا الرقمية. تهدف هذه السياسة إلى توضيح نوعية البيانات التي نجمعها، وكيفية استخدامها، وحقوقك تجاهها.

1. البيانات التي نقوم بجمعها
- بيانات الهوية الأساسية: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، الدولة أو المدينة.
- بيانات الدفع والفوترة: قد نطلب بعض بيانات الدفع عند شراء الدورات أو المنتجات الرقمية أو الاشتراك في الخدمات.
- بيانات الاستخدام: مثل الصفحات التي تزورها، الوقت الذي تقضيه على الموقع، نوع الجهاز والمتصفح.
- بيانات تتعلق بالتواصل: رسائلك واستفساراتك عبر نماذج التواصل أو البريد الإلكتروني.

2. كيفية استخدامنا لبياناتك
نستخدم البيانات التي نجمعها للأغراض التالية:
- تقديم خدماتنا في التسويق الرقمي، والاستشارات، والدورات، والمنتجات الرقمية.
- إدارة حسابك، ومعالجة طلبات الشراء، وإرسال فواتير أو إيصالات الدفع.
- إرسال تحديثات تتعلق بالدورات أو الخدمات التي تسجلت فيها.
- تحسين محتوى الموقع وتجربة المستخدم، وتحليل أداء الحملات التسويقية.
- الالتزام بالمتطلبات القانونية والتنظيمية المعمول بها.

3. ملفات تعريف الارتباط (Cookies)
قد يستخدم موقعنا ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربة التصفح، وتذكّر تفضيلاتك، وجمع بيانات إحصائية حول استخدام الموقع. يمكنك التحكم في إعدادات الكوكيز من خلال إعدادات المتصفح لديك.

4. مشاركة البيانات مع أطراف ثالثة
قد نشارك بعض بياناتك مع جهات خارجية موثوقة فقط في الحالات التالية:
- مزودي خدمات الدفع الإلكتروني ومعالجة البطاقات.
- مزودي خدمات البريد الإلكتروني وأتمتة الرسائل.
- شركاء تقنيون يساعدوننا في استضافة الموقع، وتحليل الأداء، وتحسين الخدمات.
لن نقوم ببيع بياناتك الشخصية لأي طرف ثالث تحت أي ظرف.

5. الاحتفاظ بالبيانات
نحتفظ ببياناتك الشخصية للمدة اللازمة لتحقيق الأغراض المذكورة في هذه السياسة، أو وفق ما تقتضيه القوانين المعمول بها.

6. أمان البيانات
نطبق مجموعة من التدابير الفنية والتنظيمية لحماية بياناتك من الوصول غير المصرح به، أو التعديل، أو الإفصاح، أو الإتلاف.

7. حقوقك تجاه بياناتك
يحق لك:
- طلب الاطلاع على البيانات التي نحتفظ بها عنك.
- طلب تصحيح أو تحديث بياناتك الشخصية.
- طلب حذف بياناتك أو تقييد معالجتها.
- إلغاء الاشتراك من القوائم البريدية في أي وقت.

8. تحديثات سياسة الخصوصية
قد نقوم بتحديث هذه السياسة من وقت لآخر بما يتوافق مع التغييرات القانونية أو التشغيلية. سيتم نشر أي تعديل على هذه الصفحة مع تحديث تاريخ آخر تعديل.

9. التواصل معنا
لأي استفسار بخصوص سياسة الخصوصية أو استخدام بياناتك، يمكنك التواصل معنا عبر:
- البريد الإلكتروني: support@jldigitalmarketing.com
- نموذج التواصل داخل الموقع`;

  const privacyText = content?.privacy_policy || defaultContent;
  const sections = privacyText.split('\n\n').filter((s: string) => s.trim());

  return (
    <div className="relative min-h-screen font-sans bg-black flex flex-col">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-24 w-full max-w-4xl mx-auto">
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            سياسة الخصوصية – JL Digital Marketing
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
