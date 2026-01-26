"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeaturesSection() {
    const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");

    const features = {
        students: [
            {
                title: "AI-Powered Tutoring",
                description: "Get instant help with complex topics anytime. Our AI tutor acts as your personal study buddy, explaining concepts clearly.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                )
            },
            {
                title: "Gamified Learning",
                description: "Earn points, badges, and rewards as you complete lessons and quizzes. Learning has never been this fun!",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                )
            },
            {
                title: "Interactive Quizzes",
                description: "Test your knowledge with dynamic quizzes that adapt to your learning level and provide instant feedback.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            {
                title: "Progress Tracking",
                description: "Visualize your learning journey with detailed analytics. See where you excel and where you need to focus.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                )
            }
        ],
        teachers: [
            {
                title: "Automated Grading",
                description: "Save hours of grading time. Our system automatically grades quizzes and assignments, giving you more time to teach.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                )
            },
            {
                title: "Lesson Planning AI",
                description: "Generate comprehensive lesson plans aligned with the CBC curriculum in seconds using our advanced AI tools.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                )
            },
            {
                title: "Classroom Management",
                description: "Easily manage your classes, track student attendance, and monitor distinct learning paths for every student.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )
            },
            {
                title: "Student Insights",
                description: "Gain deep insights into individual student performance to provide targeted support where it's needed most.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                )
            }
        ]
    };

    return (
        <section id="features" className="pt-16 pb-24 relative overflow-hidden bg-[#080f0c]">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#00E18A]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#00E18A]/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 space-y-32">

                <div>
                    <div className="text-center mb-12">
                        <p className="text-slate-300 text-xl font-medium max-w-2xl mx-auto">
                            Whether you're teaching the next generation or learning for the future,
                            our platform adapts to your specific needs.
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-white/5 p-1.5 rounded-2xl flex items-center relative">
                            {/* Sliding Background */}
                            <motion.div
                                className="absolute bg-[#00E18A] rounded-xl h-[calc(100%-12px)] top-[6px]"
                                initial={false}
                                animate={{
                                    left: activeTab === "students" ? "6px" : "50%",
                                    width: "calc(50% - 6px)",
                                    x: activeTab === "students" ? 0 : 0
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => setActiveTab("students")}
                                className={`relative px-8 py-3 rounded-xl font-semibold text-lg transition-colors z-10 ${activeTab === "students" ? "text-[#080f0c]" : "text-slate-300 hover:text-white"
                                    }`}
                                style={{ width: '160px' }} // Fixed width for alignment
                            >
                                Students
                            </button>
                            <button
                                onClick={() => setActiveTab("teachers")}
                                className={`relative px-8 py-3 rounded-xl font-semibold text-lg transition-colors z-10 ${activeTab === "teachers" ? "text-[#080f0c]" : "text-slate-300 hover:text-white"
                                    }`}
                                style={{ width: '160px' }} // Fixed width for alignment
                            >
                                Teachers
                            </button>
                        </div>
                    </div>

                    {/* The Composition Container */}
                    <div className="w-[95%] max-w-7xl mx-auto h-[400px] md:h-[750px] bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] border border-white/20 rounded-[48px] mb-24 shadow-2xl relative overflow-hidden flex items-center justify-center">
                        {/* Background depth blobs */}
                        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/40 blur-[100px] rounded-full" />
                        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00E18A]/20 blur-[100px] rounded-full" />

                        <div className="relative w-full h-full max-w-5xl mx-auto">
                            {/* Layer 1: Background/Peeking (Empty Classroom) */}
                            <motion.div
                                className="absolute -top-12 left-[10%] w-[45%] z-0 rounded-3xl border border-white/40 shadow-xl overflow-hidden opacity-40 blur-[1px]"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 0.4, y: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            >
                                <img src="/Empty Classroom.PNG" alt="Classroom" className="w-full h-full object-cover" />
                            </motion.div>

                            {/* Layer 2: Side Peeking (Natural Chat with AI) */}
                            <motion.div
                                className="absolute top-[8%] -left-10 md:-left-20 w-[45%] md:w-[55%] z-10 rounded-2xl md:rounded-[32px] border border-white/60 shadow-2xl overflow-hidden"
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <img src="/Natural Chat with AI.PNG" alt="Natural Chat" className="w-full h-full object-cover shadow-inner" />
                            </motion.div>

                            {/* Layer 3: Main/Hero (Lesson in progress) - Lowered slightly to clear top heading */}
                            <motion.div
                                className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[65%] md:w-[75%] z-20 rounded-2xl md:rounded-[40px] border-[6px] md:border-[12px] border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                            >
                                <img src="/Lesson in progress.PNG" alt="Lesson in Progress" className="w-full h-full object-cover" />
                            </motion.div>

                            {/* Layer 4: Front Overlapping (Podcast) - Tucked away */}
                            <motion.div
                                className="absolute -bottom-20 right-0 md:right-10 w-[35%] md:w-[45%] z-30 rounded-2xl md:rounded-[32px] border border-white/80 shadow-2xl overflow-hidden"
                                initial={{ opacity: 0, x: 40, y: 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <img src="/Podcast.PNG" alt="Podcast" className="w-full h-full object-cover" />
                            </motion.div>

                            {/* Floating Text Overlay - Tucked into the empty corner */}
                            <motion.div
                                className="absolute top-16 right-16 z-40 max-w-xs text-right hidden md:block"
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-black text-[#080f0c] leading-[1.1] tracking-tighter uppercase">
                                    AI-Powered <br />
                                    <span className="text-[#00E18A]">Personalized</span> <br />
                                    Tutoring.
                                </h2>
                            </motion.div>

                            {/* Bottom Description Text */}
                            <motion.div
                                className="absolute bottom-12 left-12 z-40 max-w-lg hidden md:block"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                <div className="space-y-4">
                                    <p className="text-[#080f0c]/95 font-medium text-base leading-snug">
                                        Get instant help with complex topics anytime. Our AI tutor acts as your personal study buddy,
                                        explaining concepts clearly. <span className="text-[#080f0c] font-bold underline decoration-[#00E18A] decoration-2 underline-offset-4">Personalized lessons</span> that adapt to your pace.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[#080f0c] font-bold text-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E18A]" />
                                            Available for any grade and any subject in CBC
                                        </p>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] pl-3.5">
                                            Modes: Practice • Podcast • Explanation
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                            >
                                {features[activeTab].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-[#0ea5e9]/30 transition-all duration-300 group hover:-translate-y-2"
                                    >
                                        <h3 className="text-xl font-bold text-[#0ea5e9] mb-3">{feature.title}</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* About Content (The Vision) */}
                <div id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080f0c]/80 via-transparent to-transparent" />

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
