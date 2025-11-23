"use client";

import { FaTwitter, FaLinkedin, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-6 py-12 md:py-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-3">Learning.ai</h2>
          <p className="leading-relaxed">
            Learn anything, anytime, anywhere.  
            AI-personalized learning for students, schools, and professionals.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Explore</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Features</a></li>
            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Learning Categories */}
        <div>
          <h3 className="text-white font-semibold mb-3">Learning Paths</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition">For Students</a></li>
            <li><a href="#" className="hover:text-white transition">For Schools / NGOs</a></li>
            <li><a href="#" className="hover:text-white transition">Corporate Upskilling</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-white font-semibold mb-3">Connect</h3>
          <ul className="space-y-1">
            <li>Email: <a href="mailto:info@learning.ai" className="hover:text-white transition">info@learning.ai</a></li>
            <li>Phone: <span className="text-gray-300">+254 700 123 456</span></li>
          </ul>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-white transition"><FaTwitter /></a>
            <a href="#" className="hover:text-white transition"><FaLinkedin /></a>
            <a href="#" className="hover:text-white transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-white transition"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Learning.ai — All rights reserved.</p>
        <p className="mt-2 text-gray-600 italic">
          Empowering the next generation through adaptive learning.
        </p>
      </div>
    </footer>
  );
}
