"use client";



export default function Footer() {
  return (
    <footer id="contact" className="bg-black text-gray-400 px-4 md:px-6 py-10 md:py-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-sm">

        {/* Brand Section */}
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-white text-lg font-semibold mb-2 md:mb-3">Curio</h2>
          <p className="leading-relaxed text-xs sm:text-sm">
            Empowering the next generation of CBC learners with AI-driven personalized education.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-white font-semibold mb-2 md:mb-3">Explore</h3>
          <ul className="space-y-1 sm:space-y-2">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#about" className="hover:text-white transition">About</a></li>
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Learning Categories */}
        <div>
          <h3 className="text-white font-semibold mb-2 md:mb-3">For who?</h3>
          <ul className="space-y-1 sm:space-y-2">
            <li><a href="#" className="hover:text-white transition">For Students</a></li>
            <li><a href="#" className="hover:text-white transition">For Teachers</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-white font-semibold mb-2 md:mb-3">Connect</h3>
          <ul className="space-y-2">
            <li>Email: <a href="mailto:fredjm40@gmail.com" className="hover:text-white transition">fredjm40@gmail.com</a></li>
            <li className="space-y-1">
              <p className="text-gray-300 font-medium">Contact Tech Lead:</p>
              <p className="text-gray-400">+254 768094564</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">WhatsApp & Calls</p>
            </li>
          </ul>

        </div>
      </div>

      {/* Divider */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Curio — All rights reserved.</p>
        <p className="mt-2 text-gray-600 italic">
          Building the future of education in Kenya.
        </p>
      </div>
    </footer>
  );
}
