"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > 50);

            // Determine scroll direction
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // Scrolling down - hide navbar
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up - show navbar
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { name: "Home", href: "/" },
        { name: "About", href: "#about" },
        { name: "Features", href: "#features" },
        { name: "Contact Us", href: "#contact" },
    ];

    return (
        <nav
            className={`${isScrolled
                ? `fixed top-0 bg-[#050a08]/95 backdrop-blur-md py-4 shadow-lg border-b border-white/5 ${!isVisible ? "-translate-y-full" : "translate-y-0"
                }`
                : "absolute top-0 bg-transparent py-4 border-b border-transparent"
                } left-0 right-0 z-50 transition-all duration-300`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-blue-500 text-3xl font-bold tracking-tight hover:opacity-90 transition-opacity"
                    >
                        Curio
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative text-gray-200 hover:text-[#00E18A] transition-colors duration-200 text-sm font-medium uppercase tracking-wider py-2
                    after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:transition-all after:duration-300 after:bg-blue-500
                    ${isActive ? "text-[#00E18A] after:w-full" : "after:w-0 hover:after:w-full"}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            className="text-white p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pt-6 pb-6 space-y-4 bg-black/95 absolute top-full left-0 right-0 border-b border-white/10 px-6 backdrop-blur-xl shadow-2xl">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`block text-lg font-medium uppercase tracking-wider py-3 border-b border-white/5 last:border-0
                    ${isActive ? "text-[#00E18A]" : "text-gray-300 hover:text-[#00E18A]"}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}
