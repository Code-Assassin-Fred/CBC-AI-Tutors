"use client";

import { motion } from "framer-motion";

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: "Sarah M.",
            role: "CBC Teacher",
            content: "This platform has completely changed how I plan my lessons. The AI suggestions are spot on and save me hours of work every week.",
        },
        {
            name: "David K.",
            role: "Parent",
            content: "My daughter loves the quizzes! She's more engaged with her homework than ever before. It's amazing to see her progress.",
        },
        {
            name: "James O.",
            role: "School Administrator",
            content: "The analytics dashboard gives us exactly what we need to track performance across different grades. Highly recommended.",
        }
    ];

    return (
        <section className="py-24 bg-[#0a1410] relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Loved by <span className="text-[#00E18A]">Educators</span> & Families
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-[#080f0c] p-8 rounded-3xl border border-white/5 relative group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-20 text-[#00E18A] group-hover:opacity-100 transition-opacity">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                                </svg>
                            </div>

                            <p className="text-slate-300 text-lg mb-6 leading-relaxed italic relative z-10">
                                "{t.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#00E18A] rounded-full flex items-center justify-center text-[#080f0c] font-bold text-xl">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{t.name}</h4>
                                    <p className="text-[#00E18A] text-sm">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
