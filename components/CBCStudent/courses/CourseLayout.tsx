"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CourseLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function CourseLayout({ sidebar, content }: CourseLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0a0f14] to-[#0b1113] rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-gradient-to-b from-[#0b1113] to-[#0a0f14] flex-col">
        <ScrollArea className="flex-1">{sidebar}</ScrollArea>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
        {content}
      </main>
    </div>
  );
}
