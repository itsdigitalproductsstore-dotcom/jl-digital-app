'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X,
  Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface FeatureCard {
  id: string;
  title_ar: string;
  description_ar: string;
  badge_left_ar: string;
  badge_right_ar: string;
  icon_type: string;
  accent_color: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FeaturesTabProps {
  refreshTrigger?: number;
}

export default function FeaturesTab({ refreshTrigger }: FeaturesTabProps) {
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FeatureCard>>({
    title_ar: '',
    description_ar: '',
    badge_left_ar: '',
    badge_right_ar: '',
    icon_type: 'shuffler',
    accent_color: '#3b82f6',
    order_index: 0,
    is_active: true
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('features_cards')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFeatureCards(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('features_cards')
          .update({
            title_ar: formData.title_ar,
            description_ar: formData.description_ar,
            badge_left_ar: formData.badge_left_ar,
            badge_right_ar: formData.badge_right_ar,
            icon_type: formData.icon_type,
            accent_color: formData.accent_color,
            order_index: formData.order_index,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const maxOrder = featureCards.length > 0 
          ? Math.max(...featureCards.map(c => c.order_index)) 
          : 0;

        const { error } = await supabase
          .from('features_cards')
          .insert({
            title_ar: formData.title_ar,
            description_ar: formData.description_ar,
            badge_left_ar: formData.badge_left_ar,
            badge_right_ar: formData.badge_right_ar,
            icon_type: formData.icon_type,
            accent_color: formData.accent_color,
            order_index: maxOrder + 1,
            is_active: true
          });

        if (error) throw error;
      }

      resetForm();
      await fetchFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('فشل في حفظ البطاقة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (card: FeatureCard) => {
    setEditingId(card.id);
    setFormData({
      title_ar: card.title_ar,
      description_ar: card.description_ar,
      badge_left_ar: card.badge_left_ar,
      badge_right_ar: card.badge_right_ar,
      icon_type: card.icon_type,
      accent_color: card.accent_color,
      order_index: card.order_index,
      is_active: card.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;

    try {
      const { error } = await supabase
        .from('features_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
    }
  };

  const handleToggle = async (card: FeatureCard) => {
    try {
      const { error } = await supabase
        .from('features_cards')
        .update({ is_active: !card.is_active, updated_at: new Date().toISOString() })
        .eq('id', card.id);

      if (error) throw error;
      await fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title_ar: '',
      description_ar: '',
      badge_left_ar: '',
      badge_right_ar: '',
      icon_type: 'shuffler',
      accent_color: '#3b82f6',
      order_index: 0,
      is_active: true
    });
  };

  const iconTypeLabels: Record<string, string> = {
    shuffler: 'شيفرة (Shuffler)',
    typewriter: 'آلة كاتبة (Typewriter)',
    scheduler: 'مخطط (Scheduler)'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">بطاقات المميزات</h1>
          <p className="text-gray-400">إدارة بطاقات القسم المميز (Features)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة بطاقة
        </button>
      </div>

      {showForm && (
        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">
              {editingId ? 'تعديل بطاقة' : 'إضافة بطاقة جديدة'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">العنوان (بالعربية) *</label>
                <input
                  type="text"
                  value={formData.title_ar || ''}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="مثال: قلعة البيانات الموحدة"
                  required
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">الوصف (بالعربية)</label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="وصف البطاقة..."
                  rows={2}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">الشارة اليسرى</label>
                <input
                  type="text"
                  value={formData.badge_left_ar || ''}
                  onChange={(e) => setFormData({ ...formData, badge_left_ar: e.target.value })}
                  placeholder="مثال: SECURITY"
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">الشارة اليمنى</label>
                <input
                  type="text"
                  value={formData.badge_right_ar || ''}
                  onChange={(e) => setFormData({ ...formData, badge_right_ar: e.target.value })}
                  placeholder="مثال: ARTIFACT_01"
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">نوع الأيقونة</label>
                <select
                  value={formData.icon_type || 'shuffler'}
                  onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                >
                  <option value="shuffler">شيفرة (Shuffler)</option>
                  <option value="typewriter">آلة كاتبة (Typewriter)</option>
                  <option value="scheduler">مخطط (Scheduler)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">لون التمييز</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.accent_color || '#3b82f6'}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-12 h-12 bg-black border border-gray-700 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color || '#3b82f6'}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingId ? 'تحديث' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
        <h3 className="text-xl font-bold mb-6">البطاقات الموجودة ({featureCards.length})</h3>
        
        {featureCards.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد بطاقات مميزة. أضف واحدة للبدء.</p>
        ) : (
          <div className="space-y-4">
            {featureCards.map((card) => (
              <div 
                key={card.id} 
                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl"
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: card.accent_color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold truncate">{card.title_ar}</span>
                    <span className="text-gray-500 text-sm flex-shrink-0">
                      ({iconTypeLabels[card.icon_type] || card.icon_type})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{card.badge_left_ar}</span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{card.badge_right_ar}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(card)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                    card.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                  title={card.is_active ? 'معطل' : 'مفعّل'}
                >
                  {card.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(card)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
