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
        <section id="features" className="py-24 relative overflow-hidden bg-[#080f0c]">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00E18A]/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#00E18A]/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Tailored for <span className="text-[#00E18A]">Excellence</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
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
                                    className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-[#00E18A]/30 transition-all duration-300 group hover:-translate-y-2"
                                >
                                    <div className="w-14 h-14 bg-[#00E18A]/10 rounded-2xl flex items-center justify-center text-[#00E18A] mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
