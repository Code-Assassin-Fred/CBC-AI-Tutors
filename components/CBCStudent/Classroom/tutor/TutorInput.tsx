"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface TutorInputProps {
  onSend: (text: string) => void;
}

export default function TutorInput({ onSend }: TutorInputProps) {
  const [text, setText] = useState('');

  const send = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-white/10">
      <div className="flex items-center gap-3 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && text.trim() && send()}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/20 text-white border-b border-transparent focus:border-white/20 transition-all py-1"
        />

        <button
          onClick={send}
          disabled={!text.trim()}
          className="shrink-0 text-white/40 hover:text-sky-400 disabled:text-white/10 transition-colors p-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-white/20 mt-2 font-bold">
        Interative AI • Operational
      </p>
    </div>
  );
}
