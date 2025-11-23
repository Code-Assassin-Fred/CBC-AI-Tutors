"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = ["/slide1.png", "/slide2.png", "/slide3.png"];

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
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a1410] via-[#0d1912] to-[#080f0c]">
      <Navbar />

      <div className="relative z-10 flex items-center min-h-screen pt-32 pb-20 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center w-full max-w-7xl mx-auto">

          {/* Left: Text Section */}
          <div className="text-left space-y-6 mt-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              AI-Powered Learning{" "}
              <span className="text-[#00E18A]">Beyond</span>{" "}
              <span className="italic font-serif text-slate-300">the Classroom</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
              Master CBC and British curricula with personalized AI lessons.
              From students seeking structured guidance to professionals
              upskilling and teachers creating engaging content — adaptive
              learning for everyone.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="group bg-[#00E18A] text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#00c978] hover:shadow-lg hover:shadow-[#00E18A]/30 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
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

              <button className="border-2 border-slate-600 text-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300">
                View Features
              </button>
            </div>
          </div>

          {/* Right: Smooth Peek Transition Carousel */}
          <div className="hidden lg:flex relative h-[480px] w-full flex-col justify-start items-center overflow-visible">
            <AnimatePresence mode="popLayout">
              {/* Main Slide */}
              <motion.div
                key={`main-${currentIndex}`}
                className="absolute top-0 left-0 right-0 mx-auto w-full h-[340px] rounded-2xl overflow-hidden bg-[#0a1410] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
                initial={{
                  top: 360,
                  height: 120,
                  width: "auto",
                  scale: 0.95,
                  opacity: 0.7,
                }}
                animate={{
                  top: 0,
                  height: 340,
                  width: "100%",
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  top: -50,
                  scale: 0.9,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.43, 0.13, 0.23, 0.96],
                }}
              >
                <img
                  src={slides[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl"
                />
              </motion.div>
            </AnimatePresence>

            {/* Next Slide (peek below) */}
            <motion.div
              key={`peek-${nextIndex}`}
              className="absolute top-[360px] w-auto max-w-full h-[120px] rounded-2xl overflow-hidden bg-[#0a1410] shadow-[0_8px_40px_rgba(0,0,0,0.4)] opacity-70"
              initial={{ y: 20, scale: 0.85, opacity: 0 }}
              animate={{ y: 0, scale: 0.95, opacity: 0.7 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img
                src={slides[nextIndex]}
                alt={`Next slide`}
                className="h-full w-auto object-contain rounded-xl"
              />
            </motion.div>
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
