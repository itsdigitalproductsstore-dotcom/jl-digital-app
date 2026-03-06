"use client";

import { useActionState } from 'react';
import { submitLeadAction, type LeadFormState } from '@/app/actions/submitLead';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';

const initialState: LeadFormState = { status: 'idle' };

export default function LeadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [state, formAction, isPending] = useActionState(submitLeadAction, initialState);

    const isSuccess = state.status === 'success';
    const isError = state.status === 'error';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 rounded-[2rem] w-full max-w-xl relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                    >
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-colors p-2"
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Secure Your Session</h2>
                        <p className="text-gray-400 mb-8 sm:mb-10 text-lg">Enter your details for a digital precision audit.</p>

                        {isSuccess ? (
                            <div className="text-green-400 font-medium py-16 text-center text-xl">
                                Protocol Initiated.<br />
                                <span className="text-gray-400 text-sm mt-2 block">We will reach out shortly.</span>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-5 relative z-10">
                                <input
                                    name="full_name"
                                    placeholder="Full Name"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    autoComplete="name"
                                    className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 sm:p-5 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                                />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Professional Email"
                                    required
                                    maxLength={254}
                                    autoComplete="email"
                                    className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 sm:p-5 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                                />
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <input
                                        name="phone"
                                        type="tel"
                                        placeholder="Phone"
                                        maxLength={30}
                                        autoComplete="tel"
                                        className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 sm:p-5 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                                    />
                                    <input
                                        name="company_name"
                                        placeholder="Company"
                                        maxLength={150}
                                        autoComplete="organization"
                                        className="w-full bg-[#151515] border border-white/5 rounded-[1rem] p-4 sm:p-5 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {isError && (
                                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                        {state.message}
                                    </p>
                                )}

                                <MagneticButton
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-white text-black font-bold text-lg py-5 mt-6 hover:bg-gray-200"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isPending ? "Processing Protocol..." : "Deploy Strategy"}
                                        {!isPending && <span className="text-xl">→</span>}
                                    </span>
                                </MagneticButton>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
