"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section id="about" className="py-24 relative overflow-hidden bg-[#0d1912]">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Image/Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#00E18A] blur-[80px] opacity-20 rounded-full" />
                        <div className="relative rounded-3xl overflow-hidden border-[8px] border-white/5 shadow-2xl">
                            <img
                                src="/Natural Chat with AI.PNG"
                                alt="AI Learning Interface"
                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1912]/80 via-transparent to-transparent" />

                            {/* Floating Stats Card */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                                <div className="flex justify-between items-center text-white">
                                    <div>
                                        <p className="text-sm text-slate-300">Active Learners</p>
                                        <h4 className="text-2xl font-bold">10,000+</h4>
                                    </div>
                                    <div className="h-10 w-[1px] bg-white/20" />
                                    <div>
                                        <p className="text-sm text-slate-300">Satisfaction</p>
                                        <h4 className="text-2xl font-bold">98%</h4>
                                    </div>
                                    <div className="h-10 w-[1px] bg-white/20" />
                                    <div className="text-[#00E18A]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-block px-4 py-2 bg-[#00E18A]/10 rounded-full border border-[#00E18A]/20">
                            <span className="text-[#00E18A] font-semibold text-sm tracking-wide uppercase">Our Vision</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Revolutionizing Education with <span className="text-[#00E18A]">Intelligent</span> Tools.
                        </h2>

                        <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                            <p>
                                In the rapidly evolving landscape of the Competency-Based Curriculum (CBC),
                                staying ahead requires more than just textbooks. It requires a dynamic,
                                interactive, and personalized approach to learning.
                            </p>
                            <p>
                                We are bridging the gap between traditional education and the digital future.
                                By harnessing the power of Artificial Intelligence, we empower teachers to
                                deliver world-class instruction and enable students to unlock their full potential.
                            </p>
                        </div>

                        <ul className="space-y-4 pt-4">
                            {[
                                "Personalized learning paths for every student",
                                "Real-time analytics for actionable insights",
                                "Seamless integration with CBC standards"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-slate-200">
                                    <span className="w-6 h-6 rounded-full bg-[#00E18A] flex items-center justify-center mr-3 text-black">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
