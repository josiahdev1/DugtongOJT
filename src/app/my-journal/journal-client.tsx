"use client";

import { useState } from "react";
import { Button, FileUpload, Pill } from "@/components/ui";
import { Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  label: string;
  done: boolean;
};

const INITIAL_TASKS: Task[] = [
  { id: "t1", label: "Build responsive pages in React", done: true },
  { id: "t2", label: "Integrate attendance REST API", done: false },
];

export function JournalClient({
  date = "Wed, Oct 14, 2026",
  initialHours = 8,
}: {
  date?: string;
  initialHours?: number;
}) {
  const [timeIn, setTimeIn] = useState("9:00 AM");
  const [timeOut, setTimeOut] = useState("6:00 PM");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [body, setBody] = useState(
    "Built the attendance table component and wired the filters."
  );
  const [toast, setToast] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleSave = () => {
    setToast("Journal draft saved successfully.");
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("Journal submitted for coordinator & supervisor approval.");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-3 shadow-lg text-sm text-foreground flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Phone Header Bar */}
      <div className="flex items-center justify-between rounded-[12px] border border-border bg-card px-4 py-3 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setBody("");
            setToast("Draft reset.");
            setTimeout(() => setToast(null), 2000);
          }}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <span className="text-base font-semibold text-foreground">
          Log journal
        </span>
        <button
          type="button"
          onClick={handleSave}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Date & Hours Card */}
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Date</div>
              <div className="text-sm font-medium text-foreground mt-0.5">{date}</div>
            </div>
            <Pill variant="trust">{initialHours} hrs</Pill>
          </div>
        </div>

        {/* Input Details Card */}
        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm flex flex-col gap-4">
          {/* Time In / Out */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Time in / out
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                aria-label="Time in"
                className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <input
                type="text"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                aria-label="Time out"
                className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Tasks from scope of work */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Tasks from scope of work
            </label>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-2.5 text-sm cursor-pointer select-none py-1 group"
                >
                  <span
                    className={cn(
                      "size-[18px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0",
                      task.done
                        ? "bg-primary border-primary text-white"
                        : "border-muted-foreground/30 group-hover:border-primary"
                    )}
                  >
                    {task.done && <Check className="size-3 stroke-[2.5]" />}
                  </span>
                  <span
                    className={cn(
                      task.done ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {task.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Daily reflection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              What did you do today?
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 500))}
              aria-label="Journal"
              rows={4}
              placeholder="Describe tasks completed, learnings, or blockers encountered"
              className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground font-mono">
              {body.length} / 500
            </div>
          </div>

          {/* Proof Upload */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Proof (optional)
            </label>
            <FileUpload
              accept="image/*,.pdf"
              maxSizeMB={5}
              hint="Screenshots, PR links, or task sign-offs"
              onFileSelect={(file) => setSelectedFile(file)}
            />
            {selectedFile && (
              <div className="mt-2 text-xs text-primary font-medium truncate">
                Selected: {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 text-sm font-medium"
        >
          Submit for approval
        </Button>
      </form>
    </div>
  );
}

