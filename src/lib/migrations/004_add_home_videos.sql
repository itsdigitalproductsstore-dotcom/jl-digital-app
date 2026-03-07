-- Database Migration: Add Home Videos Table
-- Created: March 7, 2026

-- ============================================
-- HOME_VIDEOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS home_videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  short_description TEXT,
  video_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on home_videos
ALTER TABLE home_videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR HOME_VIDEOS
-- ============================================

-- Allow public read access to home_videos
CREATE POLICY "Public can read home_videos"
  ON home_videos FOR SELECT
  USING (is_active = true);

-- Allow authenticated admins full access to home_videos
CREATE POLICY "Admins can manage home_videos"
  ON home_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

INSERT INTO home_videos (title, short_description, video_url, order_index) VALUES
  (
    'مقدمة عن خدماتنا',
    'استكشف كيف نحول وجودك الرقمي',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    1
  ),
  (
    'بناء Funnels',
    'شرح تفصيلي لعملية بناء Funnel',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    2
  ),
  (
    'استراتيجيات الإعلانات',
    'كيف نضمن عائد استثمار عالي',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    3
  )
ON CONFLICT DO NOTHING;
