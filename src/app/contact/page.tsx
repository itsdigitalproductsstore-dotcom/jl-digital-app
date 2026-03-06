"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            <main className="pt-32 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto" dir="rtl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        اتصل بنا
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        نحن هنا لمساعدتك في تحويل أهدافك التسويقية إلى نتائج ملموسة. تواصل معنا اليوم لبدء رحلة نموك.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">البريد الإلكتروني</h3>
                                    <p className="text-gray-400">itsdigitalproductsstore@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">الهاتف</h3>
                                    <p className="text-gray-400">تواصل معنا عبر الواتساب للاستجابة السريعة</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-gray-700 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">الموقع</h3>
                                    <p className="text-gray-400">سلطنة عُمان - فخورون بخدمة المنطقة</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="bg-gray-900/50 p-8 md:p-12 rounded-3xl border border-gray-800">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">الاسم الكامل</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
                                    placeholder="أدخل اسمك هنا"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">الرسالة</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
                                    placeholder="كيف يمكننا مساعدتك؟"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                إرسال الرسالة
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
