-- Database Migration: Add Features Cards Table
-- Created: March 4, 2026

-- ============================================
-- FEATURES_CARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS features_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title_ar TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  badge_left_ar TEXT NOT NULL DEFAULT '',
  badge_right_ar TEXT NOT NULL DEFAULT '',
  icon_type TEXT NOT NULL DEFAULT 'shuffler' CHECK (icon_type IN ('shuffler', 'typewriter', 'scheduler')),
  accent_color TEXT DEFAULT '#3b82f6',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on features_cards
ALTER TABLE features_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR FEATURES_CARDS
-- ============================================

-- Allow public read access to features_cards
CREATE POLICY "Public can read features_cards"
  ON features_cards FOR SELECT
  USING (is_active = true);

-- Allow authenticated admins full access to features_cards
CREATE POLICY "Admins can manage features_cards"
  ON features_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

INSERT INTO features_cards (title_ar, description_ar, badge_left_ar, badge_right_ar, icon_type, accent_color, order_index) VALUES
  (
    'قلعة البيانات الموحدة',
    'تشفير بمستوى عسكري وبنية تحتية معزولة تضمن حماية كاملة للبيانات وعدم تسريب أي معلومات استراتيجية.',
    'SECURITY',
    'ARTIFACT_01',
    'shuffler',
    '#3b82f6',
    1
  ),
  (
    'رصد العملاء في الوقت الفعلي',
    'نظام متقدم لتتبع وتحليل سلوك العملاء اللحظي مع تقارير تفصيلية شاملة.',
    'TELEMETRY',
    'ARTIFACT_02',
    'typewriter',
    '#22c55e',
    2
  ),
  (
    'توسع فوري — بدون تأخير',
    'بنية تحتية سحابية مرنة تتكيف فورياً مع حجم أي حملة تسويقية مهما بلغت.',
    'PERFORMANCE',
    'ARTIFACT_03',
    'scheduler',
    '#a855f7',
    3
  )
ON CONFLICT DO NOTHING;
