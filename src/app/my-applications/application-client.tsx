"use client";

import { useState } from "react";
import { Button, FileUpload, Modal, Pill, Stepper, ToastCard } from "@/components/ui";
import { FileText, CheckCircle2 } from "lucide-react";

type DocItem = {
  id: string;
  name: string;
  sub: string;
  status: "approved" | "pending" | "rejected";
  statusText: string;
};

const INITIAL_DOCS: DocItem[] = [
  {
    id: "d1",
    name: "Resume",
    sub: "resume-santos.pdf",
    status: "approved",
    statusText: "Approved",
  },
  {
    id: "d2",
    name: "Parent consent",
    sub: "Uploaded Sept 3",
    status: "approved",
    statusText: "Approved",
  },
  {
    id: "d3",
    name: "Medical certificate",
    sub: "Needs a clearer scan",
    status: "rejected",
    statusText: "Rejected",
  },
];

export function ApplicationClient() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUploadSuccess = () => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === "d3"
          ? {
              ...d,
              sub: "medical-cert-scan-v2.pdf",
              status: "pending",
              statusText: "Pending review",
            }
          : d
      )
    );
    setUploadModalOpen(false);
    setToastMessage("Medical certificate re-uploaded and queued for review.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-3 shadow-lg text-sm text-foreground flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Placement Tracker Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Web Development Intern
            </h2>
            <div className="text-xs text-muted-foreground mt-0.5">
              Iloilo IT Solutions Inc.
            </div>
          </div>
          <Pill variant="verified">Verified</Pill>
        </div>

        {/* 4-Stage Stepper */}
        <div className="mt-5 mb-2">
          <Stepper
            steps={[
              { label: "Applied", status: "completed" },
              { label: "Reviewed", status: "completed" },
              { label: "MOA", status: "current" },
              { label: "Deploy", status: "upcoming" },
            ]}
          />
        </div>
      </div>

      {/* Toast Banner */}
      <ToastCard
        title="MOA being signed."
        message="Your coordinator is waiting on the company's signature."
        accent="primary"
      />

      {/* Documents Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Documents
        </h3>
        <div className="divide-y divide-border text-[13px]">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="py-2.5 flex items-center justify-between gap-3 first:pt-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 truncate">
                  <div className="font-medium text-foreground">{doc.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.sub}
                  </div>
                </div>
              </div>
              <Pill variant={doc.status}>{doc.statusText}</Pill>
            </div>
          ))}
        </div>

        <Button
          variant="blueOutline"
          className="w-full mt-3.5 py-2 text-xs font-medium"
          onClick={() => setUploadModalOpen(true)}
        >
          Re-upload certificate
        </Button>
      </div>

      {/* Timeline Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Timeline
        </h3>
        <div className="divide-y divide-border text-[13px]">
          <div className="py-2.5 flex items-start gap-3 first:pt-0">
            <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Application reviewed</div>
              <div className="text-xs text-muted-foreground mt-0.5">Sept 8</div>
            </div>
          </div>

          <div className="py-2.5 flex items-start gap-3">
            <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Company accepted</div>
              <div className="text-xs text-muted-foreground mt-0.5">Sept 10</div>
            </div>
          </div>

          <div className="py-2.5 flex items-start gap-3 last:pb-0">
            <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">MOA sent for signature</div>
              <div className="text-xs text-muted-foreground mt-0.5">Sept 12</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        title="Re-upload Medical Certificate"
        description="Please provide a clear, high-resolution scan of your medical clearance certificate."
      >
        <div className="flex flex-col gap-4 py-2">
          <FileUpload
            accept=".pdf,image/*"
            maxSizeMB={5}
            hint="Valid formats: PDF, PNG, JPG (up to 5MB)"
            onFileSelect={() => {}}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUploadSuccess}
            >
              Upload document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

