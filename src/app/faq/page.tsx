import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQContent from "./FAQContent";

export const dynamic = 'force-dynamic';

export default function FAQPage() {
  return (
    <div className="relative min-h-screen font-sans bg-black flex flex-col">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>
      <Header />
      <FAQContent />
      <Footer />
    </div>
  );
}
