"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mergedFeatures = [
    {
        id: "students",
        title: "For Students",
        description: "Experience a personalized AI tutor that adapts to your unique learning pace across all subjects and grades from Grade 4 to 12. Master any topic through personalized on-demand courses that offer instant explanations, engaging podcasts, and immersive practice modes designed to help you learn anything and turn abstract concepts into tangible mastery."
    },
    {
        id: "teachers",
        title: "For Educators",
        description: "Empower your teaching with an AI Teachers Guide providing structured lesson guides with real-time assistance. Create AI-powered Custom Textbooks, generate specialized Custom Lessons, and build fully AI-powered Assessments or quizzes from your own materials. Connect with fellow educators in our Community to share insights and foster student growth."
    }
];

export default function LearnAtSpeed() {
    return (
        <section className="py-10 md:py-16 bg-[#ffffff] relative overflow-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Rough Texture Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white z-0" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header Area */}
                <div className="text-center mb-12 md:mb-20 space-y-3">
                    <div className="max-w-4xl mx-auto">
                        <motion.h2
                            className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.2]"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                    }
                                }
                            }}
                        >
                            {"Master your curriculum at the ".split(" ").map((word, i) => (
                                <motion.span
                                    key={i}
                                    className="inline-block mr-[0.25em]"
                                    variants={{
                                        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
                                        visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                            <motion.span
                                className="font-serif italic font-normal text-slate-700 inline-block"
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
                                    visible: { opacity: 1, scale: 1, filter: "blur(0px)" }
                                }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                speed of thought
                            </motion.span>
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-slate-400 text-sm md:text-lg font-medium tracking-tight"
                    >
                        Aligned with Kenya Institute of Curriculum Development (KICD) expected learning outcomes
                    </motion.p>
                </div>

                {/* Features Stack - Two Primary Paragraphs with Reduced Gap */}
                <div className="space-y-12 md:space-y-20">
                    {mergedFeatures.map((feature) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center space-y-4"
                        >
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-slate-100 blur-[100px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-slate-100 blur-[100px] rounded-full pointer-events-none opacity-50" />
        </section>
    );
}
