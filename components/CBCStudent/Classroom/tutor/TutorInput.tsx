"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useTutor } from '@/lib/context/TutorContext';
import { HiOutlineMicrophone } from 'react-icons/hi2';
import VoiceVisualization from '@/components/shared/VoiceVisualization';

interface TutorInputProps {
  onSend: (text: string) => void;
}

export default function TutorInput({ onSend }: TutorInputProps) {
  const { audio, startListening, stopListening, setAudioState } = useTutor();
  const [text, setText] = useState('');

  // Sync text with listening transcript
  useEffect(() => {
    if (audio.isListening && audio.transcript) {
      setText(audio.transcript);
    }
  }, [audio.isListening, audio.transcript]);

  const send = () => {
    if (text.trim()) {
      // Stop listening if active
      if (audio.isListening) {
        stopListening();
      }
      onSend(text.trim());
      setText('');
      // Clear transcript for next input
      setAudioState(prev => ({ ...prev, transcript: '' }));
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-white/10">
      <div className="flex items-center gap-3 py-2 bg-white/5 px-4 rounded-2xl border border-white/5">
        <button
          onClick={audio.isListening ? stopListening : startListening}
          className={`shrink-0 transition-colors p-2 rounded-xl ${audio.isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white'
            }`}
        >
          <HiOutlineMicrophone width={18} height={18} />
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && text.trim() && send()}
          placeholder={audio.isListening ? "Listening..." : "Ask me anything..."}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/20 text-white py-2"
        />

        {audio.isListening && (
          <div className="mr-2">
            <VoiceVisualization isActive={true} color="bg-red-500" />
          </div>
        )}

        <button
          onClick={send}
          disabled={!text.trim() || audio.isListening}
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
