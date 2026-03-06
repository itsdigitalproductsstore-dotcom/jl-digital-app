-- Page Content Migration
-- Add columns to site_content table for managing static pages

-- Add privacy policy content
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- Add terms content
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS terms TEXT;

-- Add FAQ items as JSONB
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS faq_items JSONB;

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to page content
DROP POLICY IF EXISTS "Public read access to page content" ON site_content;
CREATE POLICY "Public read access to page content" ON site_content FOR SELECT USING (true);

-- Allow authenticated users to update page content
DROP POLICY IF EXISTS "Auth users can update page content" ON site_content;
CREATE POLICY "Auth users can update page content" ON site_content FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default FAQ items if not exists
UPDATE site_content 
SET faq_items = '[
  {"question": "ما نوع الخدمات التي تقدمها JL Digital Marketing؟", "answer": "نقدّم خدمات التسويق الرقمي المتكاملة، وتشمل: إعداد الاستراتيجيات، إدارة الحملات الإعلانية، بناء الفنلات وصفحات الهبوط، الاستشارات الفردية، إضافة إلى دورات تدريبية ومنتجات رقمية مثل الكتب والقوالب والمتاجر الجاهزة."},
  {"question": "هل الأسعار ثابتة أم تتغير؟", "answer": "الأسعار الأساسية لكل خدمة أو برنامج تدريب يتم توضيحها وقت الشراء، لكنها قد تتغير من فترة لأخرى بحسب العروض والخصومات والتحديثات."},
  {"question": "كيف تتم عملية الدفع؟", "answer": "تتم عملية الدفع إلكترونيًا عبر مزودي دفع آمنين (مثل بوابات الدفع المعتمدة أو البطاقات البنكية)."},
  {"question": "هل يمكن استرجاع المبلغ بعد شراء دورة أو منتج رقمي؟", "answer": "بشكل عام، المنتجات الرقمية والدورات الأونلاين تكون غير قابلة للاسترجاع بعد فتح المحتوى."},
  {"question": "هل يمكن تخصيص الخدمات بحسب احتياج مشروعي؟", "answer": "نعم، نقدم خطط وخدمات مخصّصة حسب طبيعة نشاطك وميزانيتك وأهدافك."},
  {"question": "كيف أتواصل معكم لطلب خدمة أو استشارة؟", "answer": "يمكنك التواصل عبر نموذج الاتصال في الموقع أو عبر البريد الإلكتروني."},
  {"question": "هل تقدمون دعمًا بعد شراء الدورات أو المنتجات الرقمية؟", "answer": "نعم، في معظم البرامج التدريبية والمنتجات الرقمية نوفر قناة دعم أو متابعة."}
]'::jsonb
WHERE id = 'main' AND (faq_items IS NULL OR faq_items = 'null'::jsonb);

-- Update privacy policy default content
UPDATE site_content 
SET privacy_policy = 'نحن في JL Digital Marketing نحترم خصوصية زوّارنا وعملائنا، ونلتزم بحماية البيانات الشخصية التي يتم جمعها ومعالجتها عبر موقعنا الإلكتروني ومنصاتنا الرقمية.

1. البيانات التي نقوم بجمعها
- بيانات الهوية الأساسية: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، الدولة أو المدينة.
- بيانات الدفع والفوترة: قد نطلب بعض بيانات الدفع عند شراء الدورات أو المنتجات الرقمية.
- بيانات الاستخدام: مثل الصفحات التي تزورها، الوقت الذي تقضيه على الموقع.
- بيانات تتعلق بالتواصل: رسائلك واستفساراتك عبر نماذج التواصل.

2. كيفية استخدامنا لبياناتك
نستخدم البيانات لتقديم خدماتنا، إدارة حسابك، إرسال تحديثات، تحسين تجربة المستخدم، والالتزام بالمتطلبات القانونية.

3. ملفات تعريف الارتباط (Cookies)
قد يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح. يمكنك التحكم في إعدادات الكوكيز من خلال إعدادات المتصفح.

4. مشاركة البيانات مع أطراف ثالثة
قد نشارك بياناتك مع مزودي خدمات الدفع، البريد الإلكتروني، والشركاء التقنيين فقط عند الحاجة.

5. الاحتفاظ بالبيانات
نحتفظ ببياناتك للمدة اللازمة لتحقيق الأغراض المذكورة.

6. أمان البيانات
نطبق تدابير تقنية وتنظيمية لحماية بياناتك.

7. حقوقك تجاه بياناتك
يحق لك طلب الاطلاع، التصحيح، الحذف، أو إلغاء الاشتراك.

8. تحديثات سياسة الخصوصية
قد نقوم بتحديث هذه السياسة. استمرار استخدامك للموقع يعد موافقة على السياسة المعدّلة.

9. التواصل معنا
لأي استفسار، تواصل معنا عبر support@jldigitalmarketing.com'
WHERE id = 'main' AND (privacy_policy IS NULL OR privacy_policy = '');

-- Update terms default content
UPDATE site_content 
SET terms = 'باستخدامك لموقع JL Digital Marketing أو شرائك لأي من خدماتنا، فإنك تقر بأنك قرأت هذه الشروط ووافقت على الالتزام بها.

1. نطاق الخدمات
نقدّم: خدمات التسويق الرقمي، الدورات التدريبية، المنتجات الرقمية، والخدمات المخصصة.

2. الحسابات والاشتراكات
أنت مسؤول عن سرية بيانات دخولك. يحق لنا تعليق أي حساب يثبت سوء استخدامه.

3. الأسعار والمدفوعات
الأسعار قابلة للتغيير. الدفع عبر مزودي دفع آمنين.

4. سياسة الاسترجاع
المنتجات الرقمية والدورات الأونلاين قد تكون غير قابلة للاسترجاع بعد فتح المحتوى.

5. الحقوق الفكرية
جميع المحتويات مملوكة لـ JL Digital Marketing ومحمية بقوانين الملكية الفكرية.

6. استخدام الموقع
تلتزم بعدم استخدام الموقع لأي أغراض غير قانونية.

7. إخلاء المسؤولية
نقدم المحتوى كما هو. لا نضمن نتائج محددة.

8. التعديلات على الشروط
قد نقوم بتحديث هذه الشروط. استمرار الاستخدام يعني الموافقة.

9. القانون المختص
تُفسّر هذه الشروط وفق قوانين سلطنة عُمان.'
WHERE id = 'main' AND (terms IS NULL OR terms = '');
