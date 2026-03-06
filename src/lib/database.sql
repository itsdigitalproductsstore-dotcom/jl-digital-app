-- Database Schema for JL Digital CMS

-- Site Settings (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT 'JL Digital',
  site_name_ar TEXT NOT NULL DEFAULT 'JL Digital',
  site_description TEXT,
  site_description_ar TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  hero_title TEXT DEFAULT 'Aspirational Growth meets Digital Precision.',
  hero_title_ar TEXT DEFAULT 'النمو الطموح يلتقي بالدقة الرقمية.',
  hero_subtitle TEXT DEFAULT 'A high-end data instrument built to execute the Zero-Base Build Protocol.',
  hero_subtitle_ar TEXT DEFAULT 'أداة بيانات عالية المستوى مبنية لتنفيذ بروتوكول البناء من الصفر.',
  hero_cta_text TEXT DEFAULT 'Secure Your Strategy Session',
  hero_cta_text_ar TEXT DEFAULT 'احجز جلسة استراتيجية',
  currency_rates JSONB DEFAULT '{"OMR":1,"SAR":9.75,"USD":2.6,"AED":9.75}',
  partner_1 TEXT DEFAULT 'جاسم محمد',
  partner_2 TEXT DEFAULT 'ليث أحمد خديش',
  origin_country TEXT DEFAULT 'سلطنة عُمان',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marquee Items
CREATE TABLE IF NOT EXISTS marquee_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text TEXT NOT NULL,
  text_ar TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  is_visible BOOLEAN DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Insert default marquee items
INSERT INTO marquee_items (text, text_ar, "order") VALUES 
  ('🚀 بناء Funnels عالية التحويل', '🚀 بناء Funnels عالية التحويل', 1),
  ('📈 إعلانات مدفوعة بدقة', '📈 إعلانات مدفوعة بدقة', 2),
  ('🎬 إنتاج محتوى احترافي', '🎬 إنتاج محتوى احترافي', 3),
  ('💡 أتمتة العمليات التجارية', '💡 أتمتة العمليات التجارية', 4),
  ('📊 تحليلات بيانات متقدمة', '📊 تحليلات بيانات متقدمة', 5),
  ('🏆 حلول تسويق متكاملة', '🏆 حلول تسويق متكاملة', 6)
ON CONFLICT DO NOTHING;

-- Insert default videos
INSERT INTO videos (title, title_ar, description, description_ar, url, "order") VALUES
  ('مقدمة عن خدماتنا', 'مقدمة عن خدماتنا', 'استكشف كيف نحول وجودك الرقمي', 'استكشف كيف نحول وجودك الرقمي', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
  ('بناء Funnels', 'بناء Funnels', 'شرح تفصيلي لعملية بناء Funnel', 'شرح تفصيلي لعملية بناء Funnel', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
  ('استراتيجيات الإعلانات', 'استراتيجيات الإعلانات', 'كيف نضمن عائد استثمار عالي', 'كيف نضمن عائد استثمار عالي', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3)
ON CONFLICT DO NOTHING;

-- Insert default pages
INSERT INTO pages (title, title_ar, slug, description, "order") VALUES
  ('الرئيسية', 'الرئيسية', '/', 'الصفحة الرئيسية', 1),
  ('الخدمات', 'الخدمات', '/services', 'خدماتنا الرقمية', 2),
  ('من نحن', 'من نحن', '/about', 'عن الشركة', 3),
  ('اتصل بنا', 'اتصل بنا', '/contact', 'تواصل معنا', 4),
  ('سياسة الخصوصية', 'سياسة الخصوصية', '/privacy', 'سياسة الخصوصية', 5)
ON CONFLICT DO NOTHING;
