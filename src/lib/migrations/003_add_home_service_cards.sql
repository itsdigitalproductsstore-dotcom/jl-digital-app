-- Database Migration: Add Home Service Cards Table
-- Created: March 7, 2026

-- ============================================
-- HOME_SERVICE_CARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS home_service_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  label TEXT,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on home_service_cards
ALTER TABLE home_service_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR HOME_SERVICE_CARDS
-- ============================================

-- Allow public read access to home_service_cards
CREATE POLICY "Public can read home_service_cards"
  ON home_service_cards FOR SELECT
  USING (is_active = true);

-- Allow authenticated admins full access to home_service_cards
CREATE POLICY "Admins can manage home_service_cards"
  ON home_service_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

INSERT INTO home_service_cards (title, label, description, image_url, order_index) VALUES
  (
    'قلعة البيانات الموحدة',
    'SECURITY',
    'تشفير بمستوى عسكري وبنية تحتية معزولة تضمن حماية كاملة للبيانات وعدم تسريب أي معلومات استراتيجية.',
    '/placeholder1.png',
    1
  ),
  (
    'رصد العملاء في الوقت الفعلي',
    'TELEMETRY',
    'نظام متقدم لتتبع وتحليل سلوك العملاء اللحظي مع تقارير تفصيلية شاملة.',
    '/placeholder2.png',
    2
  ),
  (
    'توسع فوري — بدون تأخير',
    'PERFORMANCE',
    'بنية تحتية سحابية مرنة تتكيف فورياً مع حجم أي حملة تسويقية مهما بلغت.',
    '/placeholder3.png',
    3
  )
ON CONFLICT DO NOTHING;
