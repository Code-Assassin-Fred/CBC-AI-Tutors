"use client";

import { motion } from "framer-motion";

const reviews = [
    {
        name: "Madam Jane W.",
        role: "CBC Grade 4 Teacher",
        content: "Saving hours on lesson planning every single week. Finally, an AI that truly understands the Kenyan CBC curriculum.",
        avatar: "J"
    },
    {
        name: "Mr. Omondi",
        role: "Parent",
        content: "The interactive quizzes have made my daughter actually excited about homework! It's amazing to see her engagement grow.",
        avatar: "O"
    },
    {
        name: "Teacher Sarah",
        role: "Primary School Educator",
        content: "Grading used to take up my whole evening. Now it's a breeze, and I have more energy for one-on-one mentorship.",
        avatar: "S"
    },
    {
        name: "David K.",
        role: "Parent of Two",
        content: "A total game-changer for digital learning at home. The transparent progress tracking gives me so much peace of mind.",
        avatar: "D"
    },
    {
        name: "Mr. Kiprotich",
        role: "Curriculum Advisor",
        content: "Comprehensive, accurate, and incredibly easy to use. This is the bridge between technology and traditional education.",
        avatar: "K"
    }
];

// Duplicate for infinite loop effect
const duplicatedReviews = [...reviews, ...reviews];

export default function ReviewsSection() {
    return (
        <section id="reviews" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter"
                >
                    Loved by <span className="text-[#10b981]">Teachers</span> & Parents.
                </motion.h2>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex whitespace-nowrap gap-8"
                    animate={{ x: [0, -1920] }} // Adjust based on total width
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {duplicatedReviews.map((review, i) => (
                        <div
                            key={i}
                            className="inline-block w-[350px] md:w-[450px] bg-white border-2 border-[#10b981] rounded-[32px] p-8 md:p-10 whitespace-normal flex-shrink-0"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold">
                                    {review.avatar}
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-bold leading-none">{review.name}</h4>
                                    <p className="text-slate-500 text-xs mt-1 font-medium">{review.role}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed italic">
                                "{review.content}"
                            </p>
                            <div className="mt-6 flex text-[#10b981]">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient Fades for Smooth Transition edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
            </div>
        </section>
    );
}
