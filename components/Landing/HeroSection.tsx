"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Landing/Navbar";

export default function HeroSection() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const slides = [
        "/Curio Student Dashboard.PNG",
        "/Empty Classroom.PNG",
        "/Interactive Quizes.PNG",
        "/Lesson in progress.PNG",
        "/interactive Quizes1.PNG",
        "/Natural Chat with AI.PNG",
        "/Podcast.PNG",
        "/Teacher Dashboard Overview.PNG",
        "/Courses Page.PNG",
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const nextIndex = (currentIndex + 1) % slides.length;

    const handleGetStarted = () => {
        router.push("/auth"); // navigates to your registration/auth page
    };

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-[#050a08]">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none">
                {/* Main Green Beam/Spotlight */}
                <div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#00E18A]/10 blur-[120px] rounded-full mix-blend-screen"
                    style={{ transform: 'rotate(15deg)' }}
                />
                {/* Secondary softer glow */}
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[#00E18A]/5 blur-[80px] rounded-full" />
            </div>
            <Navbar />

            <div className="relative z-10 flex items-center min-h-screen pt-32 pb-10 lg:pt-24 lg:pb-20 px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center w-full max-w-7xl mx-auto">

                    {/* Left: Text Section */}
                    <div className="text-center lg:text-left space-y-4 md:space-y-6 mt-4 lg:mt-0 z-20">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                            AI-Powered Learning{" "}
                            <span className="text-[#00E18A]">for CBC</span>{" "}
                            <span className="italic font-serif text-slate-300">Students & Teachers</span>
                        </h1>

                        <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Transform your CBC learning experience with AI-driven textbook lessons,
                            interactive quizzes, and personalized tutoring. Teachers can effortlessly
                            create custom content while students master the curriculum at their own pace.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-row justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
                            <button
                                onClick={handleGetStarted}
                                className="flex-1 sm:flex-none group bg-[#00E18A] text-slate-900 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#00c978] hover:shadow-lg hover:shadow-[#00E18A]/30 transition-all duration-300"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Get Started
                                    <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </span>
                            </button>

                            <button className="flex-1 sm:flex-none border-2 border-slate-600 text-slate-200 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300">
                                View Features
                            </button>
                        </div>
                    </div>

                    {/* Right: Smooth Peek Transition Carousel */}
                    {/* Mobile: shown (flex), Desktop: flex. Removed 'hidden' */}
                    <div className="relative h-[250px] sm:h-[320px] lg:h-[500px] w-full flex flex-col justify-start items-center overflow-visible mt-2 lg:mt-0">
                        <AnimatePresence mode="popLayout">
                            {/* Main Slide */}
                            <motion.div
                                key={`main-${currentIndex}`}
                                className="absolute top-0 lg:top-[60px] left-0 right-0 mx-auto w-full rounded-[24px] lg:rounded-[32px] overflow-hidden border-[6px] lg:border-[12px] border-[#1a221e] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-[#0c1410]"
                                initial={isMobile ? {
                                    x: "100%",
                                    opacity: 0,
                                    scale: 0.9,
                                } : {
                                    top: 400,
                                    scale: 0.95,
                                    opacity: 0,
                                }}
                                animate={isMobile ? {
                                    x: 0,
                                    opacity: 1,
                                    scale: 1,
                                } : {
                                    top: 60,
                                    scale: 1,
                                    opacity: 1,
                                }}
                                exit={isMobile ? {
                                    x: "-100%",
                                    opacity: 0,
                                    scale: 0.9,
                                } : {
                                    top: 10,
                                    scale: 0.9,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: isMobile ? 0.8 : 1.2,
                                    ease: [0.43, 0.13, 0.23, 0.96],
                                }}
                            >
                                <img
                                    src={slides[currentIndex]}
                                    alt={`Slide ${currentIndex + 1}`}
                                    className="w-full h-auto block"
                                />
                                {/* Subtle inner glow/lighting for depth */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Next Slide (peek below on desktop, side on mobile) */}
                        {!isMobile && (
                            <motion.div
                                key={`peek-${nextIndex}`}
                                className="absolute top-[400px] w-auto max-w-full rounded-2xl overflow-hidden border-[8px] border-[#1a221e] opacity-70 bg-[#0c1410]"
                                initial={{ y: 20, scale: 0.85, opacity: 0 }}
                                animate={{ y: 0, scale: 0.95, opacity: 0.7 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <img
                                    src={slides[nextIndex]}
                                    alt={`Next slide`}
                                    className="w-full h-auto max-h-[120px] object-cover object-top"
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <svg
                    className="w-6 h-6 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
}
