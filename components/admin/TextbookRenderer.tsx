"use client";

import React, { useMemo } from "react";

interface Props {
  content: string;
}

export default function TextbookRenderer({ content }: Props) {
  const { formattedHtml, toc } = useMemo(() => {
    let html = content?.trim();
    if (!html) {
      return {
        formattedHtml: "",
        toc: [] as Array<{ id: string; title: string; level: number }>,
      };
    }

    // Remove markdown
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1");

    const safe = html;

    const container = document.createElement("div");
    container.innerHTML = safe;

    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3, h4")
    ) as HTMLHeadingElement[];

    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    const tocItems: Array<{ id: string; title: string; level: number }> = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.charAt(1), 10);
      const text = h.textContent?.trim() || "";

      // H1/H2 → Card
      if (level === 1 || level === 2) {
        h2Count += 1;
        h3Count = 0;
        h4Count = 0;

        const id = `substrand-${h2Count}-${slugify(text)}`;

        const card = document.createElement("div");
        card.className =
          "substrand-card mb-12 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl";
        card.id = id;

        const header = document.createElement("div");
        header.className =
          "bg-[#2a2a45] border-b border-white/10 px-8 py-6 flex items-center gap-5";

        const badge = document.createElement("div");
        badge.className =
          "flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c3aed]/40 text-[#c4b5fd] text-2xl font-bold";
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
        h3Count += 1;
        h4Count = 0;

        const id = `section-${h2Count}-${h3Count}-${slugify(text)}`;
        h.id = id;
        h.className =
          "text-2xl font-bold text-sky-300 mt-10 mb-4 flex items-center gap-3 scroll-mt-32";
        h.innerHTML = `<span>${h2Count}.${h3Count}</span> ${h.innerHTML}`;

        tocItems.push({ id, title: text, level: 3 });
        return;
      }

      // H4
      if (level === 4) {
        h4Count += 1;

        const id = `sub-${h2Count}-${h3Count}-${h4Count}-${slugify(text)}`;
        h.id = id;
        h.className =
          "text-xl font-semibold text-teal-300 mt-8 mb-3 flex items-center gap-3 scroll-mt-32";
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
    container
      .querySelectorAll("p")
      .forEach((p) => p.classList.add("my-4", "leading-relaxed", "text-white/90"));

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
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  return (
    <div className="text-white flex gap-10">
      {toc.length > 0 && (
        <aside className="sticky top-6 h-fit w-64 p-6 rounded-2xl bg-[#111] border border-white/10">
          <div className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">
            Table of Contents
          </div>

          <nav className="space-y-2">
            {toc.map((item, index) => {
              const padding =
                item.level === 2 ? "pl-0" : item.level === 3 ? "pl-6" : "pl-12";

              return (
                <div key={item.id} className={padding}>
                  <a
                    href={`#${item.id}`}
                    className="block py-1 text-white/80 hover:text-white transition-colors"
                  >
                    {item.level === 2 && (
                      <span className="text-[#c4b5fd] font-semibold mr-2">
                        {index + 1}.
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

      <main className="flex-1 min-w-0">
        <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
      </main>
    </div>
  );
}
