"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTASection() {
    const router = useRouter();

    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E18A]/20 to-[#080f0c] z-0" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                        Join thousands of students and teachers already transforming their education experience with our AI-powered platform.
                    </p>

                    <button
                        onClick={() => router.push('/auth')}
                        className="bg-[#00E18A] text-slate-900 px-12 py-5 rounded-full font-bold text-lg hover:bg-[#00c978] hover:scale-105 transition-all duration-300 shadow-xl shadow-[#00E18A]/20"
                    >
                        Get Started for Free
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
