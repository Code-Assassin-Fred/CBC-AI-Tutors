/**
 * Enhanced TextbookRenderer
 * 
 * Renders textbook content with support for:
 * - Structured sections (activities, safety notes, tips)
 * - Image placeholders with AI descriptions
 * - Table of Contents navigation
 * - Enhanced styling for various content types
 */

"use client";

import React, { useMemo } from "react";
import { ImageMetadata, TextbookSection } from "@/types/textbook";

// ============================================
// TYPES
// ============================================

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface Props {
  content: string;
  sections?: TextbookSection[];
  images?: ImageMetadata[];
  showImageDescriptions?: boolean;  // Admin mode to show AI descriptions
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TextbookRenderer({
  content,
  sections,
  images = [],
  showImageDescriptions = false
}: Props) {
  const { formattedHtml, toc } = useMemo(() => {
    let html = content?.trim();
    if (!html) {
      return {
        formattedHtml: "",
        toc: [] as TocItem[],
      };
    }

    // Remove markdown artifacts
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

    const container = document.createElement("div");
    container.innerHTML = html;

    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3, h4")
    ) as HTMLHeadingElement[];

    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    const tocItems: TocItem[] = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.charAt(1), 10);
      const text = h.textContent?.trim() || "";

      // H1/H2 → Substrand Card
      if (level === 1 || level === 2) {
        h2Count += 1;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        const card = document.createElement("div");
        card.className = "substrand-card mb-12 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl overflow-hidden";
        card.id = id;

        const header = document.createElement("div");
        header.className = "bg-gradient-to-r from-[#2a2a45] to-[#1a1a35] border-b border-white/10 px-8 py-6 flex items-center gap-5";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c3aed]/40 text-[#c4b5fd] text-2xl font-bold shadow-lg";
        badge.textContent = `${h2Count}`;

        const title = document.createElement("h2");
        title.className = "text-3xl font-bold text-white m-0";
        title.textContent = text;

        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        const body = document.createElement("div");
        body.className = "p-8 space-y-6";
        card.appendChild(body);

        // Move everything until next heading
        let sibling = h.nextElementSibling;
        h.replaceWith(card);
        while (sibling && !headings.includes(sibling as any)) {
          const next = sibling.nextElementSibling;
          body.appendChild(sibling);
          sibling = next;
        }

        tocItems.push({ id, title: text, level: 2 });
        return;
      }

      // H3 → Section heading
      if (level === 3) {
        h3Count += 1;
        h4Count = 0;

        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-2xl font-bold text-sky-300 mt-10 mb-4 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span class="text-sky-500/70">${h2Count}.${h3Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4 → Sub-section heading
      if (level === 4) {
        h4Count += 1;

        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-xl font-semibold text-teal-300 mt-8 mb-3 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span class="text-teal-500/70">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // ========================================
    // ENHANCED SECTION STYLING
    // ========================================

    // Activity sections
    container.querySelectorAll("section.activity, .activity-box").forEach((section) => {
      section.className = "activity-box my-8 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 overflow-hidden p-6";

      // Style activity headings
      const heading = section.querySelector("h3, h4");
      if (heading) {
        heading.className = "text-xl font-bold text-amber-300 flex items-center gap-3 mb-4";
        heading.innerHTML = `<span class="text-2xl">🔬</span> ${heading.innerHTML}`;
      }
    });

    // Safety precautions
    container.querySelectorAll("section.safety-precautions, .safety-precautions").forEach((section) => {
      section.className = "safety-box my-6 p-5 rounded-xl bg-red-900/30 border border-red-500/30";

      const heading = section.querySelector("h3, h4, strong");
      if (heading) {
        heading.className = "text-lg font-bold text-red-400 flex items-center gap-2 mb-3";
        if (!heading.innerHTML.includes("⚠️")) {
          heading.innerHTML = `<span>⚠️</span> ${heading.innerHTML}`;
        }
      }
    });

    // Note boxes
    container.querySelectorAll(".note-box, section.note").forEach((section) => {
      section.className = "note-box my-6 p-5 rounded-xl bg-cyan-900/30 border-l-4 border-cyan-500 backdrop-blur-sm";
    });

    // Tip boxes
    container.querySelectorAll(".tip-box, section.tip").forEach((section) => {
      section.className = "tip-box my-6 p-5 rounded-xl bg-emerald-900/30 border-l-4 border-emerald-500 backdrop-blur-sm";
    });

    // Warning boxes
    container.querySelectorAll(".warning-box, section.warning").forEach((section) => {
      section.className = "warning-box my-6 p-5 rounded-xl bg-red-900/30 border-l-4 border-red-500 backdrop-blur-sm";
    });

    // Example boxes
    container.querySelectorAll(".example-box, section.examples").forEach((section) => {
      section.className = "example-box my-6 p-5 rounded-xl bg-blue-900/30 border border-blue-500/30";
    });

    // Learning outcomes
    container.querySelectorAll("section.learning-outcomes").forEach((section) => {
      section.className = "learning-outcomes my-6 p-5 rounded-xl bg-purple-900/30 border border-purple-500/30";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-lg font-bold text-purple-400 flex items-center gap-2 mb-3";
        heading.innerHTML = `<span>🎯</span> ${heading.innerHTML}`;
      }
    });

    // Key concepts
    container.querySelectorAll("section.key-concepts").forEach((section) => {
      section.className = "key-concepts my-6 p-5 rounded-xl bg-indigo-900/30 border border-indigo-500/30";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-lg font-bold text-indigo-400 flex items-center gap-2 mb-3";
        heading.innerHTML = `<span>💡</span> ${heading.innerHTML}`;
      }
    });

    // ========================================
    // IMAGE HANDLING
    // ========================================

    // Style image figures
    container.querySelectorAll("figure.image-figure, figure").forEach((figure) => {
      figure.className = "image-figure my-8 text-center";
    });

    // Style images
    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-xl mx-auto block max-w-full h-auto shadow-lg border border-white/10";
    });

    // Style image placeholders
    container.querySelectorAll(".image-placeholder").forEach((placeholder) => {
      placeholder.className = "image-placeholder bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-dashed border-purple-500/40 rounded-xl p-8 text-center";
    });

    // Style figcaptions
    container.querySelectorAll("figcaption").forEach((cap) => {
      cap.className = "mt-4 text-sm text-white/60 italic";
    });

    // ========================================
    // GENERAL STYLING
    // ========================================

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "overflow-x-auto my-8 rounded-xl border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse";
      table.querySelector("thead")?.classList.add("bg-white/10");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-5", "py-4", "font-bold", "text-white", "border-b", "border-white/10")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-5", "py-4", "text-white/80", "border-b", "border-white/5")
      );
    });

    // Paragraphs
    container.querySelectorAll("p").forEach((p) => {
      if (!p.closest(".activity-box") && !p.closest(".note-box") && !p.closest(".tip-box")) {
        p.classList.add("my-4", "leading-relaxed", "text-white/90");
      }
    });

    // Lists
    container.querySelectorAll("ul, ol").forEach((list) => {
      list.classList.add(
        "my-4",
        "space-y-2",
        "text-white/90",
        list.tagName === "UL" ? "list-disc" : "list-decimal",
        "list-inside"
      );
    });

    // Ordered lists in procedures - special styling
    container.querySelectorAll(".activity-box ol").forEach((list) => {
      list.className = "space-y-3 list-none pl-0";
      list.querySelectorAll("li").forEach((li, i) => {
        li.className = "flex items-start gap-3 text-white/80";
        const number = document.createElement("span");
        number.className = "flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 text-sm font-bold flex items-center justify-center";
        number.textContent = `${i + 1}`;
        li.insertBefore(number, li.firstChild);
      });
    });

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [content]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="text-white flex gap-10">
      {/* Table of Contents Sidebar */}
      {toc.length > 0 && (
        <aside className="sticky top-6 h-fit w-64 shrink-0 p-6 rounded-2xl bg-[#111] border border-white/10 hidden lg:block">
          <div className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">
            Table of Contents
          </div>

          <nav className="space-y-2 max-h-[60vh] overflow-y-auto">
            {toc.map((item, index) => {
              const padding =
                item.level === 2 ? "pl-0" : item.level === 3 ? "pl-4" : "pl-8";

              return (
                <div key={item.id} className={padding}>
                  <a
                    href={`#${item.id}`}
                    className="block py-1.5 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item.level === 2 && (
                      <span className="text-[#c4b5fd] font-semibold mr-2">
                        {toc.filter((t, i) => t.level === 2 && i <= index).length}.
                      </span>
                    )}
                    {item.title}
                  </a>
                </div>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />

        {/* Image descriptions panel (admin only) */}
        {showImageDescriptions && images.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl bg-[#111] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🤖</span> AI Image Descriptions ({images.length})
            </h3>
            <div className="space-y-4">
              {images.map((img, i) => (
                <div key={img.id} className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-300 text-xs rounded">
                      {img.type}
                    </span>
                    <span className="text-white/60 text-sm">{img.caption}</span>
                  </div>
                  <p className="text-white/70 text-sm">{img.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
