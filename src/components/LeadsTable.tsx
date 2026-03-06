'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

type Lead = {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    phone: string;
    company_name: string;
    status: 'New' | 'Contacted' | 'Qualified';
};

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const supabase = createClient();

    useEffect(() => {
        // Real-time subscription to leads table
        const channel = supabase
            .channel('realtime_leads')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload: any) => {
                console.log('New lead received!', payload);
                const newLead = payload.new as Lead;
                // make sure new leads start as 'New' if status is missing
                if (!newLead.status) newLead.status = 'New';
                setLeads((current) => [newLead, ...current]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload: any) => {
                setLeads((current) => current.map(lead => lead.id === payload.new.id ? payload.new as Lead : lead));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, (payload: any) => {
                setLeads((current) => current.filter(lead => lead.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const updateStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Qualified') => {
        // Optimistic update
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Failed to update status:', error);
            // Revert on error could be implemented here
        }
    };

    const exportCSV = () => {
        if (leads.length === 0) return;

        const headers = ['Date', 'Name', 'Email', 'Phone', 'Company', 'Status'];
        const csvContent = [
            headers.join(','),
            ...leads.map(l => [
                new Date(l.created_at).toLocaleString(),
                `"${l.full_name || ''}"`,
                `"${l.email || ''}"`,
                `"${l.phone || ''}"`,
                `"${l.company_name || ''}"`,
                l.status || 'New'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Qualified': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Contacted': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'; // New
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={exportCSV}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-[1rem] transition-colors flex items-center gap-2 text-sm font-medium shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export CSV
                </button>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/[0.02] border-b border-white/10 text-gray-400 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-5 font-medium">Captured Date</th>
                                <th className="px-6 py-5 font-medium">Full Name</th>
                                <th className="px-6 py-5 font-medium">Email</th>
                                <th className="px-6 py-5 font-medium">Phone</th>
                                <th className="px-6 py-5 font-medium">Company</th>
                                <th className="px-6 py-5 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No leads captured yet. The protocol is waiting.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-gray-400">{new Date(lead.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-6 py-4 font-medium text-white">{lead.full_name}</td>
                                        <td className="px-6 py-4 text-gray-400">{lead.email}</td>
                                        <td className="px-6 py-4 text-gray-400">{lead.phone || '-'}</td>
                                        <td className="px-6 py-4 text-gray-400">{lead.company_name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={lead.status || 'New'}
                                                onChange={(e) => updateStatus(lead.id, e.target.value as 'New' | 'Contacted' | 'Qualified')}
                                                className={`appearance-none bg-transparent border rounded-full px-3 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-white/20 text-xs font-semibold ${getStatusColor(lead.status || 'New')}`}
                                            >
                                                <option value="New" className="bg-[#151515] text-blue-400">New</option>
                                                <option value="Contacted" className="bg-[#151515] text-yellow-400">Contacted</option>
                                                <option value="Qualified" className="bg-[#151515] text-green-400">Qualified</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
