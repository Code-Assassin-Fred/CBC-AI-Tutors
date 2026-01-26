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
                title: "AI Teachers Guide",
                description: "Access structured lesson guides with real-time AI assistance",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                )
            },
            {
                title: "Custom Textbooks",
                description: "Create AI-powered custom textbooks",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                )
            },
            {
                title: "Custom Lessons",
                description: "Generate specialized AI lesson plans",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                )
            },
            {
                title: "Create Assessments",
                description: "Generate fully AI-powered quizzes & tests or upload your material and generate based on that material",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                )
            },
            {
                title: "Community",
                description: "Connect with fellow educators",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

                    {/* Main Content Area */}
                    <AnimatePresence mode="wait">
                        {activeTab === "students" ? (
                            <motion.div
                                key="students"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-32"
                            >
                                {/* The Composition Container (Students) */}
                                <div className="w-[95%] max-w-7xl mx-auto h-[400px] md:h-[600px] bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] border border-white/20 rounded-[48px] shadow-2xl relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/40 blur-[100px] rounded-full" />
                                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00E18A]/20 blur-[100px] rounded-full" />

                                    <div className="relative w-full h-full max-w-5xl mx-auto">
                                        <motion.div className="absolute -top-12 left-[10%] w-[45%] z-0 rounded-3xl border border-white/40 shadow-xl overflow-hidden opacity-40 blur-[1px]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.4, y: 0 }} transition={{ duration: 1, delay: 0.2 }}><img src="/Empty Classroom.PNG" alt="Classroom" className="w-full h-full object-cover" /></motion.div>
                                        <motion.div className="absolute top-[8%] -left-10 md:-left-20 w-[45%] md:w-[55%] z-10 rounded-2xl md:rounded-[32px] border-[6px] md:border-[10px] border-[#1a221e] shadow-2xl overflow-hidden bg-[#0c1410]" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}><img src="/Natural Chat with AI.PNG" alt="Natural Chat" className="w-full h-auto" /></motion.div>
                                        <motion.div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[65%] md:w-[75%] z-20 rounded-2xl md:rounded-[40px] border-[8px] md:border-[16px] border-[#1a221e] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0c1410]" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}><img src="/Lesson in progress.PNG" alt="Lesson in Progress" className="w-full h-auto" /></motion.div>
                                        <motion.div className="absolute -bottom-20 right-0 md:right-10 w-[35%] md:w-[45%] z-30 rounded-2xl md:rounded-[32px] border-[6px] md:border-[12px] border-[#1a221e] shadow-2xl overflow-hidden bg-[#0c1410]" initial={{ opacity: 0, x: 40, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}><img src="/Podcast.PNG" alt="Podcast" className="w-full h-auto" /></motion.div>
                                        <motion.div className="absolute top-16 right-16 z-40 max-w-xs text-right hidden md:block" initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}><h2 className="text-3xl md:text-4xl font-black text-[#080f0c] leading-[1.1] tracking-tighter uppercase">AI-Powered <br /><span className="text-[#00E18A]">Personalized</span> <br />Tutoring.</h2></motion.div>
                                        <motion.div className="absolute bottom-12 left-12 z-40 max-w-lg hidden md:block" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.7 }}>
                                            <div className="space-y-4">
                                                <p className="text-[#080f0c]/95 font-medium text-base leading-snug">Get instant help with complex topics anytime. Our AI tutor acts as your personal study buddy, explaining concepts clearly. <span className="text-[#080f0c] font-bold underline decoration-[#00E18A] decoration-2 underline-offset-4">Personalized lessons</span> that adapt to your pace.</p>
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-[#080f0c] font-bold text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00E18A]" />Available for any grade and any subject in CBC</p>
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] pl-3.5">Modes: Practice • Podcast • Explanation</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Gamification Section (Students) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                                    <motion.div className="space-y-8 pl-[10px]" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">Gamification at our <span className="text-[#FF4500] font-newsreader italic font-medium">Core.</span></h2>
                                        <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">Earn points, badges, and rewards as you complete lessons and quizzes. Learning has never been this fun!</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 pt-4">
                                            {[{ title: "Daily Streaks", desc: "Keep the momentum going" }, { title: "Interactive Badges", desc: "Show off your progress" }, { title: "Instant XP", desc: "Rewards for every answer and activity" }, { title: "Leaderboards", desc: "Compete with other students countrywide" }].map((item, i) => (
                                                <motion.div key={i} className="pl-4 space-y-0.5" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                                    <h4 className="text-white text-lg font-bold tracking-tight font-jakarta">{item.title}</h4>
                                                    <p className="text-slate-500 text-sm">{item.desc}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                    <div className="relative flex justify-center lg:pr-16">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E18A]/10 blur-[130px] rounded-full pointer-events-none" />
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10"><PhoneMockup /></motion.div>
                                    </div>
                                </div>

                                {/* Quiz & Tracking Cards (Students) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 border-[5px] border-[#FF4500] p-6 rounded-[40px] hover:bg-white/10 transition-all group relative overflow-hidden h-[180px] flex flex-col justify-center">
                                        <div className="relative z-10"><h3 className="text-xl font-bold text-sky-400 mb-2 font-jakarta">Interactive Quizzes</h3><p className="text-slate-400 leading-relaxed text-sm max-w-md">Test your knowledge with dynamic quizzes that adapt to your learning level and provide instant feedback.</p></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E18A]/10 blur-[60px] rounded-full" /><div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full" />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white/5 border-[5px] border-[#FF4500] p-6 rounded-[40px] hover:bg-white/10 transition-all group relative overflow-hidden h-[180px] flex flex-col justify-center">
                                        <div className="relative z-10"><h3 className="text-xl font-bold text-sky-400 mb-2 font-jakarta">Progress Tracking</h3><p className="text-slate-400 leading-relaxed text-sm max-w-md">Visualize your learning journey with detailed analytics. See where you excel and where you need to focus.</p></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" /><div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#00E18A]/10 blur-[50px] rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="teachers"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-20"
                            >
                                {/* Teacher Hero Section (Figma Inspired) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-stretch bg-[#0c1410] rounded-3xl border-2 border-[#FF4500] overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E18A]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                    {/* Full Width Heading Section */}
                                    <div className="lg:col-span-2 p-8 md:p-10 lg:p-12 lg:pb-0 space-y-3 relative z-10">
                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight max-w-3xl">
                                            Crafting simple & intuitive teacher-centric <span className="text-[#00E18A]">CBC AI tools</span>
                                        </h2>
                                        <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                                            We provide tools that align with your teaching style and convert your hard manual work into automated excellence.
                                        </p>
                                    </div>

                                    {/* Features List (Left Column) */}
                                    <div className="space-y-5 relative z-10 p-8 md:p-10 lg:p-12 lg:pt-8 lg:pr-0">
                                        <div className="space-y-6">
                                            {features.teachers.map((f, i) => (
                                                <div key={i} className="flex items-start gap-4">
                                                    <div className="w-6 h-6 rounded-lg bg-[#00E18A]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <svg className="w-4 h-4 text-[#00E18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-lg leading-none mb-1">{f.title}</h4>
                                                        <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mockup Side (Actual Dashboard Screenshot) */}
                                    <div className="relative h-full hidden lg:flex items-end justify-end">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, x: 50, y: 50 }}
                                            whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="relative z-10 w-[115%] rounded-tl-[40px] border-t-[8px] border-l-[8px] border-[#1a221e] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0c1410]"
                                        >
                                            <img
                                                src="/Teacher Dashboard Overview.PNG"
                                                alt="Teacher Dashboard Overview"
                                                className="w-full h-auto"
                                            />
                                            {/* Subtle lighting overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E18A]/5 via-transparent to-transparent pointer-events-none" />
                                        </motion.div>

                                        {/* Background highlight decoration */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00E18A]/5 blur-[120px] rounded-full -z-10" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
