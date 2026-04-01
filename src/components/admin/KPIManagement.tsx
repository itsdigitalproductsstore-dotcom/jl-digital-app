import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Save, RefreshCw, Copy, ExternalLink, Edit2 } from 'lucide-react';
import { KPIMetric, updateKPITarget, updateKPIActual } from '@/app/actions/kpiActions';

interface KPIManagementProps {
  metrics: KPIMetric[];
  onRefresh: () => void;
  webhookApiKey: string | null;
}

const KPICard = ({ metric, onUpdate }: { metric: KPIMetric; onUpdate: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(metric.target_month.toString());
  const [isSaving, setIsSaving] = useState(false);

  const achievementRatio = metric.target_month > 0 
    ? (metric.actual_value / metric.target_month) * 100 
    : 0;
  
  const isAchieved = achievementRatio >= 100;
  const statusColor = isAchieved ? 'text-green-500' : achievementRatio >= 50 ? 'text-yellow-500' : 'text-red-500';

  const handleSave = async () => {
    setIsSaving(true);
    await updateKPITarget(metric.id, parseFloat(tempTarget) || 0);
    setIsSaving(false);
    setIsEditing(false);
    onUpdate();
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{metric.metric_name_ar}</h3>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
             {metric.category === 'social' ? 'SOCIALL' : metric.category === 'website' ? 'WEBSITE' : metric.category === 'email' ? 'EMAIL' : 'SALES'}
          </span>
        </div>
        {isAchieved ? (
          <div className="bg-green-500/10 p-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div className="bg-zinc-800/50 p-1.5 rounded-lg">
            <Target className="w-4 h-4 text-zinc-600" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">الهدف (Target)</label>
            {isEditing ? (
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="bg-black border border-zinc-700 rounded px-2 py-1 text-sm w-full text-white outline-none focus:border-blue-500"
                  autoFocus
                />
                <button onClick={handleSave} disabled={isSaving} className="text-blue-500 hover:text-blue-400">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-black/30 rounded px-2 py-1.5 border border-zinc-800/50">
                <span className="text-lg font-mono text-white">{metric.target_month}</span>
                <button onClick={() => setIsEditing(true)} className="text-zinc-600 hover:text-white transition-colors">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">الفعلي (Actual)</label>
            <div className="bg-black/30 rounded px-2 py-1.5 border border-zinc-800/50 h-[38px] flex items-center">
              <span className="text-lg font-mono text-white">{metric.actual_value}</span>
              <span className="text-[10px] text-zinc-600 mr-auto">{metric.unit === 'currency' ? 'SAR' : metric.unit === 'percentage' ? '%' : ''}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-zinc-500">نسبة الإنجاز</span>
            <span className={statusColor}>{achievementRatio.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isAchieved ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : achievementRatio >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(achievementRatio, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KPIManagement({ metrics, onRefresh, webhookApiKey }: KPIManagementProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const categories = Array.from(new Set(metrics.map(m => m.category)));
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Webhook Info Section */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <ExternalLink className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">إعدادات الأتمتة (Webhook API)</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                هذه الإعدادات تسمح بربط ManyChat, Zapier, و Stripe لتحديث النتائج لحظياً. 
                أرسل طلب POST إلى الرابط أدناه مع إدراج مفتاح الـ API في الـ JSON body.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Webhook URL</label>
                  {copiedUrl && <span className="text-[10px] text-blue-500 animate-pulse">تم النسخ!</span>}
                </div>
                <div className="flex items-center gap-2 bg-black/50 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs group/item">
                  <span className="text-zinc-400 truncate flex-1">{`${origin}/api/webhooks/kpi`}</span>
                  <button onClick={() => copyToClipboard(`${origin}/api/webhooks/kpi`, 'url')} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">API Key (api_key)</label>
                  {copiedKey && <span className="text-[10px] text-blue-500 animate-pulse">تم النسخ!</span>}
                </div>
                <div className="flex items-center gap-2 bg-black/50 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs">
                  <span className="text-zinc-400 truncate flex-1">{webhookApiKey || 'جارِ التحميل...'}</span>
                  <button onClick={() => copyToClipboard(webhookApiKey || '', 'key')} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="space-y-12">
        {categories.map(category => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px bg-zinc-800 flex-1" />
              <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                <div className={`w-2 h-2 rounded-full ${category === 'sales' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
                  {category === 'social' ? 'قسم السوشيال ميديا' : category === 'website' ? 'قسم الموقع الإلكتروني' : category === 'email' ? 'قسم البريد الإلكتروني' : 'قسم المبيعات والأرباح'}
                </h3>
              </div>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.filter(m => m.category === category).map(metric => (
                <KPICard key={metric.id} metric={metric} onUpdate={onRefresh} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
