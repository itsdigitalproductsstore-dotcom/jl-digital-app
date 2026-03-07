'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, Save, X,
    Eye, EyeOff, RefreshCw, Upload, Image as ImageIcon
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { uploadServiceCardImage } from '@/app/actions';

interface HomeServiceCard {
    id: string;
    title: string;
    label: string | null;
    description: string;
    image_url: string;
    order_index: number;
    is_active: boolean;
    created_at?: string;
}

interface HomeServiceCardsTabProps {
    refreshTrigger?: number;
}

export default function HomeServiceCardsTab({ refreshTrigger }: HomeServiceCardsTabProps) {
    const [cards, setCards] = useState<HomeServiceCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState<Partial<HomeServiceCard>>({
        title: '',
        label: '',
        description: '',
        image_url: '',
        order_index: 0,
        is_active: true
    });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('home_service_cards')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setCards(data || []);
        } catch (error) {
            console.error('Error fetching service cards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, [refreshTrigger]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const publicUrl = await uploadServiceCardImage(file);
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert('فشل في رفع الصورة');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_url) {
            alert('يرجى رفع صورة للبطاقة');
            return;
        }

        setIsSaving(true);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('home_service_cards')
                    .update({
                        title: formData.title,
                        label: formData.label,
                        description: formData.description,
                        image_url: formData.image_url,
                        order_index: formData.order_index,
                        is_active: formData.is_active,
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const maxOrder = cards.length > 0
                    ? Math.max(...cards.map(c => c.order_index))
                    : 0;

                const { error } = await supabase
                    .from('home_service_cards')
                    .insert({
                        title: formData.title,
                        label: formData.label,
                        description: formData.description,
                        image_url: formData.image_url,
                        order: maxOrder + 1,
                        is_active: true
                    });

                if (error) throw error;
            }

            resetForm();
            await fetchCards();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('فشل في حفظ البطاقة');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (card: HomeServiceCard) => {
        setEditingId(card.id);
        setFormData({
            title: card.title,
            label: card.label || '',
            description: card.description,
            image_url: card.image_url,
            order_index: card.order_index,
            is_active: card.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;

        try {
            const { error } = await supabase
                .from('home_service_cards')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCards();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleToggle = async (card: HomeServiceCard) => {
        try {
            const { error } = await supabase
                .from('home_service_cards')
                .update({ is_active: !card.is_active })
                .eq('id', card.id);

            if (error) throw error;
            await fetchCards();
        } catch (error) {
            console.error('Error toggling card:', error);
        }
    };

    const moveCard = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === cards.length - 1)
        ) return;

        const newCards = [...cards];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap order values
        const tempOrder = newCards[index].order_index;
        newCards[index].order_index = newCards[swapIndex].order_index;
        newCards[swapIndex].order_index = tempOrder;

        // Swap positions in array for immediate UI update
        const temp = newCards[index];
        newCards[index] = newCards[swapIndex];
        newCards[swapIndex] = temp;

        setCards(newCards);

        try {
            // Update both cards in database
            const { error: error1 } = await supabase
                .from('home_service_cards')
                .update({ order_index: newCards[index].order_index })
                .eq('id', newCards[index].id);

            const { error: error2 } = await supabase
                .from('home_service_cards')
                .update({ order_index: newCards[swapIndex].order_index })
                .eq('id', newCards[swapIndex].id);

            if (error1 || error2) throw new Error('Failed to reorder');

        } catch (error) {
            console.error('Error updating order:', error);
            await fetchCards(); // Revert on error
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({
            title: '',
            label: '',
            description: '',
            image_url: '',
        order_index: 0,
            is_active: true
        });
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">خدمات الواجهة (Service Cards)</h2>
                    <p className="text-gray-400">إدارة البطاقات الثلاث الديناميكية في الصفحة الرئيسية مع الصور والنصوص</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة بطاقة جديدة</span>
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">
                            {editingId ? 'تعديل البطاقة' : 'إضافة بطاقة جديدة'}
                        </h3>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">العنوان (Title)</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="مثال: رصد العملاء"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">التسمية (Label - اختياري)</label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="مثال: TELEMETRY"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">الوصف (Description)</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="وصف تفصيلي للخدمة"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">صورة البطاقة</label>
                            <div className="flex items-center gap-4">
                                {formData.image_url ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 flex-shrink-0">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-lg border border-dashed border-gray-700 bg-gray-900 flex flex-col items-center justify-center flex-shrink-0">
                                        <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                                        <span className="text-xs text-gray-500">لا توجد صورة</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer disabled:opacity-50"
                                    />
                                    {isUploading && <p className="text-sm text-blue-400 mt-2">جاري الرفع...</p>}
                                </div>
                            </div>
                        </div>

                        {editingId && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">الترتيب (Order)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-400 hover:text-white transition"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className={`bg-gray-800/50 rounded-xl border transition-all ${card.is_active ? 'border-gray-700 hover:border-blue-500' : 'border-gray-800 opacity-60'
                            }`}
                    >
                        {card.image_url && (
                            <div className="h-48 w-full bg-gray-900 rounded-t-xl overflow-hidden">
                                <img
                                    src={card.image_url}
                                    alt={card.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                                    {card.label && (
                                        <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded mb-2">
                                            {card.label}
                                        </span>
                                    )}
                                    <p className="text-sm text-gray-400 line-clamp-3">{card.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(card)}
                                        className={`p-2 rounded-lg transition ${card.is_active
                                                ? 'text-green-400 hover:bg-green-400/10'
                                                : 'text-gray-500 hover:bg-gray-800'
                                            }`}
                                        title={card.is_active ? 'تعطيل' : 'تفعيل'}
                                    >
                                        {card.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(card)}
                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                                        title="تعديل"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveCard(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-500 hover:text-white disabled:opacity-30 transition"
                                        title="تحريك لأعلى"
                                    >
                                        ▲
                                    </button>
                                    <span className="text-sm text-gray-500 w-4 text-center">{card.order_index}</span>
                                    <button
                                        onClick={() => moveCard(index, 'down')}
                                        disabled={index === cards.length - 1}
                                        className="p-1 text-gray-500 hover:text-white disabled:opacity-30 transition"
                                        title="تحريك لأسفل"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {cards.length === 0 && !showForm && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
                        لا توجد بطاقات حالياً. انقر على "إضافة بطاقة جديدة" للبدء.
                    </div>
                )}
            </div>
        </div>
    );
}
