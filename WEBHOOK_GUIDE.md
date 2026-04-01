# 🚀 دليل ربط مؤشرات الأداء (KPI Webhook Guide)

هذا البحث يشرح كيفية تحديث مؤشرات الأداء في لوحة التحكم الخاصة بك تلقائياً باستخدام **ManyChat** أو **Zapier** أو أي أداة أتمتة أخرى.

## 1. تفاصيل الرابط (Endpoint)
- **URL:** `https://your-domain.com/api/webhooks/kpi`
- **Method:** `POST`
- **Content-Type:** `application/json`

## 2. هيكل البيانات (Payload Format)

يجب إرسال البيانات بالتنسيق التالي:

```json
{
  "api_key": "مفتاح_الـ_API_الخاص_بك",
  "metric_key": "المفتاح_الخاص_بالمؤشر",
  "value": 1500,
  "increment": false
}
```

### شرح الحقول:
- `api_key`: المفتاح السري الموجود في صفحة الـ KPIs بلوحة التحكم.
- `metric_key`: المفتاح البرمجي للمؤشر (انظر القائمة أدناه).
- `value`: القيمة الجديدة (رقم).
- `increment`: (اختياري) إذا كان `true` سيتم إضافة القيمة إلى القيمة الحالية بدلاً من استبدالها.

## 3. مفاتيح المؤشرات المتاحة (Metric Keys)

| المفتاح (metric_key) | الوصف بالعربي |
| :--- | :--- |
| `revenue` | إجمالي الإيرادات (ر.ع) |
| `leads` | إجمالي العملاء المحتملين |
| `manychat_subscribers` | مشتركين ماني تشات |
| `website_visitors` | زوار الموقع |
| `email_list` | قائمة البريد الإلكتروني |
| `closed_deals` | الصفقات المغلقة |
| `conversion_rate` | معدل التحويل (%) |

## 4. مثال للربط مع ManyChat (External Request)

1. في الـ Flow الخاص بك، أضف **External Request**.
2. اختر النوع `POST`.
3. ضع الرابط: `https://your-domain.com/api/webhooks/kpi`.
4. في الـ Body، ضع الـ JSON المذكور أعلاه مع استبدال القيم بمتغيرات ماني تشات (Custom Fields).

---
*ملاحظة: يمكنك العثور على رابط الـ Webhook الفعلي ومفتاح الـ API الخاص بك في لوحة تحكم الإدارة تحت تبويب "مؤشرات الأداء".*
