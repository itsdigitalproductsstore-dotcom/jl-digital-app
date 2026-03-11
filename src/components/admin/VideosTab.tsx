'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, RefreshCw, Upload, Image as ImageIcon, Video, ArrowUp, ArrowDown } from 'lucide-react';

interface HomeVideo {
    id: string;
    title: string;
    short_description: string | null;
    video_url: string;
    order_index: number;
    is_active: boolean;
    created_at?: string;
}

interface VideosTabProps {
    refreshTrigger?: number;
}

export default function VideosTab({ refreshTrigger }: VideosTabProps) {
    const [videos, setVideos] = useState<HomeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState<Partial<HomeVideo>>({
        title: '',
        short_description: '',
        video_url: '',
        order_index: 0,
        is_active: true
    });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('home_videos')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [refreshTrigger]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.video_url) {
            alert('يرجى إدخال رابط الفيديو');
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('home_videos')
                    .update({
                        title: formData.title,
                        short_description: formData.short_description,
                        video_url: formData.video_url,
                        order_index: formData.order_index,
                        is_active: formData.is_active
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order_index)) : 0;
                const { error } = await supabase
                    .from('home_videos')
                    .insert([{
                        title: formData.title,
                        short_description: formData.short_description,
                        video_url: formData.video_url,
                        order_index: formData.order_index ?? maxOrder + 1,
                        is_active: formData.is_active ?? true
                    }]);

                if (error) throw error;
            }

            resetForm();
            fetchVideos();
        } catch (error) {
            console.error('Error saving video:', error);
            alert('فشل في حفظ الفيديو');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (video: HomeVideo) => {
        setEditingId(video.id);
        setFormData({
            title: video.title,
            short_description: video.short_description,
            video_url: video.video_url,
            order_index: video.order_index,
            is_active: video.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;

        try {
            const { error } = await supabase
                .from('home_videos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('فشل في حذف الفيديو');
        }
    };

    const handleToggleActive = async (video: HomeVideo) => {
        try {
            const { error } = await supabase
                .from('home_videos')
                .update({ is_active: !video.is_active })
                .eq('id', video.id);

            if (error) throw error;
            fetchVideos();
        } catch (error) {
            console.error('Error toggling video:', error);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            short_description: '',
            video_url: '',
            order_index: 0,
            is_active: true
        });
        setShowForm(false);
    };

    const moveVideo = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === videos.length - 1)
        ) return;

        const newVideos = [...videos];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const tempOrder = newVideos[index].order_index;
        newVideos[index].order_index = newVideos[swapIndex].order_index;
        newVideos[swapIndex].order_index = tempOrder;

        try {
            const { error: error1 } = await supabase
                .from('home_videos')
                .update({ order_index: newVideos[index].order_index })
                .eq('id', newVideos[index].id);

            const { error: error2 } = await supabase
                .from('home_videos')
                .update({ order_index: newVideos[swapIndex].order_index })
                .eq('id', newVideos[swapIndex].id);

            if (error1 || error2) throw new Error('Failed to reorder');
            fetchVideos();
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">مركز الفيديو</h2>
                    <p className="text-gray-400 text-sm">إدارة مقاطع الفيديو الترويجية</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-4 h-4" /> إضافة فيديو جديد
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">عنوان الفيديو</label>
                            <input
                                type="text"
                                required
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="مثال: مقدمة عن خدماتنا"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">الترتيب</label>
                            <input
                                type="number"
                                required
                                value={formData.order_index}
                                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">الوصف القصير</label>
                        <textarea
                            value={formData.short_description || ''}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            rows={2}
                            placeholder="مثال: استكشف كيف نحول وجودك الرقمي"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">رابط الفيديو *</label>
                        <input
                            type="url"
                            required
                            value={formData.video_url || ''}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="رابط YouTube أو Vimeo أو ملف فيديو مباشر (mp4)"
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            أنواع الروابط المدعومة: YouTube, Vimeo, أو روابط فيديو مباشرة (mp4, webm)
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active ?? true}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-400">نشط (معروض في الموقع)</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingId ? 'تحديث' : 'حفظ'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {videos.map((video, index) => (
                    <div
                        key={video.id}
                        className={`bg-gray-800/50 rounded-xl border transition-all ${video.is_active ? 'border-gray-700 hover:border-blue-500' : 'border-gray-800 opacity-60'}`}
                    >
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveVideo(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="تحريك لأعلى"
                                    >
                                        <ArrowUp className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => moveVideo(index, 'down')}
                                        disabled={index === videos.length - 1}
                                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="تحريك لأسفل"
                                    >
                                        <ArrowDown className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                                <div className="w-16 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                                    <Video className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{video.title}</h3>
                                    <p className="text-gray-500 text-sm">{video.short_description || 'لا يوجد وصف'}</p>
                                    <p className="text-gray-600 text-xs mt-1 font-mono truncate max-w-md">{video.video_url}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 w-4 text-center">{video.order_index}</span>
                                <button
                                    onClick={() => handleToggleActive(video)}
                                    className={`p-2 rounded-lg transition-colors ${video.is_active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'}`}
                                    title={video.is_active ? 'إخفاء' : 'إظهار'}
                                >
                                    {video.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(video)}
                                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {videos.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
                        <Video className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p>لا توجد فيديوهات حالياً</p>
                        <p className="text-sm mt-1">أضف أول فيديو ترويجي من الزر أعلاه</p>
                    </div>
                )}
            </div>
        </div>
    );
}
