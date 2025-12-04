"use client";
import React from "react";

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text = "Generating content..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}
