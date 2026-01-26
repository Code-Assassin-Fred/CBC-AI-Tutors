"use client";

import { motion } from "framer-motion";

export default function VisionSection() {
    return (
        <section id="vision" className="pb-24 relative overflow-hidden bg-[#080f0c]">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#00E18A]/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 space-y-32">
                {/* New Unified About + PR Section */}
                <div id="about" className="space-y-32">
                    {/* Header: The Big Vision */}
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-6 py-2 bg-[#00E18A]/10 rounded-full border border-[#00E18A]/20"
                        >
                            <span className="text-[#00E18A] font-black text-xs tracking-[0.3em] uppercase">The Future of CBC</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            Engineering the next <br />
                            <span className="text-[#00E18A]">Evolution</span> of Education.
                        </h2>
                        <p className="text-slate-400 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium">
                            We don't just build tools; we build ecosystems. Our platform bridges the gap between
                            traditional curriculum and the intelligence of the future.
                        </p>
                    </div>

                    {/* Impact Bento Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* 1. Large Feature/About Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-8 bg-[#0c1410] rounded-[48px] p-12 md:p-16 border border-white/5 relative overflow-hidden flex flex-col justify-between group min-h-[600px]"
                        >
                            <div className="relative z-10 space-y-8 max-w-xl">
                                <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                                    Intelligent Core. <br />
                                    <span className="text-slate-500">Human-Centric Design.</span>
                                </h3>
                                <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium">
                                    Our AI engine doesn't replace teachers—it empowers them. By automating the routine,
                                    we unlock time for what matters: mentorship and student growth.
                                </p>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    {["Adaptive Grading", "AI Lesson Prep", "Mastery Tracking"].map((tag) => (
                                        <div key={tag} className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 text-slate-300 text-sm font-bold tracking-tight">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* visual: AI Engine Pulse */}
                            <div className="absolute right-0 bottom-0 w-[50%] h-full hidden lg:block opacity-50 group-hover:opacity-80 transition-opacity">
                                <div className="absolute inset-0 bg-gradient-to-l from-[#00E18A]/10 to-transparent" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-80 h-80 bg-[#00E18A]/20 blur-[100px] rounded-full animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-32 h-32 border-2 border-[#00E18A]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                        <div className="absolute w-24 h-24 border border-[#00E18A]/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                        <div className="w-4 h-4 bg-[#00E18A] rounded-full shadow-[0_0_30px_#00E18A]" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 lg:mt-0 relative z-10">
                                <button className="bg-white text-[#080f0c] px-10 py-5 rounded-2xl font-black text-lg hover:bg-[#00E18A] hover:text-white transition-all transform active:scale-95">
                                    Experience the Platform
                                </button>
                            </div>
                        </motion.div>

                        {/* 2. Side Stat Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-4 bg-[#00E18A] rounded-[48px] p-12 flex flex-col justify-between group overflow-hidden relative"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-[#080f0c] rounded-2xl flex items-center justify-center text-[#00E18A] shadow-2xl">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-black text-[#080f0c] leading-[0.9] tracking-tighter">
                                    Real <br />
                                    Impact.
                                </h3>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <div className="text-6xl font-black text-[#080f0c] tracking-tighter">10k+</div>
                                    <div className="text-[#080f0c]/60 font-bold uppercase tracking-widest text-xs mt-1">Active Minds</div>
                                </div>
                                <div>
                                    <div className="text-6xl font-black text-[#080f0c] tracking-tighter">98%</div>
                                    <div className="text-[#080f0c]/60 font-bold uppercase tracking-widest text-xs mt-1">Success Rate</div>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <svg className="w-48 h-48 text-[#080f0c]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 3.45L19.1 19H4.9L12 5.45z" />
                                </svg>
                            </div>
                        </motion.div>

                        {/* 3. Bottom Ecosystem Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-12 bg-[#0c1410] rounded-[48px] p-12 md:p-20 border border-white/5 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16"
                        >
                            <div className="relative z-10 space-y-8 flex-1">
                                <div className="inline-block px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                                    <span className="text-blue-400 font-bold text-xs tracking-widest uppercase">Ecosystem</span>
                                </div>
                                <h3 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                                    A Complete Pathway <br />
                                    <span className="text-blue-400">for Every Learner.</span>
                                </h3>
                                <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">
                                    From interactive quizzes to deep analytical reports, we provide a unified
                                    journey that scales as your knowledge grows. Simple, intuitive, and effective.
                                </p>
                            </div>

                            <div className="flex-1 w-full flex justify-center lg:justify-end">
                                <div className="relative w-full max-w-lg bg-[#1a221e] rounded-[32px] border border-white/10 p-8 shadow-2xl">
                                    <div className="flex gap-2 mb-8">
                                        <div className="w-3 h-3 rounded-full bg-red-400/30" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/30" />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="h-6 w-2/3 bg-[#00E18A]/20 rounded-full" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-32 bg-white/5 rounded-3xl" />
                                            <div className="h-32 bg-white/5 rounded-3xl" />
                                        </div>
                                        <div className="h-20 w-full bg-white/5 rounded-3xl border border-white/5" />
                                    </div>
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#00E18A] rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
                                        <svg className="w-12 h-12 text-[#080f0c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent opacity-30" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
