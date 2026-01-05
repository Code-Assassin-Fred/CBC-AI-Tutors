'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPPopupProps {
    amount: number;
    x?: number;
    y?: number;
    onComplete?: () => void;
}

export default function XPPopup({ amount, x, y, onComplete }: XPPopupProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, 1200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    // Position styles
    const positionStyle = x !== undefined && y !== undefined
        ? { left: x, top: y, position: 'fixed' as const }
        : { left: '50%', top: '40%', position: 'fixed' as const, transform: 'translateX(-50%)' };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -40, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 0.8 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={positionStyle}
                    className="pointer-events-none z-50"
                >
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30">
                        <span className="text-white font-bold text-sm">
                            +{amount}
                        </span>
                        <span className="text-emerald-100 text-xs font-medium">
                            XP
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
