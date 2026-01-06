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

interface SubstrandInfo {
  id: string;
  title: string;
  content: string;
}

interface StudentTextbookRendererProps {
  content: string;
  sections?: TextbookSection[];
  images?: ImageMetadata[];
  onTocUpdate?: (toc: TocItem[]) => void;
  onLearnWithAI?: (substrand: SubstrandInfo) => void;
  onTakeQuiz?: (substrand: SubstrandInfo) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function StudentTextbookRenderer({
  content,
  sections,
  images = [],
  onTocUpdate,
  onLearnWithAI,
  onTakeQuiz,
}: StudentTextbookRendererProps) {
  const { formattedHtml, toc } = useMemo(() => {
    if (!content) return { formattedHtml: "", toc: [] as TocItem[] };

    // Convert ALL CAPS text to title case, preserve mixed case
    function toTitleCase(text: string): string {
      const letters = text.replace(/[^a-zA-Z]/g, '');
      if (letters.length > 0 && letters === letters.toUpperCase()) {
        return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      }
      return text;
    }

    // Strip leading numbers like "1.", "2.", "3.1", "3.1.2" from text
    // Used to avoid double numbering when renderer adds its own numbering
    function stripLeadingNumber(text: string): string {
      // Match patterns like "1.", "2.", "1.2", "1.2.3", "1.2.3." at the start
      return text.replace(/^[\d.]+\.?\s*/, '').trim();
    }

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

    // Create a map of images by ID and by index for quick lookup
    const imageById = new Map(images.map((img) => [img.id, img]));
    const generatedImages = images.filter((img) => img.isGenerated && img.imageUrl);
    let imageIndex = 0;

    // Debug logging - remove after fixing
    console.log(`[StudentTextbookRenderer] Images received: ${images.length}`);
    console.log(`[StudentTextbookRenderer] Generated images: ${generatedImages.length}`);
    if (generatedImages.length > 0) {
      console.log(`[StudentTextbookRenderer] First generated image:`, generatedImages[0]);
    }

    // First pass: Replace figure[data-image-id] placeholders with actual images
    // Extract the existing figcaption if present and use it (don't duplicate)
    html = html.replace(
      /<figure[^>]*data-image-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/figure>/gi,
      (match, imageId, figureContent) => {
        const image = imageById.get(imageId);

        if (image?.isGenerated && image.imageUrl) {
          // Image is generated - replace placeholder with actual image
          // Use image.caption as the single source of truth for the caption
          const caption = image.caption || "Textbook image";
          return `
            <figure class="image-figure my-6 text-center" data-image-id="${imageId}">
              <img src="${image.imageUrl}" alt="${caption}" class="rounded-lg mx-auto block max-w-full h-auto border border-white/10" />
            </figure>
          `;
        }
        // Image not generated yet - keep original placeholder content
        return match;
      }
    );

    // Remove any orphaned figcaptions or duplicate caption text that appears after figures
    // GPT often outputs "Figure X: description" as a separate line after the image placeholder
    // These can appear as <p>, <em>, <i>, or plain text
    html = html.replace(/<\/figure>\s*<p[^>]*>\s*<em>\s*Figure\s*\d+[^<]*<\/em>\s*<\/p>/gi, '</figure>');
    html = html.replace(/<\/figure>\s*<p[^>]*>\s*<i>\s*Figure\s*\d+[^<]*<\/i>\s*<\/p>/gi, '</figure>');
    html = html.replace(/<\/figure>\s*<p[^>]*>\s*Figure\s*\d+[^<]*<\/p>/gi, '</figure>');
    html = html.replace(/<\/figure>\s*<em>\s*Figure\s*\d+[^<]*<\/em>/gi, '</figure>');
    html = html.replace(/<\/figure>\s*<i>\s*Figure\s*\d+[^<]*<\/i>/gi, '</figure>');
    html = html.replace(/<\/figure>\s*Figure\s*\d+[^<\n]*/gi, '</figure>');

    // Second pass: Handle [IMAGE: description] patterns that weren't already in figure elements
    // These need to be matched with generated images by index
    html = html.replace(
      /<img[^>]*src=["'][^\s]*\[IMAGE:\s*([^\]]+)\][^"']*["'][^>]*\/?>/gi,
      (match, description) => {
        const cleanDesc = description.trim();
        const nextImage = generatedImages[imageIndex];
        imageIndex++;

        if (nextImage?.imageUrl) {
          return `
            <figure class="image-figure my-6 text-center">
              <img src="${nextImage.imageUrl}" alt="${nextImage.caption || cleanDesc}" class="rounded-lg mx-auto block max-w-full h-auto border border-white/10" />
            </figure>
          `;
        }

        return `
          <figure class="image-placeholder-figure my-6">
            <div class="image-placeholder bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <div class="text-white/40 text-sm mb-2">[Pending Image]</div>
              <div class="text-white/60 text-sm">${cleanDesc}</div>
            </div>
          </figure>
        `;
      }
    );

    // Third pass: Handle standalone [IMAGE: description] text patterns
    html = html.replace(/\[IMAGE:\s*([^\]]+)\]/gi, (match, description) => {
      const cleanDesc = description.trim();
      const nextImage = generatedImages[imageIndex];
      imageIndex++;

      if (nextImage?.imageUrl) {
        return `
          <figure class="image-figure my-6 text-center">
            <img src="${nextImage.imageUrl}" alt="${nextImage.caption || cleanDesc}" class="rounded-lg mx-auto block max-w-full h-auto border border-white/10" />
          </figure>
        `;
      }

      return `
        <figure class="image-placeholder-figure my-6">
          <div class="image-placeholder bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
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

      // H1/H2 - Substrand heading (no card, just styled heading)
      if (level === 1 || level === 2) {
        h2Count++;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;
        h.id = id;
        h.className = "substrand-heading text-2xl font-bold text-white mt-8 mb-4 scroll-mt-24 flex items-center justify-between";

        // Create number span (same color as title)
        const numberSpan = document.createElement("span");
        numberSpan.className = "font-bold mr-3";
        numberSpan.textContent = `${h2Count}`;

        // Create title span (lowercase)
        const titleSpan = document.createElement("span");
        titleSpan.className = "flex-1";
        titleSpan.textContent = toTitleCase(text);

        // Create Learn with AI text link (not a button)
        const learnLink = document.createElement("a");
        learnLink.className = "learn-with-ai-btn text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer ml-4";
        learnLink.textContent = "Learn with AI →";
        learnLink.setAttribute("data-substrand-id", id);
        learnLink.setAttribute("data-substrand-title", text);

        // Clear and rebuild header content
        h.textContent = "";
        h.appendChild(numberSpan);
        h.appendChild(titleSpan);
        h.appendChild(learnLink);

        // Find where to insert the quiz link (before the next H1/H2)
        let lastContentElement: Element | null = h;
        let sibling = h.nextElementSibling;
        while (sibling && !["H1", "H2"].includes(sibling.tagName)) {
          lastContentElement = sibling;
          sibling = sibling.nextElementSibling;
        }

        // Create Take Quiz text link (not a button, no icon, no border/line)
        const quizDiv = document.createElement("div");
        quizDiv.className = "take-quiz-container my-6 text-right";

        const quizLink = document.createElement("a");
        quizLink.className = "take-quiz-btn text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer";
        quizLink.textContent = "Take Quiz on this Section →";
        quizLink.setAttribute("data-substrand-id", id);
        quizLink.setAttribute("data-substrand-title", text);

        quizDiv.appendChild(quizLink);

        // Insert after the last content element
        if (lastContentElement && lastContentElement.parentNode) {
          lastContentElement.parentNode.insertBefore(quizDiv, lastContentElement.nextSibling);
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
        h.className = "text-lg font-bold text-sky-400 mt-6 mb-3 scroll-mt-24";
        h.innerHTML = `<span class="text-sky-400 mr-2">${h2Count}.${h3Count}</span> ${toTitleCase(stripLeadingNumber(text))}`;
        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4 - Sub-section heading
      if (level === 4) {
        h4Count++;
        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-base font-semibold text-teal-400 mt-5 mb-2 scroll-mt-24";
        h.innerHTML = `<span class="text-teal-400 mr-2">${h2Count}.${h3Count}.${h4Count}</span> ${toTitleCase(stripLeadingNumber(text))}`;
        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // ========================================
    // PROFESSIONAL SECTION STYLING (Minimal/Clean)
    // ========================================

    // Activity sections - clean styling, no box
    container.querySelectorAll("section.activity, .activity-box").forEach((section) => {
      section.className = "activity-section my-4";

      const heading = section.querySelector("h3, h4");
      if (heading) {
        heading.className = "text-base font-semibold text-white/90 mb-2";
      }
    });

    // Safety precautions - clean styling
    container.querySelectorAll("section.safety-precautions, .safety-precautions").forEach((section) => {
      section.className = "safety-section my-4";

      const heading = section.querySelector("h3, h4, strong");
      if (heading) {
        heading.className = "text-base font-semibold text-white/90 mb-2";
      }
    });

    // Note boxes - clean styling
    container.querySelectorAll(".note-box, section.note").forEach((section) => {
      section.className = "note-section my-4";
    });

    // Tip boxes - clean styling
    container.querySelectorAll(".tip-box, section.tip").forEach((section) => {
      section.className = "tip-section my-4";
    });

    // Warning boxes - clean styling
    container.querySelectorAll(".warning-box, section.warning").forEach((section) => {
      section.className = "warning-section my-4";
    });

    // Example boxes - clean styling
    container.querySelectorAll(".example-box, section.examples").forEach((section) => {
      section.className = "example-section my-4";
    });

    // Learning outcomes - clean styling
    container.querySelectorAll("section.learning-outcomes").forEach((section) => {
      section.className = "outcomes-section my-4";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-semibold text-white/90 mb-2";
      }
    });

    // Key concepts - clean styling
    container.querySelectorAll("section.key-concepts").forEach((section) => {
      section.className = "concepts-section my-4";

      const heading = section.querySelector("h3");
      if (heading) {
        heading.className = "text-base font-semibold text-white/90 mb-2";
      }
    });

    // ========================================
    // IMAGE HANDLING (additional styling)
    // ========================================

    // Note: Main image replacement is done in string processing above
    // This section just handles styling of remaining img elements

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
  }, [content, images]);

  // Lift TOC up to parent
  useEffect(() => {
    if (onTocUpdate) onTocUpdate(toc);
  }, [toc, onTocUpdate]);

  // Handle button clicks
  useEffect(() => {
    // Helper to extract content between headings
    const extractContent = (headingId: string): string => {
      const heading = document.getElementById(headingId);
      if (!heading) return '';

      let content = '';
      let next = heading.nextElementSibling;

      // Collect all elements until the next H1 or H2
      while (next && !['H1', 'H2'].includes(next.tagName)) {
        // Skip the "Take Quiz" container if it exists, to avoid circular content
        if (!next.classList.contains('take-quiz-container')) {
          content += next.outerHTML;
        }
        next = next.nextElementSibling;
      }

      return content || heading.innerText; // Fallback to heading text if no content
    };

    const handleLearnClick = (e: MouseEvent) => {
      const btn = e.target as HTMLElement;
      const learnBtn = btn.closest('.learn-with-ai-btn') as HTMLElement;
      if (learnBtn && onLearnWithAI) {
        const id = learnBtn.getAttribute('data-substrand-id') || '';
        const title = learnBtn.getAttribute('data-substrand-title') || '';
        const content = extractContent(id);
        onLearnWithAI({ id, title, content });
      }
    };

    const handleQuizClick = (e: MouseEvent) => {
      const btn = e.target as HTMLElement;
      const quizBtn = btn.closest('.take-quiz-btn') as HTMLElement;
      if (quizBtn && onTakeQuiz) {
        const id = quizBtn.getAttribute('data-substrand-id') || '';
        const title = quizBtn.getAttribute('data-substrand-title') || '';
        const content = extractContent(id);
        onTakeQuiz({ id, title, content });
      }
    };

    document.addEventListener('click', handleLearnClick);
    document.addEventListener('click', handleQuizClick);

    return () => {
      document.removeEventListener('click', handleLearnClick);
      document.removeEventListener('click', handleQuizClick);
    };
  }, [onLearnWithAI, onTakeQuiz]);


  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="student-textbook-content text-white">
      {/* Hide any horizontal rules or divider lines from generated content */}
      <style jsx global>{`
        .student-textbook-content hr {
          display: none !important;
        }
        .student-textbook-content section,
        .student-textbook-content div {
          border: none !important;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
    </div>
  );
}
