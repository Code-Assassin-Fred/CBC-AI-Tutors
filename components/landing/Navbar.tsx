"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setIsVisible(false);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // wait 2 seconds after scrolling stops before showing navbar again
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5 border-b
      transition-all duration-700 ease-in-out
      ${
        isScrolled
          ? "bg-black border-white/10"
          : "bg-transparent border-transparent"
      }
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}
      `}
    >
      {/* Logo */}
      <a href="/" className="flex items-center space-x-2">
        <Image
          src="/logo.jpg"
          alt="Mindhive logo"
          width={28}
          height={28}
          className="rounded-sm"
          priority
        />
        <span className="font-semibold text-lg tracking-wide text-white">
          Mindhive
        </span>
      </a>

      {/* Navigation Links */}
      <div className="flex space-x-10 text-base font-medium">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <a
              key={link.name}
              href={link.href}
              className={`relative text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:transition-all after:duration-300
                ${
                  isActive
                    ? "after:w-full after:bg-orange-400"
                    : "after:w-0 hover:after:w-full after:bg-orange-400"
                }`}
            >
              {link.name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
