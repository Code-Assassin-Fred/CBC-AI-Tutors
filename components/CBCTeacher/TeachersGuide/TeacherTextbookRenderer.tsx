/**
 * TeacherTextbookRenderer - Professional & Premium Style for Teacher Guides
 * 
 * enhanced rendering with:
 * - Math support (LaTeX-style)
 * - Code syntax highlighting styles
 * - Modern, colorful section blocks with icons
 * - Professional typography and spacing
 * - Grade 4-12 appropriate hierarchy
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

interface TeacherTextbookRendererProps {
    content: string;
    sections?: TextbookSection[];
    images?: ImageMetadata[];
    onTocUpdate?: (toc: TocItem[]) => void;
}

// ============================================
// SVG ICONS (As strings for injection)
// ============================================

const ICONS = {
    activity: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
    safety: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    note: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    tip: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    example: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    outcomes: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    concepts: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-circuit"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.125A4 4 0 0 0 11 18h2a4 4 0 0 0 4.403-5.888 4 4 0 0 0-1.002-7.859A3 3 0 1 0 12 5Z"/><path d="M9 13a4.5 4.5 0 0 0 3 4"/><path d="M6.003 5.125A3 3 0 1 1 12 5"/><path d="M15.399 10.531A4 4 0 0 1 13 18h-2"/></svg>`
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TeacherTextbookRenderer({
    content,
    images = [],
    onTocUpdate,
}: TeacherTextbookRendererProps) {
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

        // Strip leading numbers from heading text
        function stripLeadingNumbers(text: string): string {
            return text.replace(/^[\d.]+\.?\s*/g, '').trim();
        }

        // Pre-processing: Handle Math and Code before conversion to DOM
        let processedContent = content
            // Remove markdown code block wrappers (```html, ```, etc.)
            .replace(/^```\w*\n?/gm, "")
            .replace(/```$/gm, "");

        // Math handling: replace $$math$$ and $math$ with spans that can be styled
        // Note: This is a basic fallback for KaTeX. For full KaTeX we'd need the lib.
        processedContent = processedContent
            .replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block font-serif italic text-center text-sky-300 my-4 text-base"> $1 </div>')
            .replace(/\$(.*?)\$/g, '<span class="math-inline font-serif italic text-sky-200 px-1"> $1 </span>');

        const imageById = new Map(images.map((img) => [img.id, img]));
        const generatedImages = images.filter((img) => img.isGenerated && img.imageUrl);
        let imageIndex = 0;

        // Image replacements
        processedContent = processedContent.replace(
            /<figure[^>]*data-image-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/figure>/gi,
            (match, imageId) => {
                const image = imageById.get(imageId);
                if (image?.isGenerated && image.imageUrl) {
                    return `
                        <figure class="image-figure my-8 text-center group">
                            <div class="relative inline-block overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                <img src="${image.imageUrl}" alt="${image.caption || ""}" class="max-w-full h-auto" />
                            </div>
                            ${image.caption ? `<figcaption class="mt-3 text-sm text-white/50 italic">${image.caption}</figcaption>` : ""}
                        </figure>
                    `;
                }
                return match;
            }
        );

        // Standalone patterns like [IMAGE: description]
        processedContent = processedContent.replace(/\[IMAGE:\s*([^\]]+)\]/gi, (match, description) => {
            const cleanDesc = description.trim();
            const nextImage = generatedImages[imageIndex++];

            if (nextImage?.imageUrl) {
                return `
                    <figure class="image-figure my-8 text-center group">
                        <div class="relative inline-block overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                            <img src="${nextImage.imageUrl}" alt="${nextImage.caption || cleanDesc}" class="max-w-full h-auto" />
                        </div>
                        <figcaption class="mt-3 text-sm text-white/50 italic">${nextImage.caption || cleanDesc}</figcaption>
                    </figure>
                `;
            }

            return `
                <div class="image-placeholder-premium my-8 p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 text-center">
                    <div class="text-white/20 mb-3 flex justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 8h.01"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m7 15 4-4 4 4 5-5"/></svg>
                    </div>
                    <div class="text-white/40 text-sm font-medium">Illustration Pending</div>
                    <div class="text-white/30 text-xs mt-1 italic">${cleanDesc}</div>
                </div>
            `;
        });

        const container = document.createElement("div");
        container.innerHTML = processedContent;

        const tocItems: TocItem[] = [];
        let counters = { h2: 0, h3: 0, h4: 0 };

        // Process Headings
        container.querySelectorAll("h1, h2, h3, h4").forEach((h) => {
            const level = parseInt(h.tagName.charAt(1), 10);
            const rawText = h.textContent?.trim() || "";
            const text = stripLeadingNumbers(rawText);

            if (level === 1 || level === 2) {
                counters.h2++;
                counters.h3 = 0;
                counters.h4 = 0;
                const id = `substrand-${counters.h2}-${slugify(text)}`;
                h.id = id;
                h.className = "text-2xl font-bold text-sky-400 mt-10 mb-6 scroll-mt-24 flex items-center gap-3 group";
                h.innerHTML = `
                    <span class="text-sky-400 font-bold">${counters.h2}.</span>
                    <span class="flex-1">${toTitleCase(text)}</span>
                `;
                tocItems.push({ id, title: text, level: 2 });
            } else if (level === 3) {
                counters.h3++;
                counters.h4 = 0;
                const id = `section-${counters.h2}-${counters.h3}-${slugify(text)}`;
                h.id = id;
                h.className = "text-xl font-bold text-white mt-8 mb-4 scroll-mt-24 flex items-center gap-2";
                h.innerHTML = `
                    <span class="text-sky-400 font-bold">${counters.h2}.${counters.h3}</span>
                    <span>${toTitleCase(text)}</span>
                `;
                tocItems.push({ id, title: text, level: 3 });
            } else if (level === 4) {
                counters.h4++;
                const id = `sub-${counters.h2}-${counters.h3}-${counters.h4}-${slugify(text)}`;
                h.id = id;
                h.className = "text-base font-semibold text-white mt-6 mb-3 scroll-mt-24 flex items-center gap-2";
                h.innerHTML = `
                    <span class="text-sky-400/80 font-semibold">${counters.h2}.${counters.h3}.${counters.h4}</span>
                    <span>${toTitleCase(text)}</span>
                `;
                tocItems.push({ id, title: text, level: 4 });
            }
        });

        // Helper to theme sections
        const themeSection = (selector: string, key: keyof typeof ICONS, title: string, colorClass: string) => {
            container.querySelectorAll(selector).forEach((section) => {
                const existingHeading = section.querySelector("h3, h4, strong");
                const headingText = existingHeading?.textContent?.trim() || title;
                if (existingHeading) existingHeading.remove();

                section.className = `p-6 my-6 rounded-2xl border ${colorClass} bg-white/[0.02] shadow-sm relative overflow-hidden`;

                // Add a subtle background glow
                const colorBase = colorClass.split(' ')[0].replace('border-', 'bg-').split('/')[0];
                const glow = document.createElement("div");
                glow.className = `absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${colorBase}`;
                section.prepend(glow);

                const contentDiv = document.createElement("div");
                contentDiv.className = "relative z-10";
                contentDiv.innerHTML = section.innerHTML;
                section.innerHTML = "";

                const themeColor = colorClass.split(' ')[0].replace('border-', 'text-').split('/')[0];
                const header = document.createElement("div");
                header.className = "flex items-center gap-2 mb-3";
                header.innerHTML = `
                    <span class="p-1.5 rounded-lg bg-white/5 ${themeColor}">
                        ${ICONS[key]}
                    </span>
                    <span class="font-bold text-sm uppercase tracking-wider ${themeColor}">${headingText}</span>
                `;

                section.appendChild(header);
                section.appendChild(contentDiv);
            });
        };

        // Theme the varied pedagogical sections
        themeSection("section.activity, .activity-box", "activity", "Teacher Activity", "border-blue-500/30");
        themeSection("section.safety-precautions, .safety-precautions", "safety", "Safety First", "border-rose-500/30");
        themeSection(".note-box, section.note", "note", "Pedagogical Note", "border-amber-500/30");
        themeSection(".tip-box, section.tip", "tip", "Teaching Tip", "border-emerald-500/30");
        themeSection(".warning-box, section.warning", "warning", "Caution", "border-red-500/30");
        themeSection(".example-box, section.examples", "example", "Example", "border-indigo-500/30");
        themeSection("section.learning-outcomes", "outcomes", "Learning Outcomes", "border-violet-500/30");
        themeSection("section.key-concepts", "concepts", "Key Concepts", "border-fuchsia-500/30");

        // Code Blocks
        container.querySelectorAll("pre, code").forEach((el) => {
            if (el.tagName === "PRE") {
                el.className = "p-4 my-6 rounded-xl bg-black/40 border border-white/10 font-mono text-sm overflow-x-auto selection:bg-indigo-500/30";
                if (el.firstElementChild?.tagName === "CODE") {
                    el.firstElementChild.className = "bg-transparent p-0 border-none text-indigo-300";
                }
            } else if (el.parentElement?.tagName !== "PRE") {
                el.className = "px-1.5 py-0.5 rounded bg-white/10 text-indigo-300 font-mono text-[0.9em]";
            }
        });

        // Tables Style
        container.querySelectorAll("table").forEach((table) => {
            const wrapper = document.createElement("div");
            wrapper.className = "table-wrapper overflow-x-auto my-8 rounded-xl border border-white/10 bg-white/[0.01]";
            table.parentElement?.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            table.className = "w-full text-left border-collapse";
            table.querySelectorAll("th").forEach((th) =>
                th.className = "px-4 py-3 bg-white/5 font-bold text-white text-sm border-b border-white/10"
            );
            table.querySelectorAll("td").forEach((td) =>
                td.className = "px-4 py-3 text-white text-sm border-b border-white/5"
            );
        });

        // Paragraphs & Spacing
        container.querySelectorAll("p").forEach((p) => {
            if (!p.closest(".image-figure") && !p.closest("section") && !p.closest(".note-box")) {
                p.className = "my-5 leading-[1.7] text-white text-[0.975rem]";
            }
        });

        // Lists
        container.querySelectorAll("ul, ol").forEach((list) => {
            list.className = `my-6 space-y-3 text-white list-inside ${list.tagName === "UL" ? "list-disc" : "list-decimal"} ml-2 text-[0.975rem] leading-[1.7]`;
            list.querySelectorAll("li").forEach(li => {
                const subLists = li.querySelectorAll("ul, ol");
                if (subLists.length > 0) {
                    li.className = "space-y-2";
                }
            });
        });

        // Bold text
        container.querySelectorAll("strong, b").forEach((b) => {
            b.className = "font-bold text-white selection:bg-indigo-500/40";
        });

        return { formattedHtml: container.innerHTML, toc: tocItems };
    }, [content, images]);

    useEffect(() => {
        if (onTocUpdate) onTocUpdate(toc);
    }, [toc, onTocUpdate]);

    function slugify(text: string) {
        return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
    }

    return (
        <div className="teacher-textbook-content text-white selection:text-white">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

                .teacher-textbook-content {
                    font-family: 'Plus Jakarta Sans', var(--font-sans), system-ui, sans-serif;
                    max-width: 900px;
                    margin: 0 auto;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    letter-spacing: -0.01em;
                }
                
                .teacher-textbook-content h1, 
                .teacher-textbook-content h2, 
                .teacher-textbook-content h3, 
                .teacher-textbook-content h4 {
                    letter-spacing: -0.02em;
                }

                .teacher-textbook-content > *:first-child {
                    margin-top: 0 !important;
                }

                .teacher-textbook-content hr {
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
                    border: none;
                    margin: 3rem 0;
                }

                .math-block {
                    overflow-x: auto;
                    padding: 1rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: 0.75rem;
                }

                .image-figure img {
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .image-figure:hover img {
                    transform: scale(1.02);
                }

                /* Custom Scrollbar for code blocks */
                .teacher-textbook-content pre::-webkit-scrollbar {
                    height: 6px;
                }
                .teacher-textbook-content pre::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </div>
    );
}
