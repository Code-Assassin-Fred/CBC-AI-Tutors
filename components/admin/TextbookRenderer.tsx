/**
 * Enhanced TextbookRenderer - Professional Style
 * 
 * Clean, professional textbook rendering:
 * - No gradient backgrounds
 * - Minimal colored containers
 * - Text color changes for hierarchy
 * - Traditional textbook appearance
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
  showImageDescriptions?: boolean;
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

    // Remove markdown artifacts and code block wrappers
    html = html
      // Remove markdown code block wrappers (```html, ```, etc.)
      .replace(/^```\w*\n?/gm, "")
      .replace(/```$/gm, "")
      // Remove bold/italic markdown
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

      // H1/H2 - Substrand heading
      if (level === 1 || level === 2) {
        h2Count += 1;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        // Professional card style - clean background
        const card = document.createElement("div");
        card.className = "substrand-card mb-10 rounded-lg bg-[#1e1e28] border border-white/10 overflow-hidden";
        card.id = id;

        const header = document.createElement("div");
        header.className = "bg-[#252532] border-b border-white/10 px-6 py-5 flex items-center gap-4";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white/80 text-lg font-bold";
        badge.textContent = `${h2Count}`;

        const title = document.createElement("h2");
        title.className = "text-2xl font-bold text-white m-0";
        title.textContent = text;

        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        const body = document.createElement("div");
        body.className = "p-6 space-y-5";
        card.appendChild(body);

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

      // H3 - Section heading
      if (level === 3) {
        h3Count += 1;
        h4Count = 0;

        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-xl font-bold text-sky-400 mt-8 mb-4 pb-2 border-b border-white/10 scroll-mt-32";
        h.innerHTML = `<span class="text-white/50 mr-2">${h2Count}.${h3Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4 - Sub-section heading
      if (level === 4) {
        h4Count += 1;

        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-lg font-semibold text-teal-400 mt-6 mb-3 scroll-mt-32";
        h.innerHTML = `<span class="text-white/40 mr-2">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // ========================================
    // PROFESSIONAL SECTION STYLING
    // ========================================

    // Activity sections - subtle border only
    container.querySelectorAll("section.activity, .activity-box").forEach((section) => {
      section.className = "activity-section my-6 p-5 rounded-lg border border-amber-500/30 bg-white/[0.02]";

      const heading = section.querySelector("h3, h4");
      if (heading) {
        heading.className = "text-lg font-bold text-amber-400 mb-4";
      }
    });

    // Safety precautions - simple left border
    container.querySelectorAll("section.safety-precautions, .safety-precautions").forEach((section) => {
      section.className = "safety-section my-5 p-4 border-l-4 border-red-500 bg-white/[0.02]";

      const heading = section.querySelector("h3, h4, strong");
      if (heading) {
        heading.className = "text-base font-bold text-red-400 mb-2";
      }
    });

    // Note boxes - simple left border
    container.querySelectorAll(".note-box, section.note").forEach((section) => {
      section.className = "note-section my-5 p-4 border-l-4 border-cyan-500 bg-white/[0.02]";
    });

    // Tip boxes
    container.querySelectorAll(".tip-box, section.tip").forEach((section) => {
      section.className = "tip-section my-5 p-4 border-l-4 border-emerald-500 bg-white/[0.02]";
    });

    // Warning boxes
    container.querySelectorAll(".warning-box, section.warning").forEach((section) => {
      section.className = "warning-section my-5 p-4 border-l-4 border-red-500 bg-white/[0.02]";
    });

    // Example boxes
    container.querySelectorAll(".example-box, section.examples").forEach((section) => {
      section.className = "example-section my-5 p-4 border-l-4 border-blue-500 bg-white/[0.02]";
    });

    // Learning outcomes
    container.querySelectorAll("section.learning-outcomes").forEach((section) => {
      section.className = "outcomes-section my-5 p-4 border border-purple-500/30 rounded-lg bg-white/[0.02]";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-bold text-purple-400 mb-3";
      }
    });

    // Key concepts
    container.querySelectorAll("section.key-concepts").forEach((section) => {
      section.className = "concepts-section my-5 p-4 border border-indigo-500/30 rounded-lg bg-white/[0.02]";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-bold text-indigo-400 mb-3";
      }
    });

    // ========================================
    // IMAGE HANDLING
    // ========================================

    container.querySelectorAll("figure.image-figure, figure").forEach((figure) => {
      figure.className = "image-figure my-6 text-center";
    });

    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-lg mx-auto block max-w-full h-auto border border-white/10";
    });

    container.querySelectorAll(".image-placeholder").forEach((placeholder) => {
      placeholder.className = "image-placeholder border-2 border-dashed border-white/20 rounded-lg p-6 text-center my-6 bg-white/[0.02]";
    });

    container.querySelectorAll("figcaption").forEach((cap) => {
      cap.className = "mt-3 text-sm text-white/60 italic";
    });

    // ========================================
    // GENERAL STYLING
    // ========================================

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "overflow-x-auto my-6 rounded-lg border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse";
      table.querySelector("thead")?.classList.add("bg-white/5");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-4", "py-3", "font-bold", "text-white", "border-b", "border-white/10")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-4", "py-3", "text-white/80", "border-b", "border-white/5")
      );
    });

    // Paragraphs
    container.querySelectorAll("p").forEach((p) => {
      p.classList.add("my-3", "leading-relaxed", "text-white/85");
    });

    // Lists
    container.querySelectorAll("ul, ol").forEach((list) => {
      list.classList.add(
        "my-3",
        "space-y-2",
        "text-white/85",
        list.tagName === "UL" ? "list-disc" : "list-decimal",
        "list-inside"
      );
    });

    // Strong/bold text
    container.querySelectorAll("strong").forEach((strong) => {
      strong.classList.add("text-white", "font-semibold");
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
    <div className="text-white flex gap-8">
      {/* Table of Contents Sidebar */}
      {toc.length > 0 && (
        <aside className="sticky top-6 h-fit w-60 shrink-0 p-5 rounded-lg bg-[#1e1e28] border border-white/10 hidden lg:block">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">
            Contents
          </div>

          <nav className="space-y-1 max-h-[60vh] overflow-y-auto text-sm">
            {toc.map((item, index) => {
              const padding =
                item.level === 2 ? "pl-0" : item.level === 3 ? "pl-3" : "pl-6";

              return (
                <div key={item.id} className={padding}>
                  <a
                    href={`#${item.id}`}
                    className="block py-1 text-white/60 hover:text-white transition-colors"
                  >
                    {item.level === 2 && (
                      <span className="text-sky-400 font-medium mr-1">
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
          <div className="mt-10 p-5 rounded-lg bg-[#1e1e28] border border-white/10">
            <h3 className="text-base font-bold text-white mb-4">
              Image Descriptions ({images.length})
            </h3>
            <div className="space-y-3">
              {images.map((img) => (
                <div key={img.id} className="p-3 bg-white/[0.03] rounded border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded">
                      {img.type}
                    </span>
                    <span className="text-white/50 text-sm">{img.caption}</span>
                  </div>
                  <p className="text-white/60 text-sm">{img.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
