"use client";

import { useEffect, useRef, useState } from "react";

export default function Fields() {
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [dots, setDots] = useState("");
  const headlineRef = useRef<HTMLDivElement>(null);

  // Animate "thinking..." text
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowThinking(true);
          setTimeout(() => {
            setShowThinking(false);
            setShowHeadline(true);
          }, 2000);
        }
      },
      { threshold: 0.3 }
    );
    if (headlineRef.current) obs.observe(headlineRef.current);
    return () => obs.disconnect();
  }, []);

  // Animate dots (...)
  useEffect(() => {
    if (!showThinking) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % 4;
      setDots(["", ".", "..", "..."][i]);
    }, 250);
    return () => clearInterval(id);
  }, [showThinking]);

  return (
    <>
      {/* Intro section — Tailwind REMAINS */}
      <section className="min-h-[50vh] bg-white flex flex-col items-center justify-center px-6 py-20 text-center">
        <div ref={headlineRef} className="max-w-4xl mb-6 min-h-[80px] flex items-center justify-center">
          {showThinking && !showHeadline && (
            <p className="text-3xl md:text-4xl text-gray-700 italic animate-fade-in">
              thinking{dots}
            </p>
          )}
          {showHeadline && (
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 whitespace-nowrap">
                Learn at the speed of <span className="italic text-gray-600">thought</span>
              </h1>
            </div>
          )}
        </div>
        <p className="text-gray-500 mt-2 text-sm md:text-base max-w-2xl">
          AI-personalized courses, gamified lessons, and real-time feedback to elevate your skills.
        </p>
      </section>

      {/* Previously scroll-stacked deck — components + Tailwind REMOVED */}
      <section>
        <div>
          {/* intentionally left empty */}
        </div>
      </section>

      {/* Animation keyframes stay */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}
