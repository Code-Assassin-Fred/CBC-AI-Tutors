"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneMockup from "./PhoneMockup";

export default function FeaturesSection() {
    const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");

    const features = {
        students: [],
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

                </div>
            </div>
        </section>
    );
}
