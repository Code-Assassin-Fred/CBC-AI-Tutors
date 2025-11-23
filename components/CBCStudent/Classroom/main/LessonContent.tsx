"use client";

import React, { useMemo } from 'react';
import { useLesson } from '../context/LessonContext';
import { sanitizeHtml } from '@/lib/sanitize';

export default function LessonContent() {
  const { lesson } = useLesson();

  // Prepare sanitized HTML once per content change
  const { formattedHtml, toc } = useMemo(() => {
    let html = lesson?.content?.trim();
    if (!html) return { formattedHtml: '', toc: [] as Array<{ id: string; title: string; level: number }> };

    // Remove stray markdown markers like **bold** or *italic* if present in raw content
    // Convert common markdown emphasis to plain text to avoid visible asterisks
    html = html
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1');

    // 1) Sanitize incoming HTML
    const safe = sanitizeHtml(html);

    // 2) Build a transient DOM to restructure headings and build a TOC
    const container = document.createElement('div');
    container.innerHTML = safe;

    // Normalize headings structure h2/h3/h4 as Sections / Subsections / Subtopics
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4')) as HTMLHeadingElement[];

    // We'll number h2 as 1,2,3...; h3 as 1.1, 1.2; h4 as 1.1.1 etc.
    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;
    const tocItems: Array<{ id: string; title: string; level: number }> = [];

    headings.forEach((h) => {
      const level = parseInt(h.tagName.substring(1), 10);

      if (level === 1) {
        // Demote h1 to h2 to keep a single consistent top-level per page
        const newH = document.createElement('h2');
        newH.innerHTML = h.innerHTML;
        h.replaceWith(newH);
        h2Count += 1; h3Count = 0; h4Count = 0;
        const id = `section-${h2Count}-${slugify(newH.textContent || '')}`;
        newH.id = id;
  newH.classList.add('mt-8','mb-3','scroll-mt-24','border-b','border-white/10','pb-1');
  newH.innerHTML = `<span class="text-blue-400 mr-2">${h2Count}.</span>${newH.innerHTML}`;
        tocItems.push({ id, title: newH.textContent || `Section ${h2Count}`, level: 2 });
        return;
      }

      if (level === 2) {
        h2Count += 1; h3Count = 0; h4Count = 0;
        const id = `section-${h2Count}-${slugify(h.textContent || '')}`;
        h.id = id;
  h.classList.add('mt-8','mb-3','scroll-mt-24','border-b','border-white/10','pb-1');
  h.innerHTML = `<span class="text-blue-400 mr-2">${h2Count}.</span>${h.innerHTML}`;
        tocItems.push({ id, title: h.textContent || `Section ${h2Count}`, level: 2 });
        return;
      }

      if (level === 3) {
        h3Count += 1; h4Count = 0;
        const id = `section-${h2Count}-${h3Count}-${slugify(h.textContent || '')}`;
        h.id = id;
  h.classList.add('mt-6','mb-2','scroll-mt-24');
  h.innerHTML = `<span class="text-sky-300 mr-2">${h2Count}.${h3Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: h.textContent || `Section ${h2Count}.${h3Count}`, level: 3 });
        return;
      }

      if (level === 4) {
        h4Count += 1;
        const id = `section-${h2Count}-${h3Count}-${h4Count}-${slugify(h.textContent || '')}`;
        h.id = id;
  h.classList.add('mt-4','mb-1.5','scroll-mt-24');
  h.innerHTML = `<span class="text-teal-300 mr-2">${h2Count}.${h3Count}.${h4Count}</span> ${h.innerHTML}`;
        tocItems.push({ id, title: h.textContent || `Section ${h2Count}.${h3Count}.${h4Count}`, level: 4 });
      }
    });

    // 3) Wrap images and tables to be responsive
    container.querySelectorAll('img').forEach((img) => {
      img.classList.add('rounded-md','mx-auto','block','max-w-full','h-auto');
      const wrapper = document.createElement('figure');
      wrapper.className = 'my-4';
      img.parentElement?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      if (img.getAttribute('alt') && !wrapper.querySelector('figcaption')) {
        const cap = document.createElement('figcaption');
        cap.className = 'text-xs text-white/60 mt-2 text-center';
        cap.textContent = img.getAttribute('alt') || '';
        wrapper.appendChild(cap);
      }
    });

    container.querySelectorAll('table').forEach((table) => {
      const scroll = document.createElement('div');
      scroll.className = 'overflow-x-auto my-4';
      table.parentElement?.insertBefore(scroll, table);
      scroll.appendChild(table);

      table.classList.add('w-full','text-left','border-collapse');
      const thead = table.querySelector('thead');
      if (thead) thead.classList.add('bg-white/5');
      table.querySelectorAll('th').forEach(th => th.classList.add('px-3','py-2','font-semibold','text-white','border-b','border-white/10'));
      table.querySelectorAll('td').forEach(td => td.classList.add('px-3','py-2','text-white/80','border-b','border-white/10'));
      // Zebra rows
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      rows.forEach((tr, idx) => {
        if (idx % 2 === 1) tr.classList.add('bg-white/[0.03]');
      });
    });

    // 4) Paragraphs and lists spacing for readability
    container.querySelectorAll('p').forEach((p) => {
      p.classList.add('my-3','leading-relaxed','text-white/90');
    });
    container.querySelectorAll('ul').forEach((ul) => {
      ul.classList.add('list-disc','pl-6','my-3','space-y-2');
    });
    container.querySelectorAll('ol').forEach((ol) => {
      ol.classList.add('list-decimal','pl-6','my-3','space-y-2');
    });
    container.querySelectorAll('li').forEach((li) => {
      li.classList.add('leading-relaxed');
    });

    // 5) Blockquotes and horizontal rules
    container.querySelectorAll('blockquote').forEach((bq) => {
      bq.classList.add('border-l-2','border-blue-500/40','pl-4','italic','text-white/80','my-4');
    });
    container.querySelectorAll('hr').forEach((hr) => {
      hr.classList.add('my-6','border-white/10');
    });

    // 6) Code blocks (if any)
    container.querySelectorAll('pre').forEach((pre) => {
      pre.classList.add('bg-white/5','rounded-lg','p-3','overflow-x-auto','my-4');
    });
    container.querySelectorAll('code').forEach((code) => {
      code.classList.add('text-blue-200');
    });

    // 7) Lightweight callouts for pedagogy
    const calloutMap: Record<string, { wrapper: string; label: string }> = {
      'note:': { wrapper: 'bg-cyan-900/20 border-cyan-600/30', label: 'Note' },
      'tip:': { wrapper: 'bg-sky-900/20 border-sky-600/30', label: 'Tip' },
      'example:': { wrapper: 'bg-blue-900/20 border-blue-600/30', label: 'Example' },
      'key takeaway:': { wrapper: 'bg-emerald-900/20 border-emerald-600/30', label: 'Key Takeaway' },
      'exercise:': { wrapper: 'bg-amber-900/20 border-amber-600/30', label: 'Exercise' },
      'practice:': { wrapper: 'bg-amber-900/20 border-amber-600/30', label: 'Practice' },
      'question:': { wrapper: 'bg-violet-900/20 border-violet-600/30', label: 'Question' },
    };

    Array.from(container.querySelectorAll('p')).forEach((p) => {
      const raw = (p.textContent || '').trim();
      const lower = raw.toLowerCase();
      const key = Object.keys(calloutMap).find(k => lower.startsWith(k));
      if (!key) return;
      const cfg = calloutMap[key];

      // Extract remaining text after the prefix
      const content = raw.substring(key.length).trim();
      const box = document.createElement('div');
      box.className = `my-4 p-3 rounded-lg border ${cfg.wrapper}`;

      const title = document.createElement('div');
      title.className = 'text-xs font-semibold uppercase tracking-wide text-white/70 mb-1';
      title.textContent = cfg.label;

      const body = document.createElement('div');
      body.className = 'text-white/90';
      body.textContent = content;

      box.appendChild(title);
      box.appendChild(body);
      p.replaceWith(box);
    });

    return { formattedHtml: container.innerHTML, toc: tocItems };
  }, [lesson?.content]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 py-6">
      <div className="prose prose-invert max-w-none">
        {/* Content Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-white m-0">Lesson Content</h2>
        </div>

        {/* Main Content Area */}
        {lesson && formattedHtml ? (
          <article className="prose prose-invert max-w-none text-white/90 prose-headings:text-white prose-a:text-blue-300 hover:prose-a:text-blue-200 prose-strong:text-white prose-code:text-blue-200">
            {/* Contents */}
            {toc.length > 0 && (
              <aside className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Contents</div>
                <nav>
                  <ul className="m-0 p-0 list-none space-y-1">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-4' : 'pl-8'}>
                        <a href={`#${item.id}`} className="text-white/80 hover:text-white transition-colors">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
          </article>
        ) : (
          <div className="text-white/80 leading-relaxed space-y-4 pl-5">
            <p className="text-base">
              This is your generated lesson content. Summaries, key points, and interactive elements will appear here.
            </p>
            <div className="border-l-2 border-blue-500/30 pl-4 py-2">
              <p className="text-white/60 italic">
                &quot;Key concepts and explanations will be displayed in an easy-to-read format.&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-blue-300 text-sm font-semibold mb-2">Key Point 1</div>
                <div className="text-white/70 text-sm">Important concepts highlighted</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-blue-400 text-sm font-semibold mb-2">Key Point 2</div>
                <div className="text-white/70 text-sm">Easy to understand format</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
