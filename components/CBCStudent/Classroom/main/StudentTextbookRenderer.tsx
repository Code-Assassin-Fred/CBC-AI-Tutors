"use client";

import React, { useMemo, useState } from "react";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export default function StudentTextbookRenderer({ content }: { content: string }) {
  const [tocOpen, setTocOpen] = useState(false);

  const { formattedHtml, toc } = useMemo(() => {
    if (!content) return { formattedHtml: "", toc: [] as TocItem[] };

    const container = document.createElement("div");
    container.innerHTML = content;

    const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4")) as HTMLHeadingElement[];

    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    const tocItems: TocItem[] = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.charAt(1), 10);
      const text = h.textContent?.trim() || "";

      // H1/H2 → Card
      if (level === 1 || level === 2) {
        h2Count++;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        const card = document.createElement("div");
        card.className = "substrand-card mb-12 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl";
        card.id = id;

        const header = document.createElement("div");
        header.className = "bg-[#2a2a45] border-b border-white/10 px-8 py-6 flex items-center gap-5";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c3aed]/40 text-[#c4b5fd] text-2xl font-bold";
        badge.textContent = `${h2Count}`;

        const title = document.createElement("h2");
        title.className = "text-3xl font-bold text-white m-0";
        title.textContent = text;

        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        const body = document.createElement("div");
        body.className = "p-8 space-y-8";
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

      // H3
      if (level === 3) {
        h3Count++;
        h4Count = 0;
        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-2xl font-bold text-sky-300 mt-10 mb-4 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span>${h2Count}.${h3Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4
      if (level === 4) {
        h4Count++;
        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className = "text-xl font-semibold text-teal-300 mt-8 mb-3 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span>${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: text, level: 4 });
      }
    });

    // Images
    container.querySelectorAll("img").forEach((img) => {
      img.className = "rounded-xl mx-auto block max-w-full h-auto shadow-lg";
      const wrapper = document.createElement("figure");
      wrapper.className = "my-8 text-center";
      img.parentElement?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      if (img.alt) {
        const cap = document.createElement("figcaption");
        cap.className = "mt-3 text-sm text-white/60 italic";
        cap.textContent = img.alt;
        wrapper.appendChild(cap);
      }
    });

    // Tables
    container.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "overflow-x-auto my-8 rounded-xl border border-white/10";
      table.parentElement?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      table.className = "w-full text-left border-collapse";
      table.querySelector("thead")?.classList.add("bg-white/10");

      table.querySelectorAll("th").forEach((th) =>
        th.classList.add("px-5", "py-4", "font-bold", "text-white", "border-b")
      );
      table.querySelectorAll("td").forEach((td) =>
        td.classList.add("px-5", "py-4", "text-white/80", "border")
      );
    });

    // Paragraphs
    container.querySelectorAll("p").forEach((p) =>
      p.classList.add("my-4", "leading-relaxed", "text-white/90")
    );

    // Lists
    container.querySelectorAll("ul, ol").forEach((list) =>
      list.classList.add(
        "my-4",
        "space-y-2",
        "text-white/90",
        list.tagName === "UL" ? "list-disc" : "list-decimal",
        "list-inside"
      )
    );

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [content]);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  // TOC indentation
  const getIndent = (level: number) => {
    if (level === 2) return "ml-0";
    if (level === 3) return "ml-6";
    if (level === 4) return "ml-12";
    return "ml-0";
  };

  return (
    <>
      {/* Top TOC */}
      {toc.length > 0 && (
        <div className="w-full bg-[#111] p-4 rounded-xl mb-6 shadow-md border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3">Table of Contents</h2>
          <div className="space-y-2">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-white/80 hover:text-white transition ${getIndent(item.level)}`}
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-10">
        <main className="flex-1 min-w-0">
          <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </main>
      </div>

      {/* Floating TOC Button */}
      {toc.length > 0 && (
        <button
          onClick={() => setTocOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-3 rounded-full shadow-xl hover:bg-purple-700"
        >
          📑 TOC
        </button>
      )}

      {/* Slide-In TOC Drawer */}
      {tocOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setTocOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 bg-[#111] p-6 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4">Contents</h2>

            <button
              onClick={() => setTocOpen(false)}
              className="text-white/60 hover:text-white text-sm mb-4"
            >
              Close ✕
            </button>

            <nav className="space-y-3">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setTocOpen(false)}
                  className={`block text-white/80 hover:text-white ${getIndent(item.level)}`}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
