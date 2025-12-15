/**
 * Enhanced StudentTextbookRenderer - Professional Style
 * 
 * Clean, professional textbook rendering for students:
 * - No gradient backgrounds
 * - Minimal colored containers
 * - Text color changes for hierarchy
 * - Traditional textbook appearance
 */

"use client";

import React, { useMemo, useEffect } from "react";
import { ImageMetadata, TextbookSection } from "@/types/textbook";

// ============================================
// TYPES
// ============================================

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface StudentTextbookRendererProps {
  content: string;
  sections?: TextbookSection[];
  images?: ImageMetadata[];
  onTocUpdate?: (toc: TocItem[]) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function StudentTextbookRenderer({
  content,
  sections,
  images = [],
  onTocUpdate,
}: StudentTextbookRendererProps) {
  const { formattedHtml, toc } = useMemo(() => {
    if (!content) return { formattedHtml: "", toc: [] as TocItem[] };

    // Remove markdown artifacts and code block wrappers
    let html = content
      // Remove markdown code block wrappers (```html, ```, etc.)
      .replace(/^```\w*\n?/gm, "")
      .replace(/```$/gm, "")
      // Remove bold/italic markdown
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

    // Convert [IMAGE: description] placeholders to proper HTML
    // This handles both raw text placeholders and img tags with [IMAGE: src
    html = html
      // Replace <img src="[IMAGE: description]" ...> tags with placeholder divs
      .replace(/<img[^>]*src=["'][^\s]*\[IMAGE:\s*([^\]]+)\][^"']*["'][^>]*\/?>/gi, (match, description) => {
        const cleanDesc = description.trim();
        return `
          <figure class="image-placeholder-figure my-6">
            <div class="image-placeholder bg-white/[0.02] border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <div class="text-white/40 text-sm mb-2">[Pending Image]</div>
              <div class="text-white/60 text-sm">${cleanDesc}</div>
            </div>
          </figure>
        `;
      })
      // Replace standalone [IMAGE: description] text with placeholder divs
      .replace(/\[IMAGE:\s*([^\]]+)\]/gi, (match, description) => {
        const cleanDesc = description.trim();
        return `
          <figure class="image-placeholder-figure my-6">
            <div class="image-placeholder bg-white/[0.02] border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <div class="text-white/40 text-sm mb-2">[Pending Image]</div>
              <div class="text-white/60 text-sm">${cleanDesc}</div>
            </div>
            <figcaption class="mt-2 text-sm text-white/50 italic text-center">${cleanDesc}</figcaption>
          </figure>
        `;
      });

    const container = document.createElement("div");
    container.innerHTML = html;

    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4")) as HTMLHeadingElement[];

    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    const tocItems: TocItem[] = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.charAt(1), 10);
      const text = h.textContent?.trim() || "";

      // H1/H2 - Substrand heading
      if (level === 1 || level === 2) {
        h2Count++;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        // Professional card style
        const card = document.createElement("div");
        card.className = "substrand-card mb-8 rounded-lg bg-[#1e1e28] border border-white/10 overflow-hidden";
        card.id = id;

        const header = document.createElement("div");
        header.className = "bg-[#252532] border-b border-white/10 px-5 py-4 flex items-center gap-3";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/80 text-base font-bold";
        badge.textContent = `${h2Count}`;

        const title = document.createElement("h2");
        title.className = "text-xl font-bold text-white m-0";
        title.textContent = text;

        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        const body = document.createElement("div");
        body.className = "p-5 space-y-4";
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
        h3Count++;
        h4Count = 0;
        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-lg font-bold text-sky-400 mt-6 mb-3 pb-2 border-b border-white/10 scroll-mt-24";
        h.innerHTML = `<span class="text-white/50 mr-2">${h2Count}.${h3Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4 - Sub-section heading
      if (level === 4) {
        h4Count++;
        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-base font-semibold text-teal-400 mt-5 mb-2 scroll-mt-24";
        h.innerHTML = `<span class="text-white/40 mr-2">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // ========================================
    // PROFESSIONAL SECTION STYLING
    // ========================================

    // Activity sections - subtle border
    container.querySelectorAll("section.activity, .activity-box").forEach((section) => {
      section.className = "activity-section my-5 p-4 rounded-lg border border-amber-500/30 bg-white/[0.02]";

      const heading = section.querySelector("h3, h4");
      if (heading) {
        heading.className = "text-base font-bold text-amber-400 mb-3";
      }
    });

    // Safety precautions
    container.querySelectorAll("section.safety-precautions, .safety-precautions").forEach((section) => {
      section.className = "safety-section my-4 p-4 border-l-4 border-red-500 bg-white/[0.02]";

      const heading = section.querySelector("h3, h4, strong");
      if (heading) {
        heading.className = "text-sm font-bold text-red-400 mb-2";
      }
    });

    // Note boxes
    container.querySelectorAll(".note-box, section.note").forEach((section) => {
      section.className = "note-section my-4 p-4 border-l-4 border-cyan-500 bg-white/[0.02]";
    });

    // Tip boxes
    container.querySelectorAll(".tip-box, section.tip").forEach((section) => {
      section.className = "tip-section my-4 p-4 border-l-4 border-emerald-500 bg-white/[0.02]";
    });

    // Warning boxes
    container.querySelectorAll(".warning-box, section.warning").forEach((section) => {
      section.className = "warning-section my-4 p-4 border-l-4 border-red-500 bg-white/[0.02]";
    });

    // Example boxes
    container.querySelectorAll(".example-box, section.examples").forEach((section) => {
      section.className = "example-section my-4 p-4 border-l-4 border-blue-500 bg-white/[0.02]";
    });

    // Learning outcomes
    container.querySelectorAll("section.learning-outcomes").forEach((section) => {
      section.className = "outcomes-section my-4 p-4 border border-purple-500/30 rounded-lg bg-white/[0.02]";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-sm font-bold text-purple-400 mb-2";
      }
    });

    // Key concepts
    container.querySelectorAll("section.key-concepts").forEach((section) => {
      section.className = "concepts-section my-4 p-4 border border-indigo-500/30 rounded-lg bg-white/[0.02]";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-sm font-bold text-indigo-400 mb-2";
      }
    });

    // ========================================
    // IMAGE HANDLING
    // ========================================

    // Handle structured images with IDs
    container.querySelectorAll("figure[data-image-id]").forEach((figure) => {
      const id = figure.getAttribute("data-image-id");
      const image = images.find((img) => img.id === id);

      if (image?.isGenerated && image.imageUrl) {
        // Create real image
        const img = document.createElement("img");
        img.src = image.imageUrl;
        img.alt = image.caption || "Textbook image";
        img.className = "rounded-lg mx-auto block max-w-full h-auto border border-white/10";

        // Remove existing placeholder if present
        const placeholder = figure.querySelector(".image-placeholder");
        if (placeholder) {
          placeholder.remove();
        }

        // Insert image at the top
        figure.insertBefore(img, figure.firstChild);
      }
    });

    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-lg mx-auto block max-w-full h-auto border border-white/10";

      if (img.parentElement?.tagName !== "FIGURE") {
        const figure = document.createElement("figure");
        figure.className = "image-figure my-5 text-center";
        img.parentElement?.insertBefore(figure, img);
        figure.appendChild(img);

        if (img.alt) {
          const cap = document.createElement("figcaption");
          cap.className = "mt-2 text-sm text-white/60 italic";
          cap.textContent = img.alt;
          figure.appendChild(cap);
        }
      }
    });

    container.querySelectorAll(".image-placeholder").forEach((placeholder) => {
      placeholder.className = "image-placeholder border-2 border-dashed border-white/20 rounded-lg p-5 text-center my-5 bg-white/[0.02]";
    });

    container.querySelectorAll("figcaption").forEach((cap) => {
      cap.className = "mt-2 text-sm text-white/60 italic";
    });

    // ========================================
    // GENERAL STYLING
    // ========================================

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("table-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper overflow-x-auto my-5 rounded-lg border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse text-sm";
      table.querySelector("thead")?.classList.add("bg-white/5");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-3", "py-2", "font-bold", "text-white", "border-b", "border-white/10")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-3", "py-2", "text-white/80", "border-b", "border-white/5")
      );
    });

    // Paragraphs
    container.querySelectorAll("p").forEach((p) => {
      p.classList.add("my-2", "leading-relaxed", "text-white/85");
    });

    // Lists
    container.querySelectorAll("ul, ol").forEach((list) => {
      list.classList.add(
        "my-2",
        "space-y-1",
        "text-white/85",
        list.tagName === "UL" ? "list-disc" : "list-decimal",
        "list-inside"
      );
    });

    // Strong/bold
    container.querySelectorAll("strong").forEach((strong) => {
      strong.classList.add("text-white", "font-semibold");
    });

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [content]);

  // Lift TOC up to parent
  useEffect(() => {
    if (onTocUpdate) onTocUpdate(toc);
  }, [toc, onTocUpdate]);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="student-textbook-content text-white">
      <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
    </div>
  );
}
