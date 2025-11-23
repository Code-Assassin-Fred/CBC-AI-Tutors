"use client";

import React, { useState } from 'react';
import TutorChat from '@/components/CBCStudent/Classroom/tutor/TutorChat';
import TutorInput from '@/components/CBCStudent/Classroom/tutor/TutorInput';
import { tutorChat } from '@/lib/api';
import { useAuth } from '@/lib/hooks';

export default function TutorPanel() {
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; text: string }>>([]);

  const { user } = useAuth();

  const handleSendMessage = async (text: string) => {
    const newMessage = {
      id: Date.now(),
      role: 'user' as const,
      text: text
    };
    setMessages((prev) => [...prev, newMessage]);
    try {
      const token = await user?.getIdToken();
      const res = await tutorChat(text, undefined, token || undefined);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: res.reply },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: 'Sorry, I had trouble responding. Please try again.' },
      ]);
    }
  };

  return (
  <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
      {/* Simple header label with quick actions */}
      <div className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/70">Your Personal AI Tutor</h3>
          <div className="flex items-center gap-3 text-xs">
            <a href="#quiz" className="text-blue-400 hover:text-blue-300 underline">
              Quiz
            </a>
            <a href="#practice" className="text-purple-400 hover:text-purple-300 underline">
              Practice
            </a>
            <a href="#summary" className="text-green-400 hover:text-green-300 underline">
              Summary
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-4 space-y-4 min-h-0 pr-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40 text-sm text-center px-4">
            <p>Ask a question to get started with your AI tutor</p>
          </div>
        ) : (
          <TutorChat messages={messages} />
        )}
      </div>
      {/* Input bar at bottom */}
      <div className="mt-2">
        <TutorInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
