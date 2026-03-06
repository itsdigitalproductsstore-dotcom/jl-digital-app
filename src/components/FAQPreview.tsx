"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { getFAQItems, type FAQItem } from "@/app/actions";

const defaultFaqs: FAQItem[] = [
    {
        question: "How long does it take to build a funnel?",
        question_ar: "كم يستغرق بناء الفانل؟",
        answer: "Typically 2-4 weeks depending on complexity.",
        answer_ar: "عادة ما يستغرق من 2 إلى 4 أسابيع حسب التعقيد."
    },
    {
        question: "Which platforms do you run ads on?",
        question_ar: "ما هي المنصات التي تديرون الإعلانات عليها؟",
        answer: "Meta (Instagram/Facebook), Google, TikTok, and Snapchat.",
        answer_ar: "ميتا (إنستقرام/فيسبوك)، جوجل، تيك توك، وسناب شات."
    },
    {
        question: "Do you offer branding services?",
        question_ar: "هل تقدمون خدمات الهوية البصرية؟",
        answer: "Yes, we provide full brand strategy and identity design.",
        answer_ar: "نعم، نقدم استراتيجية كاملة للعلامة التجارية وتصميم الهوية."
    },
    {
        question: "How do I get started?",
        question_ar: "كيف أبدأ معكم؟",
        answer: "Simply book a free strategy session through the button at the top.",
        answer_ar: "ببساطة، احجز جلسة استراتيجية مجانية من خلال الزر الموجود في الأعلى."
    }
];

export default function FAQPreview() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadFaqs = async () => {
            try {
                const data = await getFAQItems();
                if (data && data.length > 0) {
                    setFaqs(data.slice(0, 4));
                } else {
                    setFaqs(defaultFaqs);
                }
            } catch (error) {
                console.error("Failed to load FAQs:", error);
                setFaqs(defaultFaqs);
            }
        };
        loadFaqs();
    }, []);

    return (
        <section className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-24 max-w-5xl mx-auto" dir="rtl">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">الأسئلة الشائعة</h2>
                <p className="text-gray-400 text-lg">كل ما تحتاج معرفته عن خدماتنا وكيفية البدء معنا.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-6 py-6 flex items-center justify-between text-right"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                </div>
                                <span className="text-lg md:text-xl font-medium text-white">{faq.question_ar || faq.question}</span>
                            </div>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                        <div
                            className={`px-6 transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                                }`}
                        >
                            <p className="text-gray-400 leading-relaxed text-lg pt-2 border-t border-gray-800">
                                {faq.answer_ar || faq.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 text-white font-bold text-lg hover:gap-4 transition-all group"
                >
                    عرض جميع الأسئلة
                    <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
                </Link>
            </div>
        </section>
    );
}
