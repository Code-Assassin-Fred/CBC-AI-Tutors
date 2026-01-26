"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from "framer-motion";
import React, { useState, useEffect } from "react";
import {
    Wifi,
    Battery,
    Signal,
    Bell,
    Settings
} from "lucide-react";

interface PhoneMockupProps {
    className?: string;
}

export default function PhoneMockup({ className = "" }: PhoneMockupProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Autonomous motion values
    const autoX = useMotionValue(0);
    const autoY = useMotionValue(0);

    const [isInteracting, setIsInteracting] = useState(false);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    const autoXSpring = useSpring(autoX, { stiffness: 50, damping: 15 });
    const autoYSpring = useSpring(autoY, { stiffness: 50, damping: 15 });

    // Combine manual and autonomous movement
    const combinedX = useTransform([mouseXSpring, autoXSpring], ([mX, aX]) => (mX as number) + (aX as number));
    const combinedY = useTransform([mouseYSpring, autoYSpring], ([mY, aY]) => (mY as number) + (aY as number));

    const rotateX = useTransform(combinedY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(combinedX, [-0.5, 0.5], ["-20deg", "20deg"]);

    const [currentTime, setCurrentTime] = useState("2:08 PM");
    const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Autonomous animation loop
    useEffect(() => {
        const controlsX = animate(autoX, [0, 0.15, -0.15, 0.05, -0.05, 0], {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
        });
        const controlsY = animate(autoY, [0, -0.1, 0.1, -0.05, 0.05, 0], {
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
        });

        return () => {
            controlsX.stop();
            controlsY.stop();
        };
    }, [autoX, autoY]);

    // Simulate XP popups every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            setXpPopups(prev => [...prev, { id, x: 100 + Math.random() * 100, y: 300 + Math.random() * 100 }]);

            // Remove popup after animation
            setTimeout(() => {
                setXpPopups(prev => prev.filter(p => p.id !== id));
            }, 2000);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsInteracting(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsInteracting(false);
        x.set(0);
        y.set(0);
    };

    return (
        <div
            className={`[perspective:1200px] py-10 flex items-center justify-center ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
                whileInView={{ rotate: -10, scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-[320px] h-[640px] bg-[#1a1a1a] rounded-[3.5rem] border-[10px] border-[#0a0a0a] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_30px_60px_-30px_rgba(0,0,0,0.9)]"
            >
                {/* Phone Frame Depth */}
                <div className="absolute inset-x-[-2px] inset-y-[-2px] rounded-[3.6rem] border-[3px] border-slate-800/40 pointer-events-none" style={{ transform: "translateZ(-8px)" }} />
                <div className="absolute inset-x-[-5px] inset-y-[-5px] rounded-[3.7rem] border-[4px] border-[#0a0a0a] pointer-events-none" style={{ transform: "translateZ(-15px)" }} />

                {/* Side Buttons */}
                <div className="absolute left-[-13px] top-28 w-[4px] h-10 bg-[#0a0a0a] rounded-l-md shadow-inner" />
                <div className="absolute left-[-13px] top-44 w-[4px] h-14 bg-[#0a0a0a] rounded-l-md shadow-inner" />
                <div className="absolute left-[-13px] top-64 w-[4px] h-14 bg-[#0a0a0a] rounded-l-md shadow-inner" />
                <div className="absolute right-[-13px] top-48 w-[4px] h-24 bg-[#0a0a0a] rounded-r-md shadow-inner" />

                {/* Internal Screen Content */}
                <div className="absolute inset-1.5 bg-[#080f0c] rounded-[2.8rem] overflow-hidden flex flex-col font-sans select-none border border-white/5">

                    {/* Status Bar */}
                    <div className="h-12 flex items-center justify-between px-8 text-white z-50">
                        <span className="text-sm font-bold">{currentTime}</span>
                        <div className="flex items-center gap-1.5">
                            <Signal className="w-3.5 h-3.5 fill-white" />
                            <Wifi className="w-3.5 h-3.5" />
                            <Battery className="w-4 h-4 rotate-0" />
                        </div>
                    </div>

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-[100] flex items-center justify-end px-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500/10 mr-1" />
                        <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                    </div>

                    {/* App Header */}
                    <div className="px-6 py-4 flex items-center justify-end gap-3 text-white">
                        <div className="p-2 rounded-full bg-white/5 border border-white/10 relative">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#080f0c]" />
                        </div>
                        <div className="p-2 rounded-full bg-white/5 border border-white/10">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#3d2b26] flex items-center justify-center text-white/80 font-bold border border-white/20">
                            F
                        </div>
                    </div>

                    {/* Main UI Content Container */}
                    <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">

                        {/* CLASSROOM Title Card */}
                        <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 mb-3 flex justify-between items-center">
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Classroom</span>
                            <button className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] text-white/50 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Max
                            </button>
                        </div>

                        {/* Quiz Card */}
                        <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-0.5">Newton's Laws</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Quiz Mode</span>
                                        <span className="text-white/30 text-[8px] uppercase tracking-tighter">Exit Quiz</span>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] text-white/50 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Min
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-white/40 text-[9px] uppercase font-bold tracking-[0.15em]">Question 4 / 10</span>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-emerald-400 text-[10px] font-bold"
                                >
                                    +2 XP
                                </motion.span>
                            </div>

                            {/* Progress Bars */}
                            <div className="flex gap-1 mb-4">
                                {[1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map((active, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full ${active ? (i === 3 ? 'bg-sky-500' : 'bg-emerald-500') : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>

                            <div className="mb-4">
                                <span className="text-sky-400 text-[9px] font-black uppercase tracking-widest mb-1 block">Medium</span>
                                <h3 className="text-white text-xs font-medium leading-relaxed">
                                    A 2 kg textbook is pushed across a table with a force of 10 N. If the frictional force is 4 N, what is the acceleration of the textbook?
                                </h3>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-4">
                                <div className="group bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center transition-all">
                                    <span className="text-white/80 text-[11px] font-medium">A. 2 m/s²</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 transition-all relative">
                                    <span className="text-white/80 text-[11px] font-medium">B. 3 m/s²</span>
                                    {/* Correct mark icon simulated */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button className="mt-auto w-full bg-sky-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-transform relative z-10">
                                Next Question →
                            </button>

                            {/* XP Popups Layer */}
                            <AnimatePresence>
                                {xpPopups.map((popup) => (
                                    <motion.div
                                        key={popup.id}
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, y: -60, scale: 1.2 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        style={{ left: popup.x, top: popup.y - 40 }}
                                        className="absolute z-50 pointer-events-none"
                                    >
                                        <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold shadow-xl flex items-center gap-1">
                                            <span className="text-xs">✨</span>
                                            <span className="text-[10px]">+2 XP</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Ground Shadow */}
                <div
                    className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[140%] h-32 bg-black/60 blur-[60px] rounded-full pointer-events-none"
                    style={{ transform: "translateZ(-50px) rotateX(90deg)" }}
                />
            </motion.div>
        </div>
    );
}
