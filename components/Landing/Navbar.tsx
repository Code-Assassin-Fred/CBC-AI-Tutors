"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`${isScrolled
          ? `fixed top-0 bg-black/80 backdrop-blur-md py-4 md:py-5 shadow-lg border-b border-white/10 ${!isVisible ? "-translate-y-full" : "translate-y-0"
          }`
          : "absolute top-0 bg-transparent py-6 border-b border-transparent"
          } left-0 right-0 z-50 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo - Text Only */}
            <Link
              href="/"
              className="text-blue-500 text-2xl md:text-3xl font-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              Curio
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-gray-200 hover:text-blue-400 transition-colors duration-200 text-sm font-medium uppercase tracking-wider py-2
                    after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:transition-all after:duration-300 after:bg-blue-500
                    ${isActive ? "text-blue-400 after:w-full" : "after:w-0 hover:after:w-full"}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 transition-colors hover:text-blue-500"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-all duration-500 md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 px-6">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-2xl font-semibold tracking-wide transition-all duration-300 ${isActive ? "text-blue-500 translate-x-2" : "text-gray-300 hover:text-white"
                  }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/auth"
            onClick={() => setIsMenuOpen(false)}
            className="mt-4 bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
