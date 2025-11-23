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
    <div className="space-y-4">
      {messages.map((m) => (
        <div 
          key={m.id} 
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[85%] ${
            m.role === 'assistant' 
              ? 'bg-[#7c3aed]/10 border border-[#7c3aed]/30' 
              : 'bg-white/5 border border-white/10'
          } rounded-2xl px-4 py-3 backdrop-blur-sm`}>
            {m.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#7c3aed] flex items-center justify-center text-[10px] font-bold">
                  AI
                </div>
                <span className="text-[10px] font-medium text-[#c4b5fd] uppercase tracking-wider">Tutor</span>
              </div>
            )}
            <div className="text-sm leading-relaxed text-white/90">{m.text}</div>
            <div className="text-[10px] text-white/40 mt-2">
              {m.role === 'assistant' ? 'Just now' : 'Sent'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
