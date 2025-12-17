"use client";

import React from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface TutorChatProps {
  messages: Message[];
}

export default function TutorChat({ messages }: TutorChatProps) {
  return (
    <div className="space-y-8">
      {messages.map((m) => (
        <div
          key={m.id}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${m.role === 'assistant' ? 'text-sky-400' : 'text-white/40'
              }`}>
              {m.role === 'assistant' ? 'AI Tutor' : 'Student'}
            </span>
            <span className="text-[10px] text-white/10 uppercase tracking-widest font-mono">
              {m.role === 'assistant' ? 'Verified' : 'Log'}
            </span>
          </div>

          <div className="text-sm leading-relaxed text-white/80">
            {m.text}
          </div>

          <div className="pt-2 border-b border-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}
