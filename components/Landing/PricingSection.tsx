"use client";

import { motion } from "framer-motion";

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-[#020d0a]">
            {/* High-End Smoky Silk Background */}
            <div className="absolute inset-0 z-0">
                {/* Primary Silky Gradient */}
                <div
                    className="absolute inset-0 opacity-60"
                    style={{
                        background: `linear-gradient(155deg, 
                            #020d0a 0%, 
                            #051c14 35%, 
                            #020d0a 65%, 
                            #082e21 100%)`,
                    }}
                />

                {/* Soft Smoky Highlights */}
                <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-[#10b981]/5 blur-[160px] transform -rotate-12 rounded-[100%]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[60%] bg-[#10b981]/5 blur-[160px] transform -rotate-12 rounded-[100%]" />

                {/* Noise/Texture overlay for that premium feel */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6"
                    >
                        Simple and Affordable <br />
                        <span className="text-[#10b981] font-newsreader italic font-medium">Pricing Plans</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-xl font-medium max-w-2xl mx-auto"
                    >
                        Start your 7-day free trial today. No credit card required.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* 7-Day Free Trial Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-10 flex flex-col hover:bg-white/[0.05] transition-all group"
                    >
                        <div className="mb-8">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Free Trial</span>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-5xl font-black text-white">7</span>
                                <span className="text-xl text-slate-400 font-medium">Days</span>
                            </div>
                            <p className="text-slate-500 mt-4 leading-relaxed">Perfect for exploring all features without any commitment.</p>
                        </div>

                        <button className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all mb-10">
                            Start Free Trial
                        </button>

                        <div className="space-y-4">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-6">What's Included</p>
                            {[
                                "Full AI Tutor access",
                                "All Grade 1-9 subjects",
                                "Interactive Quizzes",
                                "7-day history tracking",
                                "Personalized feedback"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Student Plan Card (Most Popular) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/[0.05] backdrop-blur-2xl border-2 border-[#10b981]/30 rounded-[48px] p-10 flex flex-col relative scale-105 shadow-[0_0_80px_rgba(16,185,129,0.1)] group"
                    >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#10b981] text-[#020d0a] px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <span className="text-white font-bold uppercase tracking-widest text-sm">Student Pro</span>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-xl text-slate-400 font-medium self-start mt-2">KES</span>
                                <span className="text-6xl font-black text-white tracking-tighter">1,000</span>
                                <span className="text-slate-400 font-medium">/mo</span>
                            </div>
                            <p className="text-slate-300 mt-4 leading-relaxed font-medium">Unlimited learning power for ambitious students.</p>
                        </div>

                        <button className="w-full py-5 rounded-2xl bg-[#10b981] text-[#020d0a] font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] mb-10">
                            Get Student Pro
                        </button>

                        <div className="space-y-4">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-6">Everything in Trial, plus:</p>
                            {[
                                "Unlimited AI explanations",
                                "National Leaderboard entry",
                                "Detailed performance analytics",
                                "Offline study materials",
                                "Priority AI training",
                                "Parent Dashboard access"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/90">
                                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-[#020d0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Teacher Plan Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-10 flex flex-col hover:bg-white/[0.05] transition-all group"
                    >
                        <div className="mb-8">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Teacher Hub</span>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-xl text-slate-400 font-medium self-start mt-2">KES</span>
                                <span className="text-5xl font-black text-white tracking-tighter">800</span>
                                <span className="text-slate-400 font-medium">/mo</span>
                            </div>
                            <p className="text-slate-500 mt-4 leading-relaxed">Empower your classes with AI lesson planning.</p>
                        </div>

                        <button className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all mb-10">
                            Get Teacher Hub
                        </button>

                        <div className="space-y-4">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-6">Teacher Special Tools</p>
                            {[
                                "Bulk AI Lesson Planner",
                                "Classroom Management Suite",
                                "Automated Quiz Generator",
                                "Student Progress Insights",
                                "CBC Standards alignment",
                                "Exportable reports"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
