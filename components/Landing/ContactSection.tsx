"use client";

import { motion } from "framer-motion";

export default function ContactSection() {
    return (
        <section id="contact" className="py-12 md:py-24 bg-[#0a1410] relative overflow-hidden">
            {/* Dark Green Brand Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30">
                <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    {/* Left: Contact Info */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-4 md:space-y-6">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight font-heading">
                                Got questions? <br />
                                <span className="text-[#10b981]">Let's chat</span>
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Whether it's about our AI tools or the curriculum, our team is ready to help you navigate the future of learning.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-white font-bold text-base">General Enquiries</h4>
                            <p className="text-slate-400 text-sm">fredjm40@gmail.com</p>
                            <p className="text-slate-400 text-sm">+254 768094564</p>
                        </div>


                    </div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/5 p-5 sm:p-8 md:p-10 rounded-2xl border border-[#FF8A00]/30 backdrop-blur-3xl"
                    >
                        <form className="space-y-4 md:space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <div className="space-y-2">
                                    <label className="text-slate-300 text-xs font-bold ml-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-slate-300 text-xs font-bold ml-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-300 text-xs font-bold ml-2">Message</label>
                                <textarea
                                    placeholder="Message"
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all resize-none text-sm"
                                />
                            </div>
                            <button className="w-1/2 sm:w-max px-8 ml-auto block bg-[#10b981] text-[#0a1410] py-3 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(16,185,129,0.15)] mt-2">
                                Submit
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
