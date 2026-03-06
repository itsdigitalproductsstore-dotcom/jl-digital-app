"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from '@stripe/stripe-js';
import { getServiceBySlug } from "@/data/services";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import PriceDisplay from "@/components/PriceDisplay";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";

const steps = [
  { id: 1, title: "معلومات الطلب", icon: Check },
  { id: 2, title: "اختر الباقة", icon: CreditCard },
  { id: 3, title: "الدفع", icon: CreditCard },
  { id: 4, title: "تأكيد", icon: Check },
];

interface FormData {
  service: string;
  package: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "bank">("stripe");
  const [paymentSettings, setPaymentSettings] = useState<{
    stripe_enabled: boolean;
    stripe_public_key: string;
    bank_transfer_enabled: boolean;
    bank_account_name: string;
    bank_account_number: string;
    bank_name: string;
    bank_iban: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      setCurrentStep(4);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadPaymentSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('payment_settings')
        .eq('id', 'default')
        .single();

      if (data?.payment_settings) {
        setPaymentSettings(data.payment_settings);
      }
    }
    loadPaymentSettings();
  }, []);

  const serviceSlug = searchParams.get("service") || "funnels";
  const packageType = searchParams.get("package") || "pro";
  const service = getServiceBySlug(serviceSlug);

  const [formData, setFormData] = useState<FormData>({
    service: serviceSlug,
    package: packageType,
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  if (!service) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">الخدمة غير موجودة</h1>
          <button
            onClick={() => router.push("/services")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← العودة للخدمات
          </button>
        </div>
      </div>
    );
  }

  const packagePrices = {
    basic: service.pricing.basic,
    pro: service.pricing.pro,
    enterprise: service.pricing.enterprise,
  };

  const price = packagePrices[packageType as keyof typeof packagePrices] || service.pricing.pro;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStripePayment = async () => {
    setIsLoading(true);
    setPaymentError(null);
    try {
      // 🛡️ Stripe Shield: Pre-check configuration
      if (!paymentSettings?.stripe_public_key || !paymentSettings?.stripe_enabled) {
        throw new Error("STRIPE_CONFIG_ERROR");
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: service.title,
          serviceTitleAr: service.titleAr,
          packageType: formData.package,
          price: price, // Use the 'price' variable already defined
          currency: "OMR", // Use "OMR" as currency
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          companyName: formData.company,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("sk_")) throw new Error("STRIPE_KEY_ERROR");
        throw new Error(data.error || "PAYMENT_FAILED");
      }

      // Load stripe directly using loadStripe
      const stripe = await loadStripe(paymentSettings.stripe_public_key);
      if (!stripe) throw new Error("STRIPE_LOAD_ERROR");

      const { error } = await (stripe as unknown as { redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: Error }> }).redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) throw error;
    } catch (err: unknown) {
      console.error("Payment error:", err);

      let errorMessage = "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.";

      if (err instanceof Error) {
        if (err.message === "STRIPE_CONFIG_ERROR") {
          errorMessage = "نظام الدفع عبر Stripe غير مهيأ حالياً. يرجى التواصل مع الدعم الفني.";
        } else if (err.message === "STRIPE_KEY_ERROR") {
          errorMessage = "خطأ في تهيئة مفاتيح Stripe. يرجى التأكد من الإعدادات في لوحة التحكم.";
        } else if (err.message === "STRIPE_LOAD_ERROR") {
          errorMessage = "تعذر تحميل مكتبة Stripe. يرجى التحقق من اتصال الإنترنت.";
        } else if (err.message === "PAYMENT_FAILED") {
          errorMessage = "فشل إنشاء جلسة الدفع. يرجى التحقق من بياناتك والمحاولة مرة أخرى.";
        }
      }

      setPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (paymentMethod === "stripe") {
      await handleStripePayment();
    } else {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCurrentStep(4);
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 ml-2" /> العودة
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">إتمام الطلب</h1>
          <p className="text-gray-400">أكمل طلبك في خطوات بسيطة</p>
        </div>

        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id ? "bg-white text-black" : "bg-gray-800 text-gray-500"}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 ${currentStep >= step.id ? "text-white" : "text-gray-500"}`}>{step.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">معلومات الطلب</h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الاسم الكامل</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none" placeholder="أدخل اسمك الكامل" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none" placeholder="أدخل بريدك الإلكتروني" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">رقم الهاتف</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none" placeholder="أدخل رقم هاتفك" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الشركة (اختياري)</label>
                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none" placeholder="اسم شركتك" />
                  </div>
                </div>
                <button onClick={nextStep} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  متابعة <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">اختر الباقة</h2>
                <div className="space-y-4 mb-8">
                  {(["basic", "pro", "enterprise"] as const).map((pkg) => (
                    <label key={pkg} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.package === pkg ? "border-white bg-gray-800" : "border-gray-700 hover:border-gray-500"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="package" value={pkg} checked={formData.package === pkg} onChange={(e) => setFormData((prev) => ({ ...prev, package: e.target.value }))} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.package === pkg ? "border-white" : "border-gray-500"}`}>
                          {formData.package === pkg && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-semibold capitalize">{pkg}</span>
                      </div>
                      <span className="text-xl font-bold"><PriceDisplay priceInOMR={packagePrices[pkg]} /></span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors">رجوع</button>
                  <button onClick={nextStep} className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">متابعة <ArrowLeft className="w-5 h-5 rotate-180" /></button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">الدفع</h2>
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-400">الخدمة</span><span>{service.title}</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-400">الباقة</span><span className="capitalize">{formData.package}</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700"><span className="font-bold">الإجمالي</span><span className="text-2xl font-bold"><PriceDisplay priceInOMR={price} /></span></div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-3">اختر طريقة الدفع</label>
                  <div className="space-y-3">
                    {paymentSettings?.stripe_enabled && (
                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "stripe" ? "border-white bg-gray-800" : "border-gray-700 hover:border-gray-500"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "stripe" ? "border-white" : "border-gray-500"}`}>
                            {paymentMethod === "stripe" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-semibold">بطاقةVisa أو Mastercard</span>
                          </div>
                        </div>
                        <svg className="h-8" viewBox="0 0 48 16" fill="none">
                          <rect width="48" height="16" rx="2" fill="#1A1F71" />
                          <path d="M19 11.5C19 10.67 18.33 10 17.5 10H15C14.17 10 13.5 10.67 13.5 11.5V12.5C13.5 13.33 14.17 14 15 14H17.5C18.33 14 19 13.33 19 12.5V11.5Z" fill="white" />
                          <path d="M25 10.2C25.6 10.2 26.1 10.4 26.5 10.8L26.4 11.6C26.1 11.4 25.6 11.2 25 11.2C23.6 11.2 22.6 12.2 22.6 13.4C22.6 14.5 23.5 15.2 24.4 15.2C25.1 15.2 25.6 14.9 26 14.5L26.1 15.3C25.6 15.8 24.9 16 24.1 16C22.4 16 20.9 14.6 20.9 12.5C20.9 10.5 22.3 10.2 23.1 10.2H25ZM28 10.2C29.4 10.2 30.6 11.3 30.6 13.3C30.6 15.2 29.4 16 28 16C26.6 16 25.4 15.2 25.4 13.3C25.4 11.3 26.6 10.2 28 10.2ZM28 11.1C27.3 11.1 26.8 11.8 26.8 13C26.8 14.3 27.3 14.9 28 14.9C28.7 14.9 29.2 14.3 29.2 13C29.2 11.8 28.7 11.1 28 11.1ZM33 10H34.5V15H33V10ZM39.2 10.2C40.3 10.2 41.1 10.8 41.1 12.1C41.1 13.1 40.5 13.8 39.5 14L41 15.8H39.6L38.3 14.1H37V15.8H35.5V10H38.2C39 10 39.2 10.3 39.2 10.8V10.2ZM38.3 11.4H37V12.8H38.3C38.9 12.8 39.2 12.5 39.2 12C39.2 11.5 38.9 11.4 38.3 11.4ZM19 4.5C19 3.67 18.33 3 17.5 3H15C14.17 3 13.5 3.67 13.5 4.5V5.5C13.5 6.33 14.17 7 15 7H17.5C18.33 7 19 6.33 19 5.5V4.5Z" fill="#F7B600" />
                        </svg>
                      </label>
                    )}

                    {paymentSettings?.bank_transfer_enabled && (
                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "bank" ? "border-white bg-gray-800" : "border-gray-700 hover:border-gray-500"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bank" ? "border-white" : "border-gray-500"}`}>
                            {paymentMethod === "bank" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-semibold">تحويل بنكي</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {paymentMethod === "bank" && paymentSettings?.bank_transfer_enabled && (
                  <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-2">الرجاء التحويل للحساب التالي:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">البنك:</span><span>{paymentSettings.bank_name || 'غير محدد'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">اسم الحساب:</span><span>{paymentSettings.bank_account_name || 'غير محدد'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">رقم الحساب:</span><span className="font-mono">{paymentSettings.bank_account_number || 'غير محدد'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">IBAN:</span><span className="font-mono">{paymentSettings.bank_iban || 'غير محدد'}</span></div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <label className="block text-sm text-gray-400 mb-2">ملاحظات إضافية (اختياري)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none resize-none" placeholder="أي معلومات إضافية..." />
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors">رجوع</button>
                  <div className="flex-1 flex flex-col gap-2">
                    {paymentError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-4 py-3 rounded-xl text-center">
                        ⚠️ {paymentError}
                      </div>
                    )}
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : paymentMethod === "stripe" ? <>الدفع عبر Stripe <CreditCard className="w-5 h-5" /></> : <>تأكيد الطلب <Check className="w-5 h-5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-500" /></div>
                <h2 className="text-3xl font-bold mb-4">تم تأكيد الطلب!</h2>
                <p className="text-gray-400 mb-8">شكراً لطلبك. سنراجع إيصال الدفع ونتواصل معك خلال 24 ساعة.</p>
                <div className="bg-gray-800/50 rounded-xl p-6 text-right mb-8">
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-400">رقم الطلب</span><span className="font-mono">#ORD-{Date.now().toString().slice(-8)}</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-400">الخدمة</span><span>{service.title}</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-400">الباقة</span><span className="capitalize">{formData.package}</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700"><span className="font-bold">المبلغ المدفوع</span><span className="text-2xl font-bold"><PriceDisplay priceInOMR={price} /></span></div>
                </div>
                <button onClick={() => router.push("/dashboard/client")} className="bg-white text-black font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-colors">الذهاب للوحة التحكم</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutInner />
    </Suspense>
  );
}
