"use client";

import { motion } from "framer-motion";

export default function VisionSection() {
    return (
        <section id="vision" className="py-20 relative overflow-hidden bg-[#080f0c]">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 space-y-24">
                {/* New Unified About + PR Section */}
                <div id="about" className="space-y-20">
                    {/* Header: The Big Vision */}
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                            Engineering the next generation <br />
                            of <span className="text-[#FF8A00]">Thinkers</span> and <span className="text-[#FF8A00]">Builders.</span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                            We don't just build tools; we build ecosystems. Our platform bridges the gap between
                            traditional curriculum and the intelligence of the future.
                        </p>
                    </div>

                    {/* Impact Bento Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 1. Large Feature/About Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-8 bg-[#0c1410] rounded-[32px] p-10 md:p-12 border border-white/5 relative overflow-hidden flex flex-col justify-between group min-h-[450px]"
                        >
                            <div className="relative z-10 space-y-6 max-w-lg">
                                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                                    Intelligent Core. <br />
                                    <span className="text-slate-500">Human-Centric Design.</span>
                                </h3>
                                <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium">
                                    Our AI engine doesn't replace teachers—it empowers them. By automating the routine,
                                    we unlock time for what matters: mentorship and student growth.
                                </p>


                            </div>

                            {/* visual: AI Engine Pulse */}
                            <div className="absolute right-0 bottom-0 w-[45%] h-full hidden lg:block opacity-40 group-hover:opacity-60 transition-opacity">
                                <div className="absolute inset-0 bg-gradient-to-l from-[#10b981]/10 to-transparent" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-64 h-64 bg-[#10b981]/20 blur-[80px] rounded-full animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 border-2 border-[#10b981]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                        <div className="absolute w-16 h-16 border border-[#10b981]/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                        <div className="w-3 h-3 bg-[#10b981] rounded-full shadow-[0_0_20px_#10b981]" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 lg:mt-0 relative z-10">
                                <button className="bg-white text-[#080f0c] px-8 py-4 rounded-xl font-black text-base hover:bg-[#10b981] hover:text-white transition-all transform active:scale-95">
                                    Experience the Platform
                                </button>
                            </div>
                        </motion.div>

                        {/* 2. Side Stat Card (Impact Card with Smoky Silk Background) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-4 bg-[#020d0a] rounded-[32px] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl border border-white/5"
                        >
                            {/* Silky Background Overlay matching Pricing Section */}
                            <div className="absolute inset-0 z-0">
                                <div
                                    className="absolute inset-0 opacity-80"
                                    style={{
                                        background: `linear-gradient(155deg, 
                                            #020d0a 0%, 
                                            #051c14 35%, 
                                            #020d0a 65%, 
                                            #082e21 100%)`,
                                    }}
                                />
                                <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                />
                                <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-[#10b981]/10 blur-[60px] transform -rotate-12 rounded-[100%]" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                {/* <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#10b981] shadow-2xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div> */}
                                <h3 className="text-3xl font-black text-white leading-[0.9] tracking-tighter">
                                    Real <br />
                                    Impact.
                                </h3>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <div className="text-5xl font-black text-[#10b981] tracking-tighter">10k+</div>
                                    <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Active Minds</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-black text-[#10b981] tracking-tighter">98%</div>
                                    <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Success Rate</div>
                                </div>
                            </div>

                            {/* Triangle Graphic watermark */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                                <svg className="w-40 h-40 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeWidth="1.5" d="M12 2L1 21h22L12 2zm0 3.45L19.1 19H4.9L12 5.45z" />
                                </svg>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
