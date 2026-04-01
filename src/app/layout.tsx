import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/context/ConfigContext";
import { AuthProvider } from "@/context/AuthContext";

const almarai = Almarai({
  weight: ["300", "400", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: "BAYYA BUSINESS | تسويق رقمي متقدم",
  description: "أدوات تسويق رقمي عالية المستوى مبنية على بروتوكول البناء من الصفر لتعزيز نمو المشاريع الناشئة",
  keywords: ["تسويق رقمي", "BAYYA BUSINESS", "بناء funnels", "إعلانات", "تسويق المحتوى", "سلطنة عُمان", "اليمن"],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${almarai.variable} antialiased font-sans`}>
        <AuthProvider>
          <ConfigProvider>
            {children}
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
