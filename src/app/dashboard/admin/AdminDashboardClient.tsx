"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload, Image, Film, FileText, Save,
  Eye, EyeOff, Plus, Trash2, Edit2, Settings,
  DollarSign, Users, TrendingUp, ShoppingCart,
  RefreshCw, X, UserPlus, Briefcase, CheckCircle,
  Clock, Play, Folder, Star, User, Archive, Download
} from "lucide-react";
import { useConfig, currencies, type Currency } from "@/context/ConfigContext";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import FeaturesTab from "@/components/admin/FeaturesTab";
import {
  addMarqueeItem,
  updateMarqueeItem,
  deleteMarqueeItem,
  toggleMarqueeItem,
  addVideo,
  updateVideo,
  deleteVideo,
  toggleVideo,
  updateCurrencyRates,
  updateHeroContent,
  uploadAsset,
  togglePageVisibility,
  addService,
  updateService,
  deleteService,
  toggleService,
  updatePaymentSettings,
  inviteStaffMember,
  getStaffMembers,
  createLead,
  getLeads,
  updateLeadStatus,
  assignLeadToStaff,
  createProject,
  createTask,
  getTasks,
  updateTaskStatus,
  addLMSCourse,
  addLMSVideo,
  createClient,
  updateClient,
  archiveClient,
  deleteClient,
  getClients,
  updatePageContent,
  getFAQItems,
} from "@/app/actions";
import type { FAQItem } from "@/utils/supabase/server-data";

type TabType = "dashboard" | "hero" | "assets" | "marquee" | "videos" | "features" | "services" | "payments" | "staff" | "leads" | "projects" | "lms" | "pages" | "settings" | "clients";

interface MarqueeItem {
  id: string;
  text: string;
  textAr: string;
  order: number;
  isActive: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  url: string;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
}

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  pricingBasic: number;
  pricingPro: number;
  pricingEnterprise: number;
  timeline: string;
  timelineAr: string;
  icon: string;
  isActive: boolean;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret: string;
  bankTransferEnabled: boolean;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  bankIban: string;
  bankSwift: string;
}

interface Client {
  id: string;
  owner_id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  source: string | null;
  status: 'new' | 'in_progress' | 'closed' | 'lost';
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboardClient({ initialFaqs = [] }: { initialFaqs?: FAQItem[] }) {
  const { config, refreshConfig, isLoading } = useConfig();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSaving, setIsSaving] = useState(false);

  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [newMarqueeItem, setNewMarqueeItem] = useState({ text: "", textAr: "" });
  const [editingMarquee, setEditingMarquee] = useState<string | null>(null);

  const [newVideo, setNewVideo] = useState({
    title: "", titleAr: "", description: "", descriptionAr: "", url: ""
  });
  const [editingVideo, setEditingVideo] = useState<string | null>(null);

  const [newService, setNewService] = useState({
    slug: "", title: "", titleAr: "", subtitle: "", subtitleAr: "",
    description: "", descriptionAr: "", features: "", featuresAr: "",
    pricingBasic: 0, pricingPro: 0, pricingEnterprise: 0,
    timeline: "", timelineAr: "", icon: "Filter"
  });
  const [editingService, setEditingService] = useState<string | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: false, stripePublicKey: "", stripeSecretKey: "",
    paypalEnabled: false, paypalClientId: "", paypalSecret: "",
    bankTransferEnabled: false, bankAccountName: "", bankAccountNumber: "",
    bankName: "", bankIban: "", bankSwift: ""
  });

  const [staffMembers, setStaffMembers] = useState<{ id: string; email: string; fullName: string; role: string; specialty: string; isActive: boolean }[]>([]);
  const [newStaff, setNewStaff] = useState({ email: "", fullName: "", role: "staff", specialty: "" });

  const [leads, setLeads] = useState<{ id: string; name: string; email: string; phone: string; service_interest: string; status: string; assigned_to: string | null; created_at: string }[]>([]);
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", serviceInterest: "", budget: "", notes: "" });

  const [tasks, setTasks] = useState<{ id: string; project_id: string; assigned_to: string; title: string; description: string; status: string; hours_worked: number; due_date: string; created_at: string }[]>([]);
  const [newTask, setNewTask] = useState({ projectId: "", assignedTo: "", title: "", description: "", dueDate: "" });

  const [lmsCourses, setLmsCourses] = useState<{ id: string; title: string; title_ar: string; month_number: number }[]>([]);
  const [newLmsCourse, setNewLmsCourse] = useState({ title: "", titleAr: "", description: "", descriptionAr: "", folderId: "", monthNumber: 1 });
  const [newLmsVideo, setNewLmsVideo] = useState({ courseId: "", title: "", titleAr: "", driveEmbedUrl: "", durationMinutes: 0 });

  const [heroContent, setHeroContent] = useState({
    heroTitle: "",
    heroTitleAr: "",
    heroSubtitle: "",
    heroSubtitleAr: "",
    heroCtaText: "",
    heroCtaTextAr: "",
  });

  const [currencyRates, setCurrencyRates] = useState({
    OMR: 1, SAR: 9.75, USD: 2.6, AED: 9.75
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [newClient, setNewClient] = useState({
    fullName: "", email: "", phone: "", company: "", source: "", status: "new" as 'new' | 'in_progress' | 'closed' | 'lost', notes: ""
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  const tabs = [
    { id: "dashboard", label: "لوحة التحكم", icon: TrendingUp },
    { id: "hero", label: "القسم الرئيسي", icon: Image },
    { id: "assets", label: "أصول الموقع", icon: Image },
    { id: "marquee", label: "شريط التمرير", icon: Film },
    { id: "videos", label: "مركز الفيديو", icon: Film },
    { id: "features", label: "البطاقات المميزة", icon: Star },
    { id: "services", label: "إدارة الخدمات", icon: ShoppingCart },
    { id: "payments", label: "بوابات الدفع", icon: DollarSign },
    { id: "staff", label: "إدارة الموظفين", icon: UserPlus },
    { id: "leads", label: "العملاء المحتملين", icon: Users },
    { id: "clients", label: "العملاء", icon: User },
    { id: "projects", label: "المشاريع", icon: Briefcase },
    { id: "lms", label: "الأكاديمية", icon: Play },
    { id: "pages", label: "إدارة الصفحات", icon: FileText },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  useEffect(() => {
    async function loadPaymentSettings() {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('site_settings')
        .select('payment_settings')
        .eq('id', 'default')
        .single();

      if (data?.payment_settings) {
        const ps = data.payment_settings;
        setPaymentSettings({
          stripeEnabled: ps.stripe_enabled || false,
          stripePublicKey: ps.stripe_public_key || '',
          stripeSecretKey: ps.stripe_secret_key || '',
          paypalEnabled: ps.paypal_enabled || false,
          paypalClientId: ps.paypal_client_id || '',
          paypalSecret: ps.paypal_secret || '',
          bankTransferEnabled: ps.bank_transfer_enabled || false,
          bankAccountName: ps.bank_account_name || '',
          bankAccountNumber: ps.bank_account_number || '',
          bankName: ps.bank_name || '',
          bankIban: ps.bank_iban || '',
          bankSwift: ps.bank_swift || '',
        });
      }
    }

    if (config) {
      setMarqueeItems(config.marqueeItems || []);
      setVideos(config.videos || []);
      setHeroContent({
        heroTitle: config.heroTitle || "",
        heroTitleAr: config.heroTitleAr || "",
        heroSubtitle: config.heroSubtitle || "",
        heroSubtitleAr: config.heroSubtitleAr || "",
        heroCtaText: config.heroCtaText || "",
        heroCtaTextAr: config.heroCtaTextAr || "",
      });
      setCurrencyRates(config.currencyRates || { OMR: 1, SAR: 9.75, USD: 2.6, AED: 9.75 });
      loadPaymentSettings();
    }
  }, [config]);

  useEffect(() => {
    if (activeTab === "services") {
      loadServices();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "clients") {
      loadClients();
    }
  }, [activeTab, showArchived]);

  useEffect(() => {
    if (activeTab === "pages") {
      loadFaqs();
    }
  }, [activeTab]);

  const loadFaqs = async () => {
    setIsFaqLoading(true);
    try {
      const data = await getFAQItems();
      setFaqs(data || []);
    } catch (error) {
      console.error("Failed to load FAQs:", error);
    } finally {
      setIsFaqLoading(false);
    }
  };

  const handleSaveFaqs = async () => {
    setIsSaving(true);
    try {
      await updatePageContent('main', { faq_items: faqs });
      alert("تم حفظ الأسئلة الشائعة بنجاح");
    } catch (error) {
      console.error("Failed to save FAQs:", error);
      alert("حدث خطأ أثناء حفظ الأسئلة");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      { question: "", question_ar: "", answer: "", answer_ar: "" }
    ]);
    setEditingFaqIndex(faqs.length);
  };

  const handleUpdateFaq = (index: number, updates: Partial<FAQItem>) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], ...updates };
    setFaqs(newFaqs);
  };

  const handleRemoveFaq = (index: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    setFaqs(faqs.filter((_, i) => i !== index));
    if (editingFaqIndex === index) setEditingFaqIndex(null);
  };

  const loadClients = async () => {
    setIsClientsLoading(true);
    try {
      const clientsData = await getClients(showArchived);
      setClients(clientsData as Client[]);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setIsClientsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.fullName.trim() || !newClient.email.trim() || !newClient.phone.trim()) return;
    try {
      await createClient({
        full_name: newClient.fullName,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company || undefined,
        source: newClient.source || undefined,
        status: newClient.status,
        notes: newClient.notes || undefined,
      });
      setNewClient({ fullName: "", email: "", phone: "", company: "", source: "", status: "new", notes: "" });
      await loadClients();
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    try {
      await updateClient(editingClient.id, {
        full_name: editingClient.full_name,
        email: editingClient.email,
        phone: editingClient.phone,
        company: editingClient.company || undefined,
        source: editingClient.source || undefined,
        status: editingClient.status,
        notes: editingClient.notes || undefined,
      });
      setEditingClient(null);
      setIsClientModalOpen(false);
      await loadClients();
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  };

  const handleArchiveClient = async (id: string) => {
    try {
      await archiveClient(id);
      await loadClients();
    } catch (error) {
      console.error("Failed to archive client:", error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  const exportClientsCSV = () => {
    const headers = ["تاريخ التسجيل", "الاسم الكامل", "البريد الإلكتروني", "الهاتف", "الشركة", "الحالة", "المصدر"];
    const rows = clients.map(c => [
      new Date(c.created_at).toLocaleDateString("ar-EG"),
      c.full_name,
      c.email,
      c.phone,
      c.company || "",
      c.status,
      c.source || ""
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSave = async () => {
    setIsSaving(true);
    await refreshConfig();
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleAddMarquee = async () => {
    if (!newMarqueeItem.text.trim()) return;
    try {
      await addMarqueeItem(newMarqueeItem.text, newMarqueeItem.textAr);
      setNewMarqueeItem({ text: "", textAr: "" });
      await refreshConfig();
    } catch (error) {
      console.error("Failed to add marquee item:", error);
    }
  };

  const handleDeleteMarquee = async (id: string) => {
    try {
      await deleteMarqueeItem(id);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to delete marquee item:", error);
    }
  };

  const handleToggleMarquee = async (id: string, isActive: boolean) => {
    try {
      await toggleMarqueeItem(id, !isActive);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to toggle marquee item:", error);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;
    try {
      await addVideo(
        newVideo.title,
        newVideo.titleAr,
        newVideo.description,
        newVideo.descriptionAr,
        newVideo.url
      );
      setNewVideo({ title: "", titleAr: "", description: "", descriptionAr: "", url: "" });
      await refreshConfig();
    } catch (error) {
      console.error("Failed to add video:", error);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteVideo(id);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  const handleToggleVideo = async (id: string, isActive: boolean) => {
    try {
      await toggleVideo(id, !isActive);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  const handleUpdateHero = async () => {
    try {
      await updateHeroContent(
        heroContent.heroTitle,
        heroContent.heroTitleAr,
        heroContent.heroSubtitle,
        heroContent.heroSubtitleAr,
        heroContent.heroCtaText,
        heroContent.heroCtaTextAr
      );
      await refreshConfig();
    } catch (error) {
      console.error("Failed to update hero:", error);
    }
  };

  const handleUpdateCurrency = async () => {
    try {
      await updateCurrencyRates(currencyRates);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  };

  const handleAddService = async () => {
    if (!newService.title.trim() || !newService.slug.trim()) return;
    try {
      await addService(
        newService.slug,
        newService.title,
        newService.titleAr,
        newService.subtitle,
        newService.subtitleAr,
        newService.description,
        newService.descriptionAr,
        newService.features.split(',').map(f => f.trim()),
        newService.featuresAr.split(',').map(f => f.trim()),
        newService.pricingBasic,
        newService.pricingPro,
        newService.pricingEnterprise,
        newService.timeline,
        newService.timelineAr,
        newService.icon
      );
      setNewService({
        slug: "", title: "", titleAr: "", subtitle: "", subtitleAr: "",
        description: "", descriptionAr: "", features: "", featuresAr: "",
        pricingBasic: 0, pricingPro: 0, pricingEnterprise: 0,
        timeline: "", timelineAr: "", icon: "Filter"
      });
      await refreshConfig();
    } catch (error) {
      console.error("Failed to add service:", error);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleToggleService = async (id: string, isActive: boolean) => {
    try {
      await toggleService(id, !isActive);
      await refreshConfig();
    } catch (error) {
      console.error("Failed to toggle service:", error);
    }
  };

  const loadServices = async () => {
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('order', { ascending: true });

      if (data) {
        setServices(data.map((s: any) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          titleAr: s.title_ar,
          subtitle: s.subtitle,
          subtitleAr: s.subtitle_ar,
          description: s.description,
          descriptionAr: s.description_ar,
          features: s.features || [],
          featuresAr: s.features_ar || [],
          pricingBasic: s.pricing_basic || 0,
          pricingPro: s.pricing_pro || 0,
          pricingEnterprise: s.pricing_enterprise || 0,
          timeline: s.timeline || '',
          timelineAr: s.timeline_ar || '',
          icon: s.icon || 'Filter',
          isActive: s.is_active || false,
        })));
      }
    } catch (error) {
      console.error("Failed to load services:", error);
    }
  };

  const handleEditService = (service: ServiceItem) => {
    setEditingService(service.id);
    setNewService({
      slug: service.slug,
      title: service.title,
      titleAr: service.titleAr,
      subtitle: service.subtitle,
      subtitleAr: service.subtitleAr,
      description: service.description,
      descriptionAr: service.descriptionAr,
      features: service.features.join(', '),
      featuresAr: service.featuresAr.join(', '),
      pricingBasic: service.pricingBasic,
      pricingPro: service.pricingPro,
      pricingEnterprise: service.pricingEnterprise,
      timeline: service.timeline,
      timelineAr: service.timelineAr,
      icon: service.icon,
    });
  };

  const handleUpdateService = async () => {
    if (!editingService || !newService.title.trim() || !newService.slug.trim()) return;
    try {
      await updateService(
        editingService,
        newService.slug,
        newService.title,
        newService.titleAr,
        newService.subtitle,
        newService.subtitleAr,
        newService.description,
        newService.descriptionAr,
        newService.features.split(',').map(f => f.trim()),
        newService.featuresAr.split(',').map(f => f.trim()),
        newService.pricingBasic,
        newService.pricingPro,
        newService.pricingEnterprise,
        newService.timeline,
        newService.timelineAr,
        newService.icon
      );
      setEditingService(null);
      setNewService({
        slug: "", title: "", titleAr: "", subtitle: "", subtitleAr: "",
        description: "", descriptionAr: "", features: "", featuresAr: "",
        pricingBasic: 0, pricingPro: 0, pricingEnterprise: 0,
        timeline: "", timelineAr: "", icon: "Filter"
      });
      await loadServices();
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setNewService({
      slug: "", title: "", titleAr: "", subtitle: "", subtitleAr: "",
      description: "", descriptionAr: "", features: "", featuresAr: "",
      pricingBasic: 0, pricingPro: 0, pricingEnterprise: 0,
      timeline: "", timelineAr: "", icon: "Filter"
    });
  };

  const handleUpdatePayment = async () => {
    try {
      await updatePaymentSettings({
        stripe_enabled: paymentSettings.stripeEnabled,
        stripe_public_key: paymentSettings.stripePublicKey,
        stripe_secret_key: paymentSettings.stripeSecretKey,
        paypal_enabled: paymentSettings.paypalEnabled,
        paypal_client_id: paymentSettings.paypalClientId,
        paypal_secret: paymentSettings.paypalSecret,
        bank_transfer_enabled: paymentSettings.bankTransferEnabled,
        bank_account_name: paymentSettings.bankAccountName,
        bank_account_number: paymentSettings.bankAccountNumber,
        bank_name: paymentSettings.bankName,
        bank_iban: paymentSettings.bankIban,
        bank_swift: paymentSettings.bankSwift,
      });
      await refreshConfig();
    } catch (error) {
      console.error("Failed to update payment settings:", error);
    }
  };

  const handleInviteStaff = async () => {
    if (!newStaff.email.trim() || !newStaff.fullName.trim()) return;
    try {
      await inviteStaffMember(newStaff.email, newStaff.fullName, newStaff.role as 'admin' | 'staff', newStaff.specialty);
      setNewStaff({ email: "", fullName: "", role: "staff", specialty: "" });
      const staff = await getStaffMembers();
      setStaffMembers(staff.map(s => ({ ...s, email: s.email || '' })));
    } catch (error) {
      console.error("Failed to invite staff:", error);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name.trim() || !newLead.email.trim()) return;
    try {
      await createLead(newLead.name, newLead.email, newLead.phone, newLead.serviceInterest || '', newLead.notes);
      setNewLead({ name: "", email: "", phone: "", serviceInterest: "", budget: "", notes: "" });
      const leadsData = await getLeads();
      setLeads(leadsData);
    } catch (error) {
      console.error("Failed to create lead:", error);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      await updateLeadStatus(leadId, status as 'new' | 'contacted' | 'proposal' | 'converted' | 'lost');
      const leadsData = await getLeads();
      setLeads(leadsData);
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.projectId.trim()) return;
    try {
      await createTask(newTask.projectId, newTask.assignedTo, newTask.title, newTask.description, newTask.dueDate);
      setNewTask({ projectId: "", assignedTo: "", title: "", description: "", dueDate: "" });
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status as 'pending' | 'in_progress' | 'completed');
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleAddLmsCourse = async () => {
    if (!newLmsCourse.title.trim()) return;
    try {
      await addLMSCourse(newLmsCourse.title, newLmsCourse.titleAr, newLmsCourse.description, newLmsCourse.descriptionAr, newLmsCourse.folderId, newLmsCourse.monthNumber);
      setNewLmsCourse({ title: "", titleAr: "", description: "", descriptionAr: "", folderId: "", monthNumber: 1 });
    } catch (error) {
      console.error("Failed to add LMS course:", error);
    }
  };

  const handleAddLmsVideo = async () => {
    if (!newLmsVideo.title.trim() || !newLmsVideo.courseId.trim()) return;
    try {
      await addLMSVideo(newLmsVideo.courseId, newLmsVideo.title, newLmsVideo.titleAr, newLmsVideo.driveEmbedUrl, newLmsVideo.durationMinutes);
      setNewLmsVideo({ courseId: "", title: "", titleAr: "", driveEmbedUrl: "", durationMinutes: 0 });
    } catch (error) {
      console.error("Failed to add LMS video:", error);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAsset(file, 'logo');
      await refreshConfig();
    } catch (error) {
      console.error("Failed to upload logo:", error);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAsset(file, 'favicon');
      await refreshConfig();
    } catch (error) {
      console.error("Failed to upload favicon:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <div className="relative z-10 flex">
        <aside className="w-64 border-l border-gray-800 p-6 hidden lg:block h-screen sticky top-0 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xl font-bold">لوحة التحكم</h2>
            <p className="text-sm text-gray-400">مشرف النظام</p>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
                <p className="text-gray-400">نظرة عامة على أداء الموقع</p>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-green-400 text-sm">+12.5%</span>
                  </div>
                  <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold">132,600 ر.ع</p>
                </div>

                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-green-400 text-sm">+8.2%</span>
                  </div>
                  <p className="text-gray-400 text-sm">إجمالي العملاء</p>
                  <p className="text-3xl font-bold">47</p>
                </div>

                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-green-400 text-sm">+15.3%</span>
                  </div>
                  <p className="text-gray-400 text-sm">الطلبات النشطة</p>
                  <p className="text-3xl font-bold">23</p>
                </div>

                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="text-green-400 text-sm">+5.7%</span>
                  </div>
                  <p className="text-gray-400 text-sm">معدل التحويل</p>
                  <p className="text-3xl font-bold">24.8%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hero" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">القسم الرئيسي</h1>
                <p className="text-gray-400">تحكم في محتوى الصفحة الرئيسية</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">محتوى Hero</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">العنوان (إنجليزي)</label>
                    <input
                      type="text"
                      value={heroContent.heroTitle}
                      onChange={(e) => setHeroContent({ ...heroContent, heroTitle: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">العنوان (عربي)</label>
                    <input
                      type="text"
                      value={heroContent.heroTitleAr}
                      onChange={(e) => setHeroContent({ ...heroContent, heroTitleAr: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">العنوان الفرعي (إنجليزي)</label>
                    <input
                      type="text"
                      value={heroContent.heroSubtitle}
                      onChange={(e) => setHeroContent({ ...heroContent, heroSubtitle: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">العنوان الفرعي (عربي)</label>
                    <input
                      type="text"
                      value={heroContent.heroSubtitleAr}
                      onChange={(e) => setHeroContent({ ...heroContent, heroSubtitleAr: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">نص الزر (إنجليزي)</label>
                    <input
                      type="text"
                      value={heroContent.heroCtaText}
                      onChange={(e) => setHeroContent({ ...heroContent, heroCtaText: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">نص الزر (عربي)</label>
                    <input
                      type="text"
                      value={heroContent.heroCtaTextAr}
                      onChange={(e) => setHeroContent({ ...heroContent, heroCtaTextAr: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateHero}
                  className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  حفظ محتوى Hero
                </button>
              </div>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">أصول الموقع</h1>
                <p className="text-gray-400">إدارة الشعار والأيقونات</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-4">شعار الموقع</h3>
                  {config?.logoUrl && (
                    <div className="mb-4">
                      <img src={config.logoUrl} alt="Logo" className="h-20 object-contain" />
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-700 rounded-[2rem] p-8 text-center hover:border-gray-500 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400">انقر لرفع الشعار</p>
                    <p className="text-sm text-gray-600">PNG, SVG up to 2MB</p>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-4">أيقونة المتصفح (Favicon)</h3>
                  {config?.faviconUrl && (
                    <div className="mb-4 flex items-center gap-2">
                      <img src={config.faviconUrl} alt="Favicon" className="w-8 h-8" />
                      <span className="text-sm text-gray-500">Current favicon</span>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-700 rounded-[2rem] p-8 text-center hover:border-gray-500 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*,.ico"
                      onChange={handleUploadFavicon}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400">انقر لرفع الأيقونة</p>
                    <p className="text-sm text-gray-600">ICO, PNG 32x32</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "marquee" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">شريط التمرير</h1>
                <p className="text-gray-400">إدارة نص شريط التمرير المتحرك</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة نص جديد</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={newMarqueeItem.text}
                    onChange={(e) => setNewMarqueeItem({ ...newMarqueeItem, text: e.target.value })}
                    placeholder="النص بالإنجليزية"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newMarqueeItem.textAr}
                    onChange={(e) => setNewMarqueeItem({ ...newMarqueeItem, textAr: e.target.value })}
                    placeholder="النص بالعربية"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddMarquee}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة
                </button>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">النصوص المعروضة</h3>
                <div className="space-y-4">
                  {marqueeItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                      <span className="text-gray-500 w-8">{item.order}</span>
                      <div className="flex-1 grid md:grid-cols-2 gap-2">
                        <span className="text-white">{item.text}</span>
                        <span className="text-gray-400 text-sm">{item.textAr}</span>
                      </div>
                      <button
                        onClick={() => handleToggleMarquee(item.id, item.isActive)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${item.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                          }`}
                      >
                        {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMarquee(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">مركز الفيديو</h1>
                <p className="text-gray-400">إدارة مقاطع الفيديو المعروضة</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة فيديو جديد</h3>
                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      placeholder="العنوان بالإنجليزية"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newVideo.titleAr}
                      onChange={(e) => setNewVideo({ ...newVideo, titleAr: e.target.value })}
                      placeholder="العنوان بالعربية"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                      placeholder="الوصف بالإنجليزية"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newVideo.descriptionAr}
                      onChange={(e) => setNewVideo({ ...newVideo, descriptionAr: e.target.value })}
                      placeholder="الوصف بالعربية"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    placeholder="رابط الفيديو (YouTube Embed)"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddVideo}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة فيديو
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] overflow-hidden">
                    <div className="aspect-video bg-gray-800 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold mb-2">{video.title}</h4>
                      <p className="text-sm text-gray-400 mb-4">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleToggleVideo(video.id, video.isActive)}
                          className={`flex items-center gap-2 text-sm ${video.isActive ? 'text-green-400' : 'text-gray-500'}`}
                        >
                          {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {video.isActive ? "مفعل" : "معطل"}
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <FeaturesTab />
          )}

          {activeTab === "services" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">إدارة الخدمات</h1>
                <p className="text-gray-400">إضافة وتعديل وحذف الخدمات المعروضة</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة خدمة جديدة</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newService.slug}
                      onChange={(e) => setNewService({ ...newService, slug: e.target.value })}
                      placeholder="الرابط (slug) - مثال: funnels"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newService.icon}
                      onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                      placeholder="الأيقونة - مثال: Filter"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      placeholder="اسم الخدمة (إنجليزي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newService.titleAr}
                      onChange={(e) => setNewService({ ...newService, titleAr: e.target.value })}
                      placeholder="اسم الخدمة (عربي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newService.subtitle}
                      onChange={(e) => setNewService({ ...newService, subtitle: e.target.value })}
                      placeholder="العنوان الفرعي (إنجليزي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newService.subtitleAr}
                      onChange={(e) => setNewService({ ...newService, subtitleAr: e.target.value })}
                      placeholder="العنوان الفرعي (عربي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="الوصف (إنجليزي)"
                      rows={3}
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <textarea
                      value={newService.descriptionAr}
                      onChange={(e) => setNewService({ ...newService, descriptionAr: e.target.value })}
                      placeholder="الوصف (عربي)"
                      rows={3}
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newService.features}
                      onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                      placeholder="المميزات (إنجليزي) - مفصولة بفواصل"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newService.featuresAr}
                      onChange={(e) => setNewService({ ...newService, featuresAr: e.target.value })}
                      placeholder="المميزات (عربي) - مفصولة بفواصل"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">السعر الأساسي (OMR)</label>
                      <input
                        type="number"
                        value={newService.pricingBasic}
                        onChange={(e) => setNewService({ ...newService, pricingBasic: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">السعر الاحترافي (OMR)</label>
                      <input
                        type="number"
                        value={newService.pricingPro}
                        onChange={(e) => setNewService({ ...newService, pricingPro: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">السعر المؤسسي (OMR)</label>
                      <input
                        type="number"
                        value={newService.pricingEnterprise}
                        onChange={(e) => setNewService({ ...newService, pricingEnterprise: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newService.timeline}
                      onChange={(e) => setNewService({ ...newService, timeline: e.target.value })}
                      placeholder="المدة (إنجليزي) - مثال: 2-4 weeks"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newService.timelineAr}
                      onChange={(e) => setNewService({ ...newService, timelineAr: e.target.value })}
                      placeholder="المدة (عربي) - مثال: 2-4 أسابيع"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={editingService ? handleUpdateService : handleAddService}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {editingService ? "تحديث الخدمة" : "إضافة خدمة"}
                  </button>
                  {editingService && (
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors flex items-center gap-2 mr-4"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">الخدمات الموجودة</h3>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{service.title}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-400">{service.titleAr}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Basic: {service.pricingBasic} OMR | Pro: {service.pricingPro} OMR | Enterprise: {service.pricingEnterprise} OMR
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <p className="text-gray-400 text-center py-4">لا توجد خدمات مضافة بعد</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">بوابات الدفع</h1>
                <p className="text-gray-400">إعداد وتفعيل طرق الدفع المختلفة</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">Stripe</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paymentSettings.stripeEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-white font-medium">تفعيل Stripe</span>
                  </div>
                  <input
                    type="text"
                    value={paymentSettings.stripePublicKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                    placeholder="Stripe Public Key"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="password"
                    value={paymentSettings.stripeSecretKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                    placeholder="Stripe Secret Key"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">PayPal</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paymentSettings.paypalEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalEnabled: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-white font-medium">تفعيل PayPal</span>
                  </div>
                  <input
                    type="text"
                    value={paymentSettings.paypalClientId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                    placeholder="PayPal Client ID"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="password"
                    value={paymentSettings.paypalSecret}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalSecret: e.target.value })}
                    placeholder="PayPal Secret"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">التحويل البنكي</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankTransferEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransferEnabled: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-white font-medium">تفعيل التحويل البنكي</span>
                  </div>
                  <input
                    type="text"
                    value={paymentSettings.bankName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                    placeholder="اسم البنك"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={paymentSettings.bankAccountName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountName: e.target.value })}
                    placeholder="اسم الحساب"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={paymentSettings.bankAccountNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                    placeholder="رقم الحساب"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={paymentSettings.bankIban}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankIban: e.target.value })}
                    placeholder="IBAN"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={paymentSettings.bankSwift}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankSwift: e.target.value })}
                    placeholder="Swift Code"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleUpdatePayment}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  حفظ إعدادات الدفع
                </button>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">إدارة الموظفين</h1>
                <p className="text-gray-400">إضافة وتعديل صلاحيات الموظفين</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">دعوة موظف جديد</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                      placeholder="الاسم الكامل"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="البريد الإلكتروني"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    >
                      <option value="admin">مدير</option>
                      <option value="staff">موظف</option>
                    </select>
                    <input
                      type="text"
                      value={newStaff.specialty}
                      onChange={(e) => setNewStaff({ ...newStaff, specialty: e.target.value })}
                      placeholder="التخصص (مثال: مصمم، مبرمج)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleInviteStaff}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    دعوة موظف
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leads" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">العملاء المحتملين</h1>
                <p className="text-gray-400">إدارة Leads وتحويلها لمشاريع</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة Lead جديد</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      placeholder="اسم العميل"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="البريد الإلكتروني"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="رقم الهاتف"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newLead.serviceInterest}
                      onChange={(e) => setNewLead({ ...newLead, serviceInterest: e.target.value })}
                      placeholder="الخدمة المطلوبة"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="ملاحظات"
                    rows={3}
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <button
                    onClick={handleCreateLead}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة Lead
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">العملاء</h1>
                  <p className="text-gray-400">إدارة العملاء والعملاء المحتملين</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${showArchived ? "bg-yellow-600/20 text-yellow-400" : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                  >
                    <Archive className="w-5 h-5" />
                    {showArchived ? "إظهار النشطين" : "إظهار المؤرشفين"}
                  </button>
                  <button
                    onClick={exportClientsCSV}
                    disabled={clients.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                    تصدير CSV
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة عميل جديد</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newClient.fullName}
                      onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                      placeholder="الاسم الكامل *"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="البريد الإلكتروني *"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="رقم الهاتف *"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newClient.company}
                      onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                      placeholder="الشركة"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newClient.source}
                      onChange={(e) => setNewClient({ ...newClient, source: e.target.value })}
                      placeholder="المصدر (مثل: TikTok, Ads, Referral)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value as any })}
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    >
                      <option value="new">جديد</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="closed">مغلق</option>
                      <option value="lost">مفقود</option>
                    </select>
                  </div>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="ملاحظات"
                    rows={3}
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <button
                    onClick={handleCreateClient}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة عميل
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">قائمة العملاء ({clients.length})</h3>

                {isClientsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : clients.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">لا يوجد عملاء بعد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">تاريخ التسجيل</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">الاسم</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">البريد</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">الهاتف</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">الشركة</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">الحالة</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">المصدر</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((client) => (
                          <tr key={client.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3 px-4 text-white">{new Date(client.created_at).toLocaleDateString("ar-EG")}</td>
                            <td className="py-3 px-4 text-white font-medium">{client.full_name}</td>
                            <td className="py-3 px-4 text-gray-300">{client.email}</td>
                            <td className="py-3 px-4 text-gray-300">{client.phone}</td>
                            <td className="py-3 px-4 text-gray-300">{client.company || "-"}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${client.status === 'new' ? 'bg-blue-600/20 text-blue-400' :
                                client.status === 'in_progress' ? 'bg-yellow-600/20 text-yellow-400' :
                                  client.status === 'closed' ? 'bg-green-600/20 text-green-400' :
                                    'bg-red-600/20 text-red-400'
                                }`}>
                                {client.status === 'new' ? 'جديد' :
                                  client.status === 'in_progress' ? 'قيد التنفيذ' :
                                    client.status === 'closed' ? 'مغلق' : 'مفقود'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{client.source || "-"}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditingClient(client); setIsClientModalOpen(true); }}
                                  className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleArchiveClient(client.id)}
                                  className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {isClientModalOpen && editingClient && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">تعديل العميل</h3>
                      <button
                        onClick={() => { setEditingClient(null); setIsClientModalOpen(false); }}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingClient.full_name}
                          onChange={(e) => setEditingClient({ ...editingClient, full_name: e.target.value })}
                          placeholder="الاسم الكامل *"
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        />
                        <input
                          type="email"
                          value={editingClient.email}
                          onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                          placeholder="البريد الإلكتروني *"
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="tel"
                          value={editingClient.phone}
                          onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                          placeholder="رقم الهاتف *"
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editingClient.company || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                          placeholder="الشركة"
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingClient.source || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, source: e.target.value })}
                          placeholder="المصدر"
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        />
                        <select
                          value={editingClient.status}
                          onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                          className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                        >
                          <option value="new">جديد</option>
                          <option value="in_progress">قيد التنفيذ</option>
                          <option value="closed">مغلق</option>
                          <option value="lost">مفقود</option>
                        </select>
                      </div>
                      <textarea
                        value={editingClient.notes || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                        placeholder="ملاحظات"
                        rows={3}
                        className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={handleUpdateClient}
                          className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          حفظ التغييرات
                        </button>
                        <button
                          onClick={() => { setEditingClient(null); setIsClientModalOpen(false); }}
                          className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">المشاريع</h1>
                <p className="text-gray-400">إدارة المشاريع والمهام</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة مهمة جديدة</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="عنوان المهمة"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="وصف المهمة"
                    rows={3}
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      placeholder="معرف الموظف المسند إليه"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCreateTask}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة مهمة
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lms" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">الأكاديمية</h1>
                <p className="text-gray-400">إدارة محتوى الأكاديمية (Google Drive)</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة دورة جديدة</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newLmsCourse.title}
                      onChange={(e) => setNewLmsCourse({ ...newLmsCourse, title: e.target.value })}
                      placeholder="اسم الدورة (إنجليزي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newLmsCourse.titleAr}
                      onChange={(e) => setNewLmsCourse({ ...newLmsCourse, titleAr: e.target.value })}
                      placeholder="اسم الدورة (عربي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={newLmsCourse.folderId}
                      onChange={(e) => setNewLmsCourse({ ...newLmsCourse, folderId: e.target.value })}
                      placeholder="معرف مجلد Google Drive"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newLmsCourse.monthNumber}
                      onChange={(e) => setNewLmsCourse({ ...newLmsCourse, monthNumber: parseInt(e.target.value) || 1 })}
                      placeholder="رقم الشهر"
                      min="1"
                      max="12"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <button
                      onClick={handleAddLmsCourse}
                      className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Folder className="w-5 h-5" />
                      إضافة دورة
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">إضافة فيديو جديد</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newLmsVideo.courseId}
                    onChange={(e) => setNewLmsVideo({ ...newLmsVideo, courseId: e.target.value })}
                    placeholder="معرف الدورة"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newLmsVideo.title}
                      onChange={(e) => setNewLmsVideo({ ...newLmsVideo, title: e.target.value })}
                      placeholder="عنوان الفيديو (إنجليزي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newLmsVideo.titleAr}
                      onChange={(e) => setNewLmsVideo({ ...newLmsVideo, titleAr: e.target.value })}
                      placeholder="عنوان الفيديو (عربي)"
                      className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={newLmsVideo.driveEmbedUrl}
                    onChange={(e) => setNewLmsVideo({ ...newLmsVideo, driveEmbedUrl: e.target.value })}
                    placeholder="رابط embed فيديو Google Drive"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <input
                    type="number"
                    value={newLmsVideo.durationMinutes}
                    onChange={(e) => setNewLmsVideo({ ...newLmsVideo, durationMinutes: parseInt(e.target.value) || 0 })}
                    placeholder="المدة (بالدقائق)"
                    className="bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-white focus:outline-none w-full"
                  />
                  <button
                    onClick={handleAddLmsVideo}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    إضافة فيديو
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">إدارة الصفحات</h1>
                  <p className="text-gray-400">تحكم في محتوى الصفحات والأسئلة الشائعة</p>
                </div>
                <button
                  onClick={handleSaveFaqs}
                  disabled={isSaving}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التغييرات
                </button>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">الأسئلة الشائعة (FAQ)</h3>
                  <button
                    onClick={handleAddFaq}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة سؤال
                  </button>
                </div>

                {isFaqLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-800 rounded-2xl overflow-hidden bg-black/40">
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setEditingFaqIndex(editingFaqIndex === index ? null : index)}
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium">{faq.question_ar || "سؤال جديد"}</p>
                            <p className="text-gray-500 text-sm">{faq.question || "New Question"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveFaq(index); }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className={`p-2 transition-transform ${editingFaqIndex === index ? 'rotate-180' : ''}`}>
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {editingFaqIndex === index && (
                          <div className="p-4 border-t border-gray-800 bg-gray-900/40 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm text-gray-400">السؤال (عربي)</label>
                                <input
                                  type="text"
                                  value={faq.question_ar}
                                  onChange={(e) => handleUpdateFaq(index, { question_ar: e.target.value })}
                                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-white focus:outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-gray-400">Question (English)</label>
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => handleUpdateFaq(index, { question: e.target.value })}
                                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-white focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm text-gray-400">الإجابة (عربي)</label>
                                <textarea
                                  value={faq.answer_ar}
                                  onChange={(e) => handleUpdateFaq(index, { answer_ar: e.target.value })}
                                  rows={3}
                                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-white focus:outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-gray-400">Answer (English)</label>
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => handleUpdateFaq(index, { answer: e.target.value })}
                                  rows={3}
                                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {faqs.length === 0 && (
                      <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                        <p className="text-gray-500">لا توجد أسئلة مضافة بعد</p>
                        <button
                          onClick={handleAddFaq}
                          className="mt-4 text-white hover:underline text-sm font-medium"
                        >
                          أضف سؤالك الأول
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
                <p className="text-gray-400">إعدادات الموقع العامة</p>
              </div>

              <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-[2rem] p-8">
                <h3 className="text-xl font-bold mb-6">أسعار العملات</h3>
                <p className="text-sm text-gray-400 mb-4">أسعار الصرف مقابل الريال العماني (OMR = 1)</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {currencies.map((curr) => (
                    <div key={curr.code} className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{curr.code}</span>
                        <span className="text-gray-400 text-sm">{curr.nameAr}</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={currencyRates[curr.code]}
                        onChange={(e) => setCurrencyRates({ ...currencyRates, [curr.code]: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpdateCurrency}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  حفظ أسعار العملات
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
