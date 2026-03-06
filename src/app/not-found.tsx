import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6" dir="rtl">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-xl text-gray-400 mb-8">الصفحة غير موجودة</p>
            <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
                العودة للرئيسية
            </Link>
        </div>
    );
}
