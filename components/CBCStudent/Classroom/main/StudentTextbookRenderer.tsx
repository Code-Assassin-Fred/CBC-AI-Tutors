/**
 * Enhanced StudentTextbookRenderer
 * 
 * Student-facing textbook renderer with support for:
 * - Structured sections (activities, safety notes, tips)
 * - Image placeholders
 * - Table of Contents navigation (passed to parent)
 * - Enhanced styling matching admin renderer
 * - Clean, student-friendly presentation
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

    // Remove markdown artifacts
    let html = content
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

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

      // H1/H2 → Substrand Card
      if (level === 1 || level === 2) {
        h2Count++;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        const card = document.createElement("div");
        card.className = "substrand-card mb-10 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl overflow-hidden";
        card.id = id;

        const header = document.createElement("div");
        header.className = "bg-gradient-to-r from-[#2a2a45] to-[#1a1a35] border-b border-white/10 px-6 py-5 flex items-center gap-4";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed]/40 text-[#c4b5fd] text-xl font-bold shadow-lg";
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
        h3Count++;
        h4Count = 0;
        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-xl font-bold text-sky-300 mt-8 mb-3 flex items-center gap-3 scroll-mt-24";
        h.innerHTML = `<span class="text-sky-500/70">${h2Count}.${h3Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4 → Sub-section heading
      if (level === 4) {
        h4Count++;
        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-lg font-semibold text-teal-300 mt-6 mb-2 flex items-center gap-3 scroll-mt-24";
        h.innerHTML = `<span class="text-teal-500/70">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // ========================================
    // ENHANCED SECTION STYLING
    // ========================================

    // Activity sections
    container.querySelectorAll("section.activity, .activity-box").forEach((section) => {
      section.className = "activity-box my-6 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 overflow-hidden p-5";

      const heading = section.querySelector("h3, h4");
      if (heading) {
        heading.className = "text-lg font-bold text-amber-300 flex items-center gap-2 mb-3";
        heading.innerHTML = `<span>🔬</span> ${heading.innerHTML}`;
      }
    });

    // Safety precautions
    container.querySelectorAll("section.safety-precautions, .safety-precautions").forEach((section) => {
      section.className = "safety-box my-5 p-4 rounded-xl bg-red-900/30 border border-red-500/30";

      const heading = section.querySelector("h3, h4, strong");
      if (heading) {
        heading.className = "text-base font-bold text-red-400 flex items-center gap-2 mb-2";
        if (!heading.innerHTML.includes("⚠️")) {
          heading.innerHTML = `<span>⚠️</span> ${heading.innerHTML}`;
        }
      }
    });

    // Note boxes
    container.querySelectorAll(".note-box, section.note").forEach((section) => {
      section.className = "note-box my-5 p-4 rounded-xl bg-cyan-900/30 border-l-4 border-cyan-500";
    });

    // Tip boxes
    container.querySelectorAll(".tip-box, section.tip").forEach((section) => {
      section.className = "tip-box my-5 p-4 rounded-xl bg-emerald-900/30 border-l-4 border-emerald-500";
    });

    // Warning boxes
    container.querySelectorAll(".warning-box, section.warning").forEach((section) => {
      section.className = "warning-box my-5 p-4 rounded-xl bg-red-900/30 border-l-4 border-red-500";
    });

    // Example boxes
    container.querySelectorAll(".example-box, section.examples").forEach((section) => {
      section.className = "example-box my-5 p-4 rounded-xl bg-blue-900/30 border border-blue-500/30";
    });

    // Learning outcomes
    container.querySelectorAll("section.learning-outcomes").forEach((section) => {
      section.className = "learning-outcomes my-5 p-4 rounded-xl bg-purple-900/30 border border-purple-500/30";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-bold text-purple-400 flex items-center gap-2 mb-2";
        heading.innerHTML = `<span>🎯</span> ${heading.innerHTML}`;
      }
    });

    // Key concepts
    container.querySelectorAll("section.key-concepts").forEach((section) => {
      section.className = "key-concepts my-5 p-4 rounded-xl bg-indigo-900/30 border border-indigo-500/30";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-bold text-indigo-400 flex items-center gap-2 mb-2";
        heading.innerHTML = `<span>💡</span> ${heading.innerHTML}`;
      }
    });

    // ========================================
    // IMAGE HANDLING
    // ========================================

    // Style images
    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-xl mx-auto block max-w-full h-auto shadow-lg border border-white/10";

      // Wrap in figure if not already
      if (img.parentElement?.tagName !== "FIGURE") {
        const figure = document.createElement("figure");
        figure.className = "image-figure my-6 text-center";
        img.parentElement?.insertBefore(figure, img);
        figure.appendChild(img);

        if (img.alt) {
          const cap = document.createElement("figcaption");
          cap.className = "mt-3 text-sm text-white/60 italic";
          cap.textContent = img.alt;
          figure.appendChild(cap);
        }
      }
    });

    // Style image placeholders
    container.querySelectorAll(".image-placeholder").forEach((placeholder) => {
      placeholder.className = "image-placeholder bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-dashed border-purple-500/40 rounded-xl p-6 text-center my-6";
    });

    // Style figcaptions
    container.querySelectorAll("figcaption").forEach((cap) => {
      cap.className = "mt-3 text-sm text-white/60 italic";
    });

    // ========================================
    // GENERAL STYLING
    // ========================================

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      // Check if already wrapped
      if (table.parentElement?.classList.contains("table-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper overflow-x-auto my-6 rounded-xl border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse text-sm";
      table.querySelector("thead")?.classList.add("bg-white/10");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-4", "py-3", "font-bold", "text-white", "border-b", "border-white/10")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-4", "py-3", "text-white/80", "border-b", "border-white/5")
      );
    });

    // Paragraphs
    container.querySelectorAll("p").forEach((p) => {
      if (!p.closest(".activity-box") && !p.closest(".note-box") && !p.closest(".tip-box")) {
        p.classList.add("my-3", "leading-relaxed", "text-white/90");
      } else {
        p.classList.add("text-white/80");
      }
    });

    // Lists
    container.querySelectorAll("ul, ol").forEach((list) => {
      // Skip if inside activity box (handled separately)
      if (list.closest(".activity-box")) return;

      list.classList.add(
        "my-3",
        "space-y-1.5",
        "text-white/90",
        list.tagName === "UL" ? "list-disc" : "list-decimal",
        "list-inside"
      );
    });

    // Ordered lists in activities - special styling
    container.querySelectorAll(".activity-box ol").forEach((list) => {
      list.className = "space-y-2 list-none pl-0";
      list.querySelectorAll("li").forEach((li, i) => {
        li.className = "flex items-start gap-2 text-white/80";
        const number = document.createElement("span");
        number.className = "flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center mt-0.5";
        number.textContent = `${i + 1}`;
        li.insertBefore(number, li.firstChild);
      });
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
