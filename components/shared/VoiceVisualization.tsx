"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizationProps {
    isActive: boolean;
    color?: string;
    barCount?: number;
}

export default function VoiceVisualization({
    isActive,
    color = "bg-sky-500",
    barCount = 5
}: VoiceVisualizationProps) {
    return (
        <div className="flex items-center gap-[2px] h-3">
            {[...Array(barCount)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-[2px] ${color} rounded-full`}
                    animate={isActive ? {
                        height: [4, 12, 6, 10, 4],
                    } : {
                        height: 2,
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
}
