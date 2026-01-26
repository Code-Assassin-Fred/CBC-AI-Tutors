"use client";

import { motion } from "framer-motion";

export default function LearnAtSpeed() {
    return (
        <section className="relative pt-12 pb-24 bg-white overflow-hidden border-y border-slate-200">
            {/* Dot Grid Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
                    backgroundSize: "32px 32px"
                }}
            />

            <div className="container mx-auto px-6 relative z-20">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                            }
                        }}
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#1a1c1e] mb-8 tracking-tight flex flex-wrap justify-center gap-x-[0.3em]">
                            {["Learn", "at", "the", "speed", "of"].map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } }
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                            <motion.span
                                variants={{
                                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
                                }}
                                className="font-serif italic font-medium"
                            >
                                thought.
                            </motion.span>
                        </h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
                        >
                            Our AI engine processes curriculum data in milliseconds, giving you instant answers,
                            personalized feedback, and real-time insights into your learning journey.
                        </motion.p>
                    </motion.div>

                    {/* Dashboard Preview Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mt-16 w-full max-w-5xl px-4 md:px-0"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-200 bg-white p-4 md:p-8">
                            <img
                                src="/Curio Student Dashboard.PNG"
                                alt="Student Dashboard"
                                className="w-full h-auto rounded-xl shadow-sm border border-slate-100"
                            />
                            {/* Browser Bars/Dots (Standard Aesthetic) */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
