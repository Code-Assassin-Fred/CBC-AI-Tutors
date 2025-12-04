"use client";
import React, { useState, useEffect } from "react";

interface StrandSelectorProps {
  gradesData: Record<string, any>;
  onSelect: (selection: { grade: string; subject: string; strand: string }) => void;
}

export default function StrandSelector({ gradesData, onSelect }: StrandSelectorProps) {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [strand, setStrand] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [strands, setStrands] = useState<string[]>([]);

  // Update subjects when grade changes
  useEffect(() => {
    if (grade && gradesData[grade]) {
      setSubjects(Object.keys(gradesData[grade]));
      setSubject("");
      setStrands([]);
      setStrand("");
    }
  }, [grade, gradesData]);

  // Update strands when subject changes
  useEffect(() => {
    if (grade && subject && gradesData[grade][subject]) {
      setStrands(Object.keys(gradesData[grade][subject].Strands));
      setStrand("");
    }
  }, [grade, subject, gradesData]);

  // Notify parent when a full selection is made
  useEffect(() => {
    if (grade && subject && strand) {
      onSelect({ grade, subject, strand });
    }
  }, [grade, subject, strand, onSelect]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Grade</label>
        <select
          className="w-full border p-2 rounded"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="">Select Grade</option>
          {Object.keys(gradesData).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Subject</label>
        <select
          className="w-full border p-2 rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={!subjects.length}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Strand</label>
        <select
          className="w-full border p-2 rounded"
          value={strand}
          onChange={(e) => setStrand(e.target.value)}
          disabled={!strands.length}
        >
          <option value="">Select Strand</option>
          {strands.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
