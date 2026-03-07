"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
    LayoutGrid,
    Users,
    BookOpen,
    CreditCard,
    Download,
    RefreshCw,
    LogOut,
    ChevronRight,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    Package,
    Star,
    Wifi,
    WifiOff,
    Plus,
    Shield,
    Trash2,
    Edit3,
    Play,
    Eye,
    Settings2,
    Video,
    Target,
    Zap,
    Settings,
    Mail,
    Phone,
    Globe,
    Code,
    Megaphone,
    BarChart,
    ShoppingCart,
    PieChart,
    TrendingDown,
    Award,
    Briefcase,
    Calendar,
    Camera,
    DollarSign,
    FileText,
    Gift,
    Headphones,
    HelpCircle,
    Home,
    Image,
    Layers,
    Link,
    List,
    Map,
    Monitor,
    Moon,
    Music,
    Pen,
    Percent,
    Printer,
    Puzzle,
    Rocket,
    Save,
    Search,
    Send,
    Server,
    Smartphone,
    Smile,
    Sun,
    Tablet,
    Tag,
    Terminal,
    Ticket,
    Timer,
    Truck,
    Umbrella,
    Unlock,
    Wallet,
    Watch,
    Wind,
    Bell
} from "lucide-react";
import HomeServiceCardsTab from "@/components/admin/HomeServiceCardsTab";
import VideosTab from "@/components/admin/VideosTab";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Lead {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    email: string;
    service_interest?: string;
    budget?: string;
    notes?: string;
    status: string;
    created_at: string;
}

interface StaffMember {
    id: string;
    name: string;
    role: string;
    status: string;
    tasks_count: number;
    color: string;
}

interface ServiceItem {
    id: string;
    title_ar: string;
    description_ar: string;
    features: string[];
    icon_name: string;
    color_gradient: string;
    border_color: string;
    price_basic_omr?: number;
    price_pro_omr?: number;
    price_enterprise_omr?: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        contacted: { label: "تم التواصل", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
        new: { label: "جديد", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        qualified: { label: "مؤهل", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
        lost: { label: "مفقود", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
        active: { label: "نشط", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
        نشط: { label: "نشط", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    };
    const { label, cls } = map[status?.toLowerCase()] ?? { label: status, cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
            {label}
        </span>
    );
}

// ─── Add Data Modal ───────────────────────────────────────────────────────────
function AddModal({
    isOpen,
    onClose,
    title,
    fields,
    onSave,
    loading
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: { name: string; label: string; type: string; placeholder?: string; options?: { label: string, value: string }[] }[];
    onSave: (data: any) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState<any>({});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay"></div>

                <h2 className="text-2xl font-bold mb-6 text-white text-right">{title}</h2>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 relative z-10" dir="rtl">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm text-gray-400 mb-1.5 text-right">{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/20 transition-all text-right"
                                >
                                    <option value="" className="bg-black">اختر...</option>
                                    {field.options?.map(opt => <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>)}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    required
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/20 transition-all text-right"
                                />
                            )}
                        </div>
                    ))}

                    <div className="pt-6 flex gap-3 flex-row-reverse">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-grow bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? "جاري الحفظ..." : "حفظ البيانات"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────
function LeadsTab({ leads, loading, onAdd, isOwner }: { leads: Lead[]; loading: boolean; onAdd: () => void; isOwner: boolean }) {
    const exportCSV = () => {
        const headers = ["الحالة", "الشركة", "الهاتف", "البريد الإلكتروني", "الاسم", "التاريخ"];
        const rows = leads.map((l) => [
            l.status, l.company_name, l.phone, l.email, l.full_name,
            new Date(l.created_at).toLocaleString("ar-OM"),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "leads.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">إجمالي العملاء المحتملين: <span className="text-white font-bold">{leads.length}</span></p>
                <div className="flex gap-2">
                    {isOwner && (
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> إضافة عميل
                        </button>
                    )}
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" /> تصدير CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                            {["الحالة", "الشركة", "الهاتف", "البريد الإلكتروني", "الاسم الكامل", "تاريخ التسجيل"].map((h) => (
                                <th key={h} className="text-right px-5 py-4 text-xs text-gray-500 uppercase tracking-widest font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-20 text-gray-600 font-medium">لا توجد بيانات متاحة حالياً</td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-5 text-right"><StatusBadge status={lead.status} /></td>
                                    <td className="px-5 py-5 text-gray-300 text-right font-medium">{lead.company_name || "-"}</td>
                                    <td className="px-5 py-5 text-gray-300 font-mono text-right">{lead.phone || "-"}</td>
                                    <td className="px-5 py-5 text-gray-400 text-right underline underline-offset-4 decoration-white/10">{lead.email}</td>
                                    <td className="px-5 py-5 text-white font-bold text-right">{lead.full_name}</td>
                                    <td className="px-5 py-5 text-gray-500 text-xs text-right">
                                        {new Date(lead.created_at).toLocaleString("ar-OM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────
function ServicesTab({ services, loading, onAdd, onRefresh, isOwner }: { services: ServiceItem[]; loading: boolean; onAdd: () => void; onRefresh: () => void; isOwner: boolean }) {
    const supabase = createClient();
    const [editItem, setEditItem] = useState<ServiceItem | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ServiceItem & { price_basic_omr: number; price_pro_omr: number; price_enterprise_omr: number }>>({});

    const openEdit = (svc: any) => {
        setEditItem(svc);
        setEditForm({
            title_ar: svc.title_ar,
            description_ar: svc.description_ar,
            features: svc.features,
            icon_name: svc.icon_name,
            color_gradient: svc.color_gradient,
            border_color: svc.border_color,
            price_basic_omr: svc.price_basic_omr || 0,
            price_pro_omr: svc.price_pro_omr || 0,
            price_enterprise_omr: svc.price_enterprise_omr || 0,
        });
    };

    const handleUpdate = async () => {
        if (!editItem) return;
        setEditLoading(true);
        const { error } = await supabase.from('services_list').update({
            title_ar: editForm.title_ar,
            description_ar: editForm.description_ar,
            icon_name: editForm.icon_name,
            color_gradient: editForm.color_gradient,
            border_color: editForm.border_color,
            features: typeof editForm.features === 'string'
                ? (editForm.features as string).split(',').map(f => f.trim())
                : editForm.features,
            price_basic_omr: editForm.price_basic_omr,
            price_pro_omr: editForm.price_pro_omr,
            price_enterprise_omr: editForm.price_enterprise_omr,
        }).eq('id', editItem.id);
        setEditLoading(false);
        if (!error) { setEditItem(null); onRefresh(); }
        else alert('خطأ: ' + error.message);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
        await supabase.from('services_list').delete().eq('id', id);
        onRefresh();
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
    );

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-all text-right text-sm";
    const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-right";

    return (
        <div className="space-y-6">
            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2rem] p-8 space-y-5" dir="rtl">
                        <h2 className="text-xl font-black text-white">تعديل الخدمة</h2>
                        <div>
                            <label className={labelCls}>العنوان (عربي)</label>
                            <input value={editForm.title_ar || ''} onChange={e => setEditForm(f => ({ ...f, title_ar: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>الوصف</label>
                            <textarea value={editForm.description_ar || ''} onChange={e => setEditForm(f => ({ ...f, description_ar: e.target.value }))} className={inputCls + " resize-none h-20"} />
                        </div>
                        <div>
                            <label className={labelCls}>الأيقونة (اسم أيقونة Lucide)</label>
                            <input value={editForm.icon_name || ''} onChange={e => setEditForm(f => ({ ...f, icon_name: e.target.value }))} className={inputCls} placeholder="LayoutGrid, TrendingUp, Star, Package, etc." />
                            <p className="text-gray-500 text-[10px] mt-1">أسماء متاحة: LayoutGrid, TrendingUp, Star, Package, RefreshCw, Users, Target, Zap, Settings, Mail, Phone, Globe, Code, Megaphone, BarChart</p>
                        </div>
                        <div>
                            <label className={labelCls}>التدرج اللوني (Tailwind)</label>
                            <input value={editForm.color_gradient || ''} onChange={e => setEditForm(f => ({ ...f, color_gradient: e.target.value }))} className={inputCls} placeholder="from-blue-600/20 to-blue-900/10" />
                        </div>
                        <div>
                            <label className={labelCls}>لون الحدود</label>
                            <input value={editForm.border_color || ''} onChange={e => setEditForm(f => ({ ...f, border_color: e.target.value }))} className={inputCls} placeholder="border-blue-500/30" />
                        </div>
                        <div>
                            <label className={labelCls}>المميزات (افصل بفاصلة)</label>
                            <input value={Array.isArray(editForm.features) ? editForm.features.join(', ') : (editForm.features || '')} onChange={e => setEditForm(f => ({ ...f, features: e.target.value as any }))} className={inputCls} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Basic (OMR)</label>
                                <input type="number" value={editForm.price_basic_omr || 0} onChange={e => setEditForm(f => ({ ...f, price_basic_omr: +e.target.value }))} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Pro (OMR)</label>
                                <input type="number" value={editForm.price_pro_omr || 0} onChange={e => setEditForm(f => ({ ...f, price_pro_omr: +e.target.value }))} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Enterprise (OMR)</label>
                                <input type="number" value={editForm.price_enterprise_omr || 0} onChange={e => setEditForm(f => ({ ...f, price_enterprise_omr: +e.target.value }))} className={inputCls} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleUpdate} disabled={editLoading} className="flex-1 bg-white text-black font-black py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                                {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                            <button onClick={() => setEditItem(null)} className="px-6 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                {isOwner && (
                    <button onClick={onAdd} className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors shadow-lg text-right" dir="rtl">
                        <Plus className="w-4 h-4" /> إضافة خدمة جديدة
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map((svc: any) => {
                    const icons: Record<string, any> = { TrendingUp, Star, Package, RefreshCw, LayoutGrid, Users, Target, Zap, Settings2, Mail, Phone, Globe, Code, Megaphone, BarChart, ShoppingCart, CreditCard, PieChart, TrendingDown, Award, Briefcase, Calendar, Camera, CheckCircle2, Clock, DollarSign, FileText, Gift, Headphones, HelpCircle, Home, Image, Layers, Link, List, Map, Monitor, Moon, Music, Bell, Pen, Percent, Printer, Puzzle, Rocket, Save, Search, Send, Server, Smartphone, Smile, Sun, Tablet, Tag, Terminal, Ticket, Timer, Truck, Umbrella, Unlock, Wallet, Watch, Wind, Trash2 };
                    const Icon = icons[svc.icon_name] || LayoutGrid;
                    return (
                        <div key={svc.id} className={`p-6 rounded-[2rem] bg-gradient-to-br ${svc.color_gradient} border ${svc.border_color} hover:border-white/30 transition-all duration-300 group shadow-lg relative`}>
                            {/* Action Buttons - Owner Only */}
                            {isOwner && (
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <button onClick={() => openEdit(svc)} className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all backdrop-blur-sm" title="تعديل">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(svc.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all backdrop-blur-sm" title="حذف">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors shrink-0">
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-white font-black text-lg mb-1 text-right" dir="rtl">{svc.title_ar}</h3>
                                    <p className="text-gray-400 text-sm text-right leading-relaxed" dir="rtl">{svc.description_ar}</p>
                                </div>
                            </div>
                            {/* Prices */}
                            {
                                (svc.price_basic_omr || svc.price_pro_omr || svc.price_enterprise_omr) ? (
                                    <div className="grid grid-cols-3 gap-2 mb-4 border-t border-white/5 pt-4" dir="rtl">
                                        {[
                                            { label: 'Basic', val: svc.price_basic_omr },
                                            { label: 'Pro', val: svc.price_pro_omr },
                                            { label: 'Enterprise', val: svc.price_enterprise_omr },
                                        ].map(tier => tier.val ? (
                                            <div key={tier.label} className="text-center bg-white/5 rounded-xl p-2">
                                                <p className="text-white font-black text-sm">{tier.val} OMR</p>
                                                <p className="text-gray-500 text-[10px] font-bold">{tier.label}</p>
                                            </div>
                                        ) : null)}
                                    </div>
                                ) : null
                            }
                            <ul className="space-y-2 mt-4 border-t border-white/5 pt-4" dir="rtl">
                                {Array.isArray(svc.features) && svc.features.map((f: string, fi: number) => (
                                    <li key={fi} className="flex items-center gap-2 text-gray-300 text-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Staff Tab ─────────────────────────────────────────────────────────────────
function StaffTab({ staff, loading, onAdd, onRefresh, isOwner }: { staff: StaffMember[]; loading: boolean; onAdd: () => void; onRefresh: () => void; isOwner: boolean }) {
    const supabase = createClient();
    const [editItem, setEditItem] = useState<StaffMember | null>(null);
    const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
    const [editLoading, setEditLoading] = useState(false);

    const openEdit = (m: StaffMember) => { setEditItem(m); setEditForm({ name: m.name, role: m.role, tasks_count: m.tasks_count, status: m.status, color: m.color }); };

    const handleUpdate = async () => {
        if (!editItem) return;
        setEditLoading(true);
        const { error } = await supabase.from('staff').update(editForm).eq('id', editItem.id);
        setEditLoading(false);
        if (!error) { setEditItem(null); onRefresh(); }
        else alert('خطأ: ' + error.message);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
        await supabase.from('staff').delete().eq('id', id);
        onRefresh();
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
    );

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-white/30 transition-all text-right text-sm";
    const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-right";

    return (
        <div className="space-y-6">
            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[2rem] p-8 space-y-5" dir="rtl">
                        <h2 className="text-xl font-black text-white">تعديل بيانات الموظف</h2>
                        <div>
                            <label className={labelCls}>الاسم</label>
                            <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>المسمى الوظيفي</label>
                            <input value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>عدد المهام</label>
                            <input type="number" value={editForm.tasks_count || 0} onChange={e => setEditForm(f => ({ ...f, tasks_count: +e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>الحالة</label>
                            <select value={editForm.status || 'Active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                                <option value="Active" className="bg-black">نشط</option>
                                <option value="Leave" className="bg-black">إجازة</option>
                                <option value="Busy" className="bg-black">مشغول</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleUpdate} disabled={editLoading} className="flex-1 bg-white text-black font-black py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                                {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                            <button onClick={() => setEditItem(null)} className="px-6 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                    {[
                        { label: "إجمالي الموظفين", value: staff.length.toString(), icon: Users, color: "text-blue-400" },
                        { label: "إجمالي المهام", value: staff.reduce((acc, s) => acc + (s.tasks_count || 0), 0).toString(), icon: CheckCircle2, color: "text-green-400" },
                        { label: "معدل الإنجاز", value: "94%", icon: TrendingUp, color: "text-purple-400" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center shadow-md">
                                <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
                {isOwner && (
                    <button onClick={onAdd} className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-200 transition-all shadow-xl hover:scale-105" dir="rtl">
                        <Plus className="w-4 h-4" /> إضافة موظف للفريق
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-[1.5rem] hover:border-white/20 transition-all hover:bg-white/[0.04] shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-white font-black text-lg shadow-inner`}>
                                {member.name.charAt(0)}
                            </div>
                            <div dir="rtl">
                                <p className="text-white font-bold text-lg">{member.name}</p>
                                <p className="text-gray-500 text-sm font-medium">{member.role}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={member.status} />
                            <div className="text-right">
                                <span className="text-white font-black">{member.tasks_count}</span>
                                <span className="text-gray-600 text-[10px] font-bold mr-1 uppercase">مهمة</span>
                            </div>
                            {isOwner && (
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(member)} className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-all" title="تعديل">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(member.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all" title="حذف">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Site Builder Tab ──────────────────────────────────────────────────────────
function SiteBuilderTab({ isOwner }: { isOwner: boolean }) {
    const supabase = createClient();
    const [content, setContent] = useState({
        hero_title_ar: 'النمو الطموح يلتقي بالدقّة الرقمية.',
        hero_subtitle_ar: 'أداة بيانات عالية المستوى، مبنية لتنفّذ بروتوكول بناء كامل يربط هندسة الفلنز، الإعلانات المدفوعة، إنتاج المحتوى، الذكاء بالبيانات، أتمتة العمليات وهندسة العلامة، ليحوّل كل زيارة إلى فرصة نمو حقيقية.',
        hero_small_text_ar: 'حلول رقمية تُصمَّم حول أرقامك، لا حول التخمين.',
        hero_badge: 'وكالة تسويق رقمي متكاملة',
        hero_cta_primary: 'ابدأ رحلتك معنا',
        hero_cta_secondary: 'شاهد أعمالنا',
        about_title: 'من نحن',
        about_text: 'JL Digital Marketing وكالة تسويق رقمي متخصصة تتخذ من سلطنة عُمان مقراً لها.',
        footer_tagline: 'نبني مستقبل التسويق الرقمي.',
        privacy_policy: '',
        terms: '',
        faq_items: '[]',
    });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        supabase.from('site_content').select('*').eq('id', 'main').single().then(({ data }: any) => {
            if (data) setContent(c => ({ ...c, ...data }));
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg(null);
        const { error } = await supabase.from('site_content').upsert({ id: 'main', ...content, updated_at: new Date().toISOString() });
        setSaving(false);
        if (error) setSaveMsg({ type: 'error', text: 'خطأ: ' + error.message });
        else { setSaveMsg({ type: 'success', text: '✅ تم حفظ محتوى الموقع بنجاح!' }); setTimeout(() => setSaveMsg(null), 4000); }
    };

    const inputCls = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-white/30 outline-none transition-colors text-right";
    const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-right";
    const sectionCls = "bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-6 space-y-4";

    const fields: { section: string; icon: string; items: { key: keyof typeof content; label: string; multiline?: boolean }[] }[] = [
        {
            section: 'قسم الهيرو (Hero Section)',
            icon: '🚀',
            items: [
                { key: 'hero_title_ar', label: 'العنوان الرئيسي (عربي)', multiline: true },
                { key: 'hero_subtitle_ar', label: 'النص التوضيحي (عربي)', multiline: true },
                { key: 'hero_small_text_ar', label: 'النص الصغير تحت العنوان (عربي)', multiline: true },
                { key: 'hero_badge', label: 'الشارة / Badge' },
                { key: 'hero_cta_primary', label: 'زر الدعوة الأول (CTA)' },
                { key: 'hero_cta_secondary', label: 'زر الدعوة الثاني' },
            ]
        },
        {
            section: 'قسم من نحن',
            icon: '🏢',
            items: [
                { key: 'about_title', label: 'العنوان' },
                { key: 'about_text', label: 'النص', multiline: true },
            ]
        },
        {
            section: 'صفحات المحتوى',
            icon: '📄',
            items: [
                { key: 'privacy_policy', label: 'سياسة الخصوصية', multiline: true },
                { key: 'terms', label: 'الشروط والأحكام', multiline: true },
                { key: 'faq_items', label: 'الأسئلة الشائعة (JSON)', multiline: true },
            ]
        },
        {
            section: 'الفوتر',
            icon: '📌',
            items: [
                { key: 'footer_tagline', label: 'شعار الفوتر' },
            ]
        }
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <span className="text-2xl">🎨</span>
                <div>
                    <p className="text-blue-300 text-sm font-black">منشئ الموقع البصري</p>
                    <p className="text-blue-400/60 text-xs">عدّل أي نص في الموقع وسيتم تحديثه فوراً بعد الحفظ</p>
                </div>
            </div>

            {saveMsg && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${saveMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {saveMsg.text}
                </div>
            )}

            {fields.map(section => (
                <div key={section.section} className={sectionCls}>
                    <h3 className="text-white font-black text-base flex items-center gap-2">
                        <span>{section.icon}</span> {section.section}
                    </h3>
                    {section.items.map(field => (
                        <div key={field.key}>
                            <label className={labelCls}>{field.label}</label>
                            {field.multiline ? (
                                <textarea
                                    value={content[field.key]}
                                    onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
                                    className={inputCls + " resize-none min-h-[80px]"}
                                />
                            ) : (
                                <input
                                    value={content[field.key]}
                                    onChange={e => setContent(c => ({ ...c, [field.key]: e.target.value }))}
                                    className={inputCls}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ))}

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
            >
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {saving ? 'جاري الحفظ...' : 'حفظ محتوى الموقع'}
            </button>
        </div>
    );
}

// ─── LMS Tab ──────────────────────────────────────────────────────────────────
function LmsTab({ isOwner }: { isOwner: boolean }) {
    const supabase = createClient();
    const [view, setView] = useState<"list" | "builder" | "live">("list");
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [liveSessions, setLiveSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchLmsData = useCallback(async () => {
        setLoading(true);
        const { data: cData } = await supabase.from("academy_courses").select("*").order("created_at", { ascending: false });
        if (cData) setCourses(cData);

        const { data: lData } = await supabase.from("academy_live_sessions").select("*, academy_courses(title)").order("scheduled_at", { ascending: false });
        if (lData) setLiveSessions(lData);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { fetchLmsData(); }, [fetchLmsData]);

    const fetchCourseDetails = async (courseId: string) => {
        setLoading(true);
        const { data: mData } = await supabase.from("academy_modules").select("*").eq("course_id", courseId).order("order_index");
        const { data: lData } = await supabase.from("academy_lessons").select("*").order("order_index");
        if (mData) setModules(mData);
        if (lData) {
            // Filter lessons by module IDs belonging to this course
            const moduleIds = mData?.map((m: any) => m.id) || [];
            setLessons(lData.filter((l: any) => moduleIds.includes(l.module_id)));
        }
        setLoading(false);
    };

    const handleAddCourse = async () => {
        const title = prompt("عنوان الكورس الجديد:");
        if (!title) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_courses").insert([{
            title,
            description: "وصف الكورس هنا...",
            category: "Marketing",
            instructor_name: "Jasim Mohammed",
            thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
        }]);
        setActionLoading(false);
        if (!error) fetchLmsData();
        else alert(error.message);
    };

    const handleAddModule = async (courseId: string) => {
        const title = prompt("عنوان الوحدة الجديدة:");
        if (!title) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_modules").insert([{
            course_id: courseId,
            title,
            order_index: modules.length
        }]);
        setActionLoading(false);
        if (!error) fetchCourseDetails(courseId);
    };

    const handleAddLesson = async (moduleId: string) => {
        const title = prompt("عنوان الدرس الجديد:");
        const fileId = prompt("Google Drive File ID:");
        if (!title || !fileId) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_lessons").insert([{
            module_id: moduleId,
            title,
            video_url: fileId,
            duration: "10:00",
            order_index: lessons.filter(l => l.module_id === moduleId).length
        }]);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
    };

    const handleAddLive = async () => {
        const title = prompt("عنوان جلسة البث المباشر:");
        const link = prompt("رابط Google Meet:");
        if (!title || !link || !courses.length) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_live_sessions").insert([{
            course_id: courses[0].id,
            title,
            meet_link: link,
            scheduled_at: new Date().toISOString(),
            status: 'upcoming'
        }]);
        setActionLoading(false);
        if (!error) fetchLmsData();
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكورس وجميع محتوياته؟")) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_courses").delete().eq("id", courseId);
        setActionLoading(false);
        if (!error) fetchLmsData();
        else alert(error.message);
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الوحدة وجميع دروسها؟")) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_modules").delete().eq("id", moduleId);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
        else alert(error.message);
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_lessons").delete().eq("id", lessonId);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
        else alert(error.message);
    };

    const handleDeleteLive = async (sessionId: string) => {
        if (!confirm("هل أنت متأكد من إلغاء هذه الجلسة؟")) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_live_sessions").delete().eq("id", sessionId);
        setActionLoading(false);
        if (!error) fetchLmsData();
        else alert(error.message);
    };

    const handleEditLesson = async (lesson: any) => {
        const title = prompt("تعديل عنوان الدرس:", lesson.title);
        const fileId = prompt("تعديل Google Drive File ID:", lesson.video_url);
        if (!title || !fileId) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_lessons").update({
            title,
            video_url: fileId,
        }).eq("id", lesson.id);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
        else alert(error.message);
    };

    const handleEditLive = async (session: any) => {
        const title = prompt("تعديل عنوان الجلسة:", session.title);
        const link = prompt("تعديل رابط Meet:", session.meet_link);
        if (!title || !link) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_live_sessions").update({
            title,
            meet_link: link,
        }).eq("id", session.id);
        setActionLoading(false);
        if (!error) fetchLmsData();
        else alert(error.message);
    };

    const handleEditCourse = async (course: any) => {
        const title = prompt("تعديل عنوان الكورس:", course.title);
        const description = prompt("تعديل وصف الكورس:", course.description);
        if (!title) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_courses").update({
            title,
            description: description || course.description
        }).eq("id", course.id);
        setActionLoading(false);
        if (!error) fetchLmsData();
        else alert(error.message);
    };

    const handleEditModule = async (mod: any) => {
        const title = prompt("تعديل عنوان الوحدة:", mod.title);
        if (!title) return;
        setActionLoading(true);
        const { error } = await supabase.from("academy_modules").update({
            title
        }).eq("id", mod.id);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
        else alert(error.message);
    };

    const toggleLessonProperty = async (lessonId: string, prop: string, currentVal: boolean) => {
        setActionLoading(true);
        const { error } = await supabase.from("academy_lessons").update({
            [prop]: !currentVal
        }).eq("id", lessonId);
        setActionLoading(false);
        if (!error) fetchCourseDetails(selectedCourse.id);
        else alert(error.message);
    };

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-all text-right";

    const [previewLesson, setPreviewLesson] = useState<any>(null);

    if (loading && view === "list") return <div className="py-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-white/20" /></div>;

    return (
        <div className="space-y-6">
            {/* Header / Sub-tabs */}
            <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-3">
                    <button onClick={() => setView("list")} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${view === "list" ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}>الكورسات</button>
                    <button onClick={() => setView("live")} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${view === "live" ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}>البث المباشر</button>
                </div>
                {view === "list" && isOwner && (
                    <button onClick={handleAddCourse} className="flex items-center gap-2 bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                        <Plus className="w-4 h-4" /> إنشاء كورس جديد
                    </button>
                )}
            </div>

            {/* View: Course List */}
            {view === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {courses.map(course => (
                        <div key={course.id} className="p-6 bg-white/[0.02] border border-white/10 rounded-[2rem] hover:border-white/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                            <div className="flex justify-between items-start mb-6" dir="rtl">
                                <div>
                                    <h4 className="text-white font-black text-xl mb-1">{course.title}</h4>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black text-gray-400 bg-white/5 px-3 py-1 rounded-full uppercase">{course.category}</span>
                                        <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase">{course.instructor_name}</span>
                                    </div>
                                </div>
                                <div className="text-center bg-white/5 p-3 rounded-2xl border border-white/10">
                                    <p className="text-white font-black text-2xl leading-none">0</p>
                                    <p className="text-gray-600 text-[10px] font-black mt-1 uppercase">طالب</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setSelectedCourse(course); setView("builder"); fetchCourseDetails(course.id); }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl text-xs transition-all border border-white/10"
                                >
                                    إدارة المحتوى (Builder)
                                </button>
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => handleEditCourse(course)}
                                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95"
                                        >
                                            <Edit3 className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View: Course Builder */}
            {view === "builder" && selectedCourse && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button onClick={() => setView("list")} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-black text-sm">
                        <ChevronRight className="w-4 h-4 rotate-180" /> العودة لقائمة الكورسات
                    </button>

                    <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                        <div className="text-right">
                            <h2 className="text-2xl font-black text-white">{selectedCourse.title}</h2>
                            <p className="text-gray-500 text-sm mt-1">معالج بناء الوحدات والدروس</p>
                        </div>
                        {isOwner && (
                            <button onClick={() => handleAddModule(selectedCourse.id)} className="bg-white text-black font-black px-6 py-3 rounded-xl text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                                إضافة وحدة تعليمية
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {modules.map((mod, mi) => (
                            <div key={mod.id} className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] overflow-hidden">
                                <div className="p-5 flex justify-between items-center bg-white/[0.02]" dir="rtl">
                                    <h3 className="text-white font-black text-lg flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-blue-400">{mi + 1}</span>
                                        {mod.title}
                                        {isOwner && (
                                            <button onClick={() => handleEditModule(mod)} className="p-1 hover:bg-white/5 rounded text-gray-600 hover:text-white transition-all"><Edit3 className="w-3 h-3" /></button>
                                        )}
                                    </h3>
                                    <div className="flex gap-2">
                                        {isOwner && (
                                            <>
                                                <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleAddLesson(mod.id)} className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all font-black uppercase tracking-widest">
                                                    + إضافة درس
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {lessons.filter(l => l.module_id === mod.id).map((lesson, li) => (
                                        <div key={lesson.id} className="p-4 flex justify-between items-center hover:bg-white/[0.03] rounded-xl transition-all group" dir="rtl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <p className="text-gray-300 font-bold text-sm">{lesson.title}</p>
                                                <div className="flex gap-2 mr-4 opacity-50">
                                                    <span onClick={() => isOwner && toggleLessonProperty(lesson.id, 'is_preview', lesson.is_preview)} className={`cursor-pointer px-2 py-0.5 rounded text-[8px] font-black border transition-all ${lesson.is_preview ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/10'}`}>PREVIEW</span>
                                                    <span onClick={() => isOwner && toggleLessonProperty(lesson.id, 'allow_download', lesson.allow_download)} className={`cursor-pointer px-2 py-0.5 rounded text-[8px] font-black border transition-all ${lesson.allow_download ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/10'}`}>DL</span>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-mono">{lesson.duration}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setPreviewLesson(lesson)} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-gray-500 hover:text-blue-400 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                                                {isOwner && (
                                                    <>
                                                        <button onClick={() => handleEditLesson(lesson)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* View: Live Sessions */}
            {view === "live" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/10 rounded-[2rem]">
                        <div className="text-right">
                            <h2 className="text-2xl font-black text-white">مدير جلسات البث المباشر</h2>
                            <p className="text-gray-500 text-sm mt-1">جدولة وإدارة روابط Google Meet</p>
                        </div>
                        {isOwner && (
                            <button onClick={handleAddLive} className="bg-white text-black font-black px-6 py-3 rounded-xl text-sm shadow-xl hover:scale-105 transition-all">
                                جدولة جلسة جديدة
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveSessions.map(session => (
                            <div key={session.id} className="p-6 bg-white/[0.02] border border-white/10 rounded-[1.5rem] hover:border-white/20 transition-all" dir="rtl">
                                <div className="flex justify-between mb-4">
                                    <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">{session.status}</div>
                                    <p className="text-gray-500 text-[10px] font-mono">{new Date(session.scheduled_at).toLocaleString()}</p>
                                </div>
                                <h4 className="text-white font-black text-lg mb-2">{session.title}</h4>
                                <p className="text-gray-500 text-xs mb-4">الكورس: {session.academy_courses?.title}</p>
                                <div className="flex gap-2">
                                    <a href={session.meet_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-2.5 rounded-xl text-xs text-center transition-all border border-white/10">رابط Meet</a>
                                    {isOwner && (
                                        <>
                                            <button onClick={() => handleEditLive(session)} className="px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-xs font-black"><Edit3 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteLive(session.id)} className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-xs font-black"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Preview Modal */}
            {previewLesson && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl">
                    <div className="w-full max-w-5xl bg-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        <button onClick={() => setPreviewLesson(null)} className="absolute top-6 right-6 z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                            <XCircle className="w-6 h-6" />
                        </button>
                        <div className="aspect-video bg-white/5 flex items-center justify-center">
                            <iframe
                                src={`https://drive.google.com/file/d/${previewLesson.video_url}/preview`}
                                className="w-full h-full border-none"
                                allow="autoplay"
                            />
                        </div>
                        <div className="p-8 bg-[#050505] flex justify-between items-center" dir="rtl">
                            <div>
                                <h3 className="text-2xl font-black text-white">{previewLesson.title}</h3>
                                <p className="text-gray-500 mt-2">معاينة الدرس — تأكد من صحة معرف ملف Google Drive</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-gray-400">{previewLesson.video_url}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Payment Settings Tab ─────────────────────────────────────────────────────
function PaymentsTab({ isOwner, userEmail }: { isOwner: boolean, userEmail: string | null }) {
    const supabase = createClient();
    const [activeSubTab, setActiveSubTab] = useState<"transactions" | "settings">("transactions");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error", text: string } | null>(null);
    const [settings, setSettings] = useState({
        stripe_enabled: false,
        stripe_public_key: "",
        stripe_secret_key: "",
        stripe_webhook_secret: "",
        paypal_enabled: false,
        paypal_client_id: "",
        paypal_secret_key: "",
        bank_transfer_enabled: false,
        bank_name: "",
        bank_account_name: "",
        bank_account_number: "",
        bank_iban: "",
        bank_swift_code: "",
    });

    useEffect(() => {
        supabase.from("site_settings").select("payment_settings").eq("id", "default").single().then(({ data }: any) => {
            if (data?.payment_settings) {
                setSettings(s => ({ ...s, ...data.payment_settings }));
            }
        });
    }, [supabase]);

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveMsg(null);
        const { error } = await supabase.from("site_settings").upsert({
            id: "default",
            payment_settings: settings,
            updated_at: new Date().toISOString(),
        });
        setSaving(false);
        if (error) {
            setSaveMsg({ type: "error", text: "حدث خطأ أثناء الحفظ: " + error.message });
        } else {
            setSaveMsg({ type: "success", text: "✅ تم حفظ إعدادات الدفع بنجاح!" });
            setTimeout(() => setSaveMsg(null), 4000);
        }
    };

    const stripePayments = [
        { client: "Digital Product Starter Kit", amount: "15.67 USD", status: "معلق", date: "25 فبراير", service: "pi_3SkOrO..." },
        { client: "T_Shirt Order", amount: "11.33 USD", status: "معلق", date: "24 فبراير", service: "pi_3Sjdwe..." },
        { client: "Manual Invoice", amount: "36.00 USD", status: "معلق", date: "22 فبراير", service: "pi_3Rck0Z..." },
        { client: "Draft Invoice", amount: "7.67 GBP", status: "مسودة", date: "20 فبراير", service: "in_1Qxy9Y..." },
    ];

    const statusStyle: Record<string, string> = {
        "مدفوع": "bg-green-500/10 text-green-400 border-green-500/20",
        "معلق": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        "مسودة": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "متأخر": "bg-red-500/10 text-red-400 border-red-500/20",
    };

    // const isOwner = userEmail === "jumpleadsjl@gmail.com"; // Removed duplicate

    const inputCls = "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-white/40 focus:outline-none transition-colors font-mono placeholder:text-gray-700";
    const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2";
    const toggleCls = (on: boolean) => `relative w-12 h-6 rounded-full transition-colors cursor-pointer ${on ? "bg-white" : "bg-white/10"}`;

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-3">
                <button
                    onClick={() => setActiveSubTab("transactions")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeSubTab === "transactions" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                >
                    المعاملات
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveSubTab("settings")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeSubTab === "settings" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                    >
                        <Shield className="w-4 h-4" />
                        إعدادات البوابات
                    </button>
                )}
            </div>

            {/* Transactions */}
            {activeSubTab === "transactions" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: "القيمة الإجمالية المتوقعة", value: "$70.67", color: "text-green-400" },
                            { label: "دفعات ناجحة", value: "0", color: "text-blue-400" },
                            { label: "دفعات معلقة (Live)", value: "4", color: "text-yellow-400" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {stripePayments.map((pay, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-[1.5rem] hover:border-white/20 transition-all group shadow-sm" dir="rtl">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                                        <CreditCard className="w-5 h-5 text-white/50" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-lg leading-none mb-1.5">{pay.client}</p>
                                        <p className="text-gray-600 text-[10px] font-mono tracking-tighter">{pay.service}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-left">
                                        <p className="text-white font-black text-xl font-mono leading-none mb-1">{pay.amount}</p>
                                        <p className="text-gray-600 text-[10px] font-bold">{pay.date}</p>
                                    </div>
                                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest min-w-[100px] text-center ${statusStyle[pay.status]}`}>
                                        {pay.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Settings - Owner Only */}
            {activeSubTab === "settings" && isOwner && (
                <div className="space-y-6" dir="rtl">
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                        <Shield className="w-5 h-5 text-yellow-400 shrink-0" />
                        <p className="text-yellow-300 text-xs font-bold">هذه الإعدادات سرية وخاصة بالمالك فقط. لا تشارك مفاتيح API مع أي شخص.</p>
                    </div>

                    {/* Save Msg */}
                    {saveMsg && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${saveMsg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                            {saveMsg.text}
                        </div>
                    )}

                    {/* Stripe */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-white font-black text-lg">Stripe</h4>
                                <p className="text-gray-600 text-xs">بطاقة Visa / Mastercard</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, stripe_enabled: !s.stripe_enabled }))}
                                className={toggleCls(settings.stripe_enabled)}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${settings.stripe_enabled ? "right-1" : "right-7"}`} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Publishable Key (المفتاح العام)</label>
                                <input type="text" value={settings.stripe_public_key} onChange={e => setSettings(s => ({ ...s, stripe_public_key: e.target.value }))} className={inputCls} placeholder="pk_live_..." />
                            </div>
                            <div>
                                <label className={labelCls}>Secret Key (المفتاح السري)</label>
                                <input type="password" value={settings.stripe_secret_key} onChange={e => setSettings(s => ({ ...s, stripe_secret_key: e.target.value }))} className={inputCls} placeholder="sk_live_..." />
                            </div>
                            <div>
                                <label className={labelCls}>Webhook Secret</label>
                                <input type="password" value={settings.stripe_webhook_secret} onChange={e => setSettings(s => ({ ...s, stripe_webhook_secret: e.target.value }))} className={inputCls} placeholder="whsec_..." />
                            </div>
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-white font-black text-lg">PayPal</h4>
                                <p className="text-gray-600 text-xs">دفع عبر PayPal</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, paypal_enabled: !s.paypal_enabled }))}
                                className={toggleCls(settings.paypal_enabled)}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${settings.paypal_enabled ? "right-1" : "right-7"}`} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Client ID</label>
                                <input type="text" value={settings.paypal_client_id} onChange={e => setSettings(s => ({ ...s, paypal_client_id: e.target.value }))} className={inputCls} placeholder="AXv4..." />
                            </div>
                            <div>
                                <label className={labelCls}>Secret Key</label>
                                <input type="password" value={settings.paypal_secret_key} onChange={e => setSettings(s => ({ ...s, paypal_secret_key: e.target.value }))} className={inputCls} placeholder="EMj9..." />
                            </div>
                        </div>
                    </div>

                    {/* Bank Transfer */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-white font-black text-lg">تحويل بنكي</h4>
                                <p className="text-gray-600 text-xs">دفع عبر التحويل المصرفي</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, bank_transfer_enabled: !s.bank_transfer_enabled }))}
                                className={toggleCls(settings.bank_transfer_enabled)}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${settings.bank_transfer_enabled ? "right-1" : "right-7"}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>اسم البنك</label>
                                <input type="text" value={settings.bank_name} onChange={e => setSettings(s => ({ ...s, bank_name: e.target.value }))} className={inputCls} placeholder="Bank Muscat" />
                            </div>
                            <div>
                                <label className={labelCls}>اسم الحساب</label>
                                <input type="text" value={settings.bank_account_name} onChange={e => setSettings(s => ({ ...s, bank_account_name: e.target.value }))} className={inputCls} placeholder="JL Digital Marketing" />
                            </div>
                            <div>
                                <label className={labelCls}>رقم الحساب</label>
                                <input type="text" value={settings.bank_account_number} onChange={e => setSettings(s => ({ ...s, bank_account_number: e.target.value }))} className={inputCls} placeholder="0123456789" />
                            </div>
                            <div>
                                <label className={labelCls}>IBAN</label>
                                <input type="text" value={settings.bank_iban} onChange={e => setSettings(s => ({ ...s, bank_iban: e.target.value }))} className={inputCls} placeholder="OM81..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>SWIFT Code</label>
                                <input type="text" value={settings.bank_swift_code} onChange={e => setSettings(s => ({ ...s, bank_swift_code: e.target.value }))} className={inputCls} placeholder="BMUSOMRXXXX" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {saving ? "جاري الحفظ..." : "حفظ إعدادات الدفع"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"leads" | "services" | "staff" | "videos" | "lms" | "payments" | "site_builder" | "homecards">("leads");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const isOwner = userEmail === "jumpleadsjl@gmail.com";
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(true);
    const [servicesLoading, setServicesLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState<any>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const [isConnected, setIsConnected] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const supabase = createClient();

    // Auth guard - check role instead of hardcoded email
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                const user = data?.user;
                if (error) {
                    console.error('Auth error:', error);
                    router.replace("/login");
                    return;
                }
                if (!user) {
                    router.replace("/login");
                    return;
                }
                setUserEmail(user.email || null);
                setAuthChecked(true);
            } catch (err) {
                console.error('Auth check failed:', err);
                router.replace("/login");
            }
        };
        checkAuth();
    }, [router, supabase.auth]);

    const fetchData = useCallback(async () => {
        // Fetch Leads
        setLeadsLoading(true);
        const { data: leadData } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
        if (leadData) setLeads(leadData);
        setLeadsLoading(false);

        // Fetch Staff
        setStaffLoading(true);
        const { data: staffData } = await supabase.from("staff").select("*").order("name");
        if (staffData) setStaff(staffData);
        setStaffLoading(false);

        // Fetch Services
        setServicesLoading(true);
        const { data: svcData } = await supabase.from("services_list").select("*").order("created_at");
        if (svcData) setServices(svcData);
        setServicesLoading(false);
    }, [supabase]);

    useEffect(() => {
        if (!authChecked) return;
        fetchData();

        const channel = supabase.channel("admin-sync")
            .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchData)
            .on("postgres_changes", { event: "*", schema: "public", table: "staff" }, fetchData)
            .on("postgres_changes", { event: "*", schema: "public", table: "services_list" }, fetchData)
            .subscribe((status: any) => {
                if (status === "SUBSCRIBED") {
                    console.log("Realtime enabled");
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [authChecked, fetchData, supabase]);

    const handleSave = async (data: any) => {
        setSaveLoading(true);
        let error = null;

        if (modalConfig.type === 'lead') {
            const { error: e } = await supabase.from('leads').insert([data]);
            error = e;
        } else if (modalConfig.type === 'staff') {
            const { error: e } = await supabase.from('staff').insert([data]);
            error = e;
        } else if (modalConfig.type === 'service') {
            const { error: e } = await supabase.from('services_list').insert([{
                ...data,
                features: data.features.split(',').map((f: string) => f.trim())
            }]);
            error = e;
        }

        if (!error) {
            setModalConfig(null);
            fetchData();
        } else {
            alert("خطأ في حفظ البيانات: " + error.message);
        }
        setSaveLoading(false);
    };

    if (!authChecked) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
    );

    const tabs = [
        { id: "leads", label: "العملاء المحتملون", icon: Users },
        { id: "services", label: "الخدمات", icon: LayoutGrid },
        { id: "staff", label: "الفريق", icon: Users },
        { id: "videos", label: "مركز الفيديو", icon: Video },
        { id: "lms", label: "البرامج التعليمية", icon: BookOpen },
        { id: "payments", label: "المدفوعات", icon: CreditCard },
        { id: "site_builder", label: "منشئ الموقع", icon: Shield },
        { id: "homecards", label: "خدمات الواجهة", icon: Layers },
    ] as const;

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden" dir="rtl">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-10">

                {/* ── Header ── */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">مركز القيادة</h1>
                            <p className="text-gray-500 mt-2 flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                                {isConnected
                                    ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> بث حي • متصل</>
                                    : <><span className="h-2 w-2 rounded-full bg-red-500"></span> غير متصل</>
                                }
                                <span className="text-white/10">|</span>
                                <span className="text-white/60">التفويض: جاسم محمد (Owner)</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
                        className="flex items-center gap-3 bg-red-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-2xl hover:bg-red-600 hover:scale-105 active:scale-95 text-sm uppercase tracking-widest"
                    >
                        <LogOut className="w-5 h-5" /> قطع الاتصال
                    </button>
                </header>

                {/* ── Tab Navigation ── */}
                <nav className="flex flex-wrap gap-3 p-2 bg-white/[0.02] border border-white/10 rounded-3xl overflow-x-auto no-scrollbar shadow-inner">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all duration-500 min-w-fit relative overflow-hidden group ${isActive
                                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                {tab.label}
                                {tab.id === "leads" && leads.length > 0 && (
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter ${isActive ? "bg-black/10" : "bg-white/10"}`}>
                                        {leads.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Tab Content ── */}
                <main className="min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === "leads" && (
                        <LeadsTab
                            leads={leads}
                            loading={leadsLoading}
                            isOwner={isOwner}
                            onAdd={() => isOwner && setModalConfig({
                                type: 'lead',
                                title: 'إضافة عميل محتمل جديد',
                                fields: [
                                    { name: 'full_name', label: 'الاسم الكامل', type: 'text', placeholder: 'مثال: أحمد العماني' },
                                    { name: 'email', label: 'البريد الإلكتروني', type: 'email' },
                                    { name: 'phone', label: 'رقم الهاتف', type: 'text' },
                                    { name: 'company_name', label: 'اسم الشركة', type: 'text' },
                                    {
                                        name: 'status', label: 'الحالة', type: 'select', options: [
                                            { label: 'جديد', value: 'New' },
                                            { label: 'تم التواصل', value: 'Contacted' },
                                            { label: 'مؤهل', value: 'Qualified' }
                                        ]
                                    }
                                ]
                            })}
                        />
                    )}
                    {activeTab === "services" && (
                        <ServicesTab
                            services={services}
                            loading={servicesLoading}
                            onRefresh={fetchData}
                            isOwner={isOwner}
                            onAdd={() => isOwner && setModalConfig({
                                type: 'service',
                                title: 'إضافة خدمة جديدة للنظام',
                                fields: [
                                    { name: 'title_ar', label: 'عنوان الخدمة', type: 'text' },
                                    { name: 'description_ar', label: 'الوصف المختصر', type: 'text' },
                                    { name: 'features', label: 'المميزات (افصل بينها بفاصلة)', type: 'text', placeholder: 'ميزة 1, ميزة 2...' },
                                    { name: 'icon_name', label: 'اسم الأيقونة (Lucide)', type: 'text', placeholder: 'LayoutGrid, TrendingUp, Star, Package, etc.' },
                                    { name: 'color_gradient', label: 'التدرج اللوني (Tailwind)', type: 'text', placeholder: 'from-blue-600/20 to-blue-900/10' }
                                ]
                            })}
                        />
                    )}
                    {activeTab === "staff" && (
                        <StaffTab
                            staff={staff}
                            loading={staffLoading}
                            onRefresh={fetchData}
                            isOwner={isOwner}
                            onAdd={() => isOwner && setModalConfig({
                                type: 'staff',
                                title: 'تسجيل موظف جديد في الفريق',
                                fields: [
                                    { name: 'name', label: 'اسم الموظف', type: 'text' },
                                    { name: 'role', label: 'المسمى الوظيفي', type: 'text' },
                                    { name: 'tasks_count', label: 'عدد المهام الأولية', type: 'number' },
                                    {
                                        name: 'color', label: 'لون الهوية', type: 'select', options: [
                                            { label: 'أزرق', value: 'bg-blue-500' },
                                            { label: 'أخضر', value: 'bg-green-500' },
                                            { label: 'بنفسجي', value: 'bg-purple-500' },
                                            { label: 'أصفر', value: 'bg-amber-500' },
                                            { label: 'أحمر', value: 'bg-red-500' }
                                        ]
                                    }
                                ]
                            })}
                        />
                    )}
                    {activeTab === "lms" && <LmsTab isOwner={isOwner} />}
                    {activeTab === "payments" && <PaymentsTab isOwner={isOwner} userEmail={userEmail} />}
                    {activeTab === "site_builder" && <SiteBuilderTab isOwner={isOwner} />}
                    {activeTab === "homecards" && <HomeServiceCardsTab />}
                    {activeTab === "videos" && <VideosTab />}
                </main>

                {/* ── Modal ── */}
                <AddModal
                    isOpen={!!modalConfig}
                    onClose={() => setModalConfig(null)}
                    title={modalConfig?.title}
                    fields={modalConfig?.fields || []}
                    onSave={handleSave}
                    loading={saveLoading}
                />

            </div>
        </div>
    );
}
