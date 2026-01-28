"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PricingSection() {
    const router = useRouter();

    const handleAction = () => {
        router.push("/auth");
    };

    return (
        <section id="pricing" className="py-12 md:py-24 relative overflow-hidden bg-[#020d0a]">
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

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3 md:mb-4"
                    >
                        Simple and Affordable <br />
                        <span className="text-[#10b981] font-newsreader italic font-medium">Pricing Plans</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto"
                    >
                        Start your 7-day free trial today. No Payment required.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-6xl mx-auto">
                    {/* 7-Day Free Trial Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 flex flex-col hover:bg-white/[0.05] transition-all group"
                    >
                        <div className="mb-4 md:mb-6">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Free Trial</span>
                            <div className="flex items-baseline gap-1 mt-2 md:mt-3">
                                <span className="text-3xl sm:text-4xl font-black text-white">7</span>
                                <span className="text-base sm:text-lg text-slate-400 font-medium">Days</span>
                            </div>
                            <p className="text-slate-500 mt-2 md:mt-3 text-xs sm:text-sm leading-relaxed">Perfect for exploring all features without any commitment.</p>
                        </div>

                        <button
                            onClick={handleAction}
                            className="w-full py-3 md:py-3.5 rounded-xl bg-white/10 text-white font-bold text-sm sm:text-base hover:bg-white/20 transition-all mb-5 md:mb-8"
                        >
                            Start Free Trial
                        </button>

                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-3 md:mb-4">What's Included</p>
                            {[
                                "Full Access to ALL Features",
                                "Student & Teacher Tools",
                                "All Grade 4-12 CBC Subjects",
                                "Interactive AI Quizzes",
                                "Personalized AI Feedback"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-slate-300">
                                    <div className="w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Student Plan Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/[0.05] backdrop-blur-2xl border border-[#10b981]/30 rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 flex flex-col relative group"
                    >
                        <div className="mb-4 md:mb-6">
                            <span className="text-white font-bold uppercase tracking-widest text-[10px]">Student Pro</span>
                            <div className="flex items-baseline gap-1 mt-2 md:mt-3">
                                <span className="text-xs sm:text-sm text-slate-400 font-medium self-start mt-1">KES</span>
                                <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter">1,000</span>
                                <span className="text-slate-400 font-medium text-xs sm:text-sm">/mo</span>
                            </div>
                            <p className="text-slate-300 mt-2 md:mt-3 text-xs sm:text-sm leading-relaxed font-medium">Unlimited learning power for ambitious students.</p>
                        </div>

                        <button
                            onClick={handleAction}
                            className="w-full py-3 md:py-4 rounded-xl bg-[#10b981] text-[#020d0a] font-black text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] mb-5 md:mb-8"
                        >
                            Get Student Pro
                        </button>

                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-3 md:mb-4">Everything in Trial, plus:</p>
                            {[
                                "Unlimited AI Explanations",
                                "National Leaderboard Entry",
                                "Multi-Mode (Podcast & Immersive)",
                                "Detailed Performance Analytics",
                                "Voice Discovery (STT/TTS)",
                                "Offline Study Materials"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-white/90">
                                    <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-[#020d0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold">{feature}</span>
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
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 flex flex-col hover:bg-white/[0.05] transition-all group"
                    >
                        <div className="mb-4 md:mb-6">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Teacher Pro</span>
                            <div className="flex items-baseline gap-1 mt-2 md:mt-3">
                                <span className="text-xs sm:text-sm text-slate-400 font-medium self-start mt-1">KES</span>
                                <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">800</span>
                                <span className="text-slate-400 font-medium text-xs sm:text-sm">/mo</span>
                            </div>
                            <p className="text-slate-500 mt-2 md:mt-3 text-xs sm:text-sm leading-relaxed">The complete toolkit for modern teaching and classroom management.</p>
                        </div>

                        <button
                            onClick={handleAction}
                            className="w-full py-3 md:py-3.5 rounded-xl bg-white/10 text-white font-bold text-sm sm:text-base hover:bg-white/20 transition-all mb-5 md:mb-8"
                        >
                            Get Teacher Pro
                        </button>

                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-3 md:mb-4">Teacher Special Tools</p>
                            {[
                                "Bulk AI Lesson Planner",
                                "Custom Textbook Creator",
                                "Automated Quiz Generator",
                                "Student Progress Insights",
                                "CBC Standards Alignment",
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-slate-300">
                                    <div className="w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
