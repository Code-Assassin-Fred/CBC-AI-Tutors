"use client";

import { useState } from "react";

export default function Fields() {
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);

  return (
    <>
      <section>
        <div>
          {showThinking && !showHeadline && <p>thinking...</p>}
          {showHeadline && <h1>Learn at the speed of thought</h1>}
        </div>

        <p>AI-personalized courses, gamified lessons, and real-time feedback.</p>
      </section>

      <section>
        <div>
          {/* Empty – previously scroll-stacked cards */}
        </div>
      </section>
    </>
  );
}
