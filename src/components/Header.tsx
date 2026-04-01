"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/services", label: "الخدمات" },
    { href: "/academy", label: "BAYYA Community" },
    { href: "/pricing", label: "التسعير" },
    { href: "/about", label: "من نحن" },
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/contact", label: "اتصل بنا" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-black/80 backdrop-blur-md border-b border-gray-800"
        : "bg-transparent"
        }`}
    >
      <div className="w-full px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between h-20">
          <nav className="hidden md:flex items-center gap-8" dir="rtl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors text-lg font-medium ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              تسجيل الدخول
            </Link>

            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <Link href="/" className="text-2xl font-bold text-white tracking-tight" dir="rtl">
            BAYYA BUSINESS
          </Link>

        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800" dir="rtl">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors text-lg py-2 ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-bold rounded-xl mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                تسجيل الدخول
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
