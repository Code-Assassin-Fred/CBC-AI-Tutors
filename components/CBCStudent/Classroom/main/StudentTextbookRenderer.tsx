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
        h.className = "substrand-heading text-2xl font-bold text-white mt-8 mb-4 pb-3 border-b-2 border-white/20 scroll-mt-24 flex items-center justify-between";

        // Create number badge
        const badge = document.createElement("span");
        badge.className = "inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white text-sm font-bold mr-3";
        badge.textContent = `${h2Count}`;

        // Create title span
        const titleSpan = document.createElement("span");
        titleSpan.className = "flex-1";
        titleSpan.textContent = text;

        // Create actions container (only Learn with AI in header)
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "flex items-center gap-2 ml-4";

        // Learn with AI button
        const learnBtn = document.createElement("button");
        learnBtn.className = "learn-with-ai-btn px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors";
        learnBtn.textContent = "Learn with AI";
        learnBtn.setAttribute("data-substrand-id", id);
        learnBtn.setAttribute("data-substrand-title", text);

        actionsDiv.appendChild(learnBtn);

        // Clear and rebuild header content
        h.textContent = "";
        h.appendChild(badge);
        h.appendChild(titleSpan);
        h.appendChild(actionsDiv);

        // Find where to insert the quiz button (before the next H1/H2 or at the end)
        let lastContentElement: Element | null = h;
        let sibling = h.nextElementSibling;
        while (sibling && !["H1", "H2"].includes(sibling.tagName)) {
          lastContentElement = sibling;
          sibling = sibling.nextElementSibling;
        }

        // Create Take Quiz button and insert after last content element
        const quizDiv = document.createElement("div");
        quizDiv.className = "take-quiz-container my-6 pt-4 border-t border-white/10 text-center";

        const quizBtn = document.createElement("button");
        quizBtn.className = "take-quiz-btn px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors";
        quizBtn.textContent = "📝 Take Quiz on this Section";
        quizBtn.setAttribute("data-substrand-id", id);
        quizBtn.setAttribute("data-substrand-title", text);

        quizDiv.appendChild(quizBtn);

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
    const handleLearnClick = (e: MouseEvent) => {
      const btn = e.target as HTMLElement;
      const learnBtn = btn.closest('.learn-with-ai-btn') as HTMLElement;
      if (learnBtn && onLearnWithAI) {
        const id = learnBtn.getAttribute('data-substrand-id') || '';
        const title = learnBtn.getAttribute('data-substrand-title') || '';
        // Get the substrand card content
        const card = document.getElementById(id);
        const bodyContent = card?.querySelector('.p-5')?.innerHTML || '';
        onLearnWithAI({ id, title, content: bodyContent });
      }
    };

    const handleQuizClick = (e: MouseEvent) => {
      const btn = e.target as HTMLElement;
      const quizBtn = btn.closest('.take-quiz-btn') as HTMLElement;
      if (quizBtn && onTakeQuiz) {
        const id = quizBtn.getAttribute('data-substrand-id') || '';
        const title = quizBtn.getAttribute('data-substrand-title') || '';
        const card = document.getElementById(id);
        const bodyContent = card?.querySelector('.p-5')?.innerHTML || '';
        onTakeQuiz({ id, title, content: bodyContent });
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
      <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
    </div>
  );
}
