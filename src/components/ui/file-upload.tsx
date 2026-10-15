"use client";

import * as React from "react";
import { UploadCloud, CheckCircle2, File } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  hint?: string;
  onFileSelect?: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  label = "Choose file",
  accept,
  maxSizeMB,
  hint,
  onFileSelect,
  className,
  disabled = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-dashed border-foreground/20 bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
        "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        disabled && "opacity-45 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <div className="flex items-center gap-2 truncate">
        {selectedFile ? (
          <>
            <File className="size-4 text-primary shrink-0" />
            <span className="truncate font-medium text-foreground">{selectedFile.name}</span>
          </>
        ) : (
          <>
            <UploadCloud className="size-4 text-muted-foreground shrink-0" />
            <span>{label}</span>
          </>
        )}
      </div>

      {selectedFile && (
        <span className="inline-flex items-center gap-1 text-xs text-success font-medium shrink-0">
          <CheckCircle2 className="size-3.5" />
          Ready
        </span>
      )}
    </div>
  );
}

