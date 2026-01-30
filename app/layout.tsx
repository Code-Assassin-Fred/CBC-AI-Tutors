import type { Metadata } from "next";
import { Outfit, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { GamificationProvider } from "@/lib/context/GamificationContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});


export const metadata: Metadata = {
  title: "Curio - AI Teacher Assistant",
  description: "The intelligent assessment and teaching companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${newsreader.variable} antialiased`}
      >
        <AuthProvider>
          <SidebarProvider>
            <GamificationProvider>
              {children}
            </GamificationProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

