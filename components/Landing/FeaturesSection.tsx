"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneMockup from "./PhoneMockup";

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

                    {/* Gamification/Mobile Split Section */}
                    <div className="mt-32 mb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        {/* Left Side: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8 pl-[10px]"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                                Gamification at our <span className="text-[#FF4500] font-newsreader italic font-medium">Core.</span>
                            </h2>

                            <div className="space-y-6">
                                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                                    Earn points, badges, and rewards as you complete lessons and quizzes.
                                    Learning has never been this fun!
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 pt-4">
                                {[
                                    { title: "Daily Streaks", desc: "Keep the momentum going" },
                                    { title: "Interactive Badges", desc: "Show off your progress" },
                                    { title: "Instant XP", desc: "Rewards for every answer and activity" },
                                    { title: "Leaderboards", desc: "Compete with other students countrywide" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="pl-4 space-y-0.5"
                                    >
                                        <h4 className="text-white text-lg font-bold tracking-tight font-jakarta">{item.title}</h4>
                                        <p className="text-slate-500 text-sm">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Side: Phone Mockup */}
                        <div className="relative flex justify-center lg:pr-16">
                            {/* Decorative background glow for the phone */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E18A]/10 blur-[130px] rounded-full pointer-events-none" />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10"
                            >
                                <PhoneMockup />
                            </motion.div>
                        </div>
                    </div>

                    {/* Dedicated Feature Cards Section */}
                    <div className="mt-12 mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 border-[5px] border-[#FF4500] p-6 rounded-[40px] hover:bg-white/10 transition-all group relative overflow-hidden h-[180px] flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-sky-400 mb-2 font-jakarta">Interactive Quizzes</h3>
                                <p className="text-slate-400 leading-relaxed text-sm max-w-md">
                                    Test your knowledge with dynamic quizzes that adapt to your learning level and provide instant feedback.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E18A]/10 blur-[60px] rounded-full" />
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border-[5px] border-[#FF4500] p-6 rounded-[40px] hover:bg-white/10 transition-all group relative overflow-hidden h-[180px] flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-sky-400 mb-2 font-jakarta">Progress Tracking</h3>
                                <p className="text-slate-400 leading-relaxed text-sm max-w-md">
                                    Visualize your learning journey with detailed analytics. See where you excel and where you need to focus.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#00E18A]/10 blur-[50px] rounded-full" />
                        </motion.div>
                    </div>

                    {/* New Highlight Cards Section */}
                    <div className="mt-48 mb-48 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Card: Revamp */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-4 bg-[#0c1410] rounded-[40px] p-10 border border-white/5 relative overflow-hidden h-[600px] flex flex-col group"
                        >
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-3xl font-bold text-white leading-tight tracking-tight">
                                    Revamp to a <br />
                                    brand new <br />
                                    learning journey!
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                    Traditional methods? — We re-design <br />
                                    and build your path with AI
                                </p>
                            </div>

                            {/* Visual Asset Container */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00E18A]/5 via-transparent to-transparent opacity-50" />
                            <div className="mt-auto relative h-[250px] -mx-10 -mb-10 group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[90%] h-full bg-[#1a221e] rounded-t-3xl border-t border-x border-white/10 shadow-2xl overflow-hidden p-4">
                                    <div className="space-y-4 opacity-40">
                                        <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                                        <div className="h-20 w-full bg-white/5 rounded-2xl" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-22 bg-white/5 rounded-2xl" />
                                            <div className="h-22 bg-white/5 rounded-2xl" />
                                        </div>
                                    </div>
                                    {/* Floating AI Bubble */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-16 h-16 bg-[#00E18A] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,225,138,0.4)] rotate-12">
                                            <svg className="w-8 h-8 text-[#080f0c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Card: Built with AI */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-8 bg-[#0c1410] rounded-[40px] p-12 border border-white/5 relative overflow-hidden h-[600px] flex flex-col group"
                        >
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-5xl font-bold text-white leading-tight tracking-tight">
                                    Study Ecosystems built with AI
                                </h3>
                                <p className="text-slate-400 text-xl leading-relaxed max-w-lg font-medium">
                                    Powerful learning tools that scale as your knowledge grows — all powered by our intelligent core.
                                </p>
                                <button className="bg-white text-[#080f0c] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-3 w-fit">
                                    Start Learning
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E18A]/5 blur-[120px] rounded-full" />

                            {/* Complex Visual Mockup */}
                            <div className="mt-auto relative h-[300px] -mx-12 -mb-12 hidden md:flex items-center justify-around pointer-events-none px-12 pb-12">
                                <div className="relative w-full max-w-4xl mx-auto flex items-end justify-between gap-6">
                                    {/* Knowledge Base */}
                                    <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                        <div className="w-[180px] bg-[#1a221e] rounded-2xl border border-white/10 p-5 shadow-2xl">
                                            <div className="space-y-3">
                                                <div className="h-2 w-1/2 bg-[#00E18A]/40 rounded-full" />
                                                <div className="space-y-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="h-1.5 w-full bg-white/5 rounded-full" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Knowledge Base</span>
                                    </div>

                                    {/* Connectors */}
                                    <div className="flex-1 border-b-2 border-dashed border-[#00E18A]/20 mb-10 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1a221e] border border-white/10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-[#00E18A] animate-pulse" />
                                        </div>
                                    </div>

                                    {/* AI Framework */}
                                    <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                        <div className="w-[180px] bg-[#1a221e] rounded-2xl border border-white/10 p-5 shadow-2xl">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                                                </div>
                                                <div className="h-10 w-full bg-[#00E18A]/5 rounded-lg border border-[#00E18A]/10" />
                                            </div>
                                        </div>
                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">AI Engine</span>
                                    </div>

                                    {/* Connectors */}
                                    <div className="flex-1 border-b-2 border-dashed border-[#00E18A]/20 mb-10" />

                                    {/* Interface */}
                                    <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                        <div className="w-[220px] h-[160px] bg-[#1a221e] rounded-2xl border-2 border-white/10 p-4 shadow-2xl relative overflow-hidden">
                                            <div className="flex gap-2 mb-3">
                                                <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                                                <div className="w-2 h-2 rounded-full bg-green-400/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-16 w-full bg-white/5 rounded-lg border border-white/5" />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="h-12 bg-white/5 rounded-lg" />
                                                    <div className="h-12 bg-white/5 rounded-lg" />
                                                    <div className="h-12 bg-white/5 rounded-lg" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Student View</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
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
