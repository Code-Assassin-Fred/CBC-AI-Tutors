"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Sparkles, BookOpen } from "lucide-react";

interface AddCourseModalProps {
  children: React.ReactNode;
}

export function AddCourseModal({ children }: AddCourseModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choice" | "manual" | "ai">("choice");

  const handleReset = () => {
    setMode("choice");
  };

  const handleClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset to choice mode when closing
      setTimeout(() => setMode("choice"), 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/10 text-white">
        {mode === "choice" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white/95 text-2xl">Create a New Course</DialogTitle>
              <p className="text-[#9aa6b2] text-sm mt-2">
                Choose how you'd like to create your learning journey
              </p>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <button
                onClick={() => setMode("ai")}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] transition-all border border-white/10 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Generate with AI</h3>
                    <p className="text-sm text-white/80">
                      Let AI create a personalized course based on your goals and learning style
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("manual")}
                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <BookOpen className="h-5 w-5 text-[#9aa6b2]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white/95 mb-1">Create Manually</h3>
                    <p className="text-sm text-[#9aa6b2]">
                      Build your course from scratch with full control over content
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === "manual" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white/95">Create Course Manually</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle manual course creation
                console.log("Creating manual course...");
                setOpen(false);
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/90">Course Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Advanced Algebra"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-white/90">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe what students will learn in this course..."
                  required
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                >
                  Create Course
                </Button>
              </div>
            </form>
          </>
        )}

        {mode === "ai" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white/95">Generate Course with AI</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle AI course generation
                console.log("Generating AI course...");
                setOpen(false);
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white/90">What do you want to learn?</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Quantum Physics, Creative Writing"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-white/90">Your Current Level</Label>
                <select
                  id="level"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
                >
                  <option value="" disabled className="bg-[#0b1113]">Select your level</option>
                  <option value="beginner" className="bg-[#0b1113]">Beginner - Just starting out</option>
                  <option value="intermediate" className="bg-[#0b1113]">Intermediate - Some experience</option>
                  <option value="advanced" className="bg-[#0b1113]">Advanced - Strong foundation</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="text-white/90">Learning Goals (Optional)</Label>
                <Textarea
                  id="goals"
                  placeholder="What do you hope to achieve with this course?"
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Course
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
