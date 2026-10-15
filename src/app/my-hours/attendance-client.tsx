"use client";

import { useEffect, useState } from "react";
import { Button, Pill, ProgressBar } from "@/components/ui";
import { Clock, MapPin, CheckCircle, Play } from "lucide-react";

type AttendanceRecord = {
  id: string;
  day: string;
  timeRange: string;
  hours: string;
  status: "approved" | "pending" | "rejected";
  statusText: string;
};

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: "r1",
    day: "Mon, Oct 12",
    timeRange: "9:00 – 6:00",
    hours: "8 hrs",
    status: "approved",
    statusText: "Approved",
  },
  {
    id: "r2",
    day: "Tue, Oct 13",
    timeRange: "9:02 – 6:01",
    hours: "8 hrs",
    status: "approved",
    statusText: "Approved",
  },
  {
    id: "r3",
    day: "Wed, Oct 14",
    timeRange: "9:00 – now",
    hours: "4.2 hrs",
    status: "pending",
    statusText: "In progress",
  },
];

export function AttendanceClient({
  companyName = "Iloilo IT Solutions Inc.",
  initialApprovedHours = 320,
  requiredHours = 486,
}: {
  companyName?: string;
  initialApprovedHours?: number;
  requiredHours?: number;
}) {
  const [currentTime, setCurrentTime] = useState<string>("04:12:36");
  const [isTimedIn, setIsTimedIn] = useState<boolean>(true);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [toast, setToast] = useState<string | null>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeToggle = () => {
    if (isTimedIn) {
      setIsTimedIn(false);
      setToast("Timed out successfully at " + currentTime);
      setRecords((prev) =>
        prev.map((r, i) =>
          i === prev.length - 1
            ? { ...r, timeRange: "9:00 – " + currentTime, statusText: "Pending approval" }
            : r
        )
      );
    } else {
      setIsTimedIn(true);
      setToast("Timed in successfully at " + currentTime);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const remainingHours = Math.max(0, requiredHours - initialApprovedHours);
  const remainingDays = Math.ceil(remainingHours / 8);

  return (
    <div className="mx-auto w-full max-w-[375px] flex flex-col gap-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-3 shadow-lg text-sm text-foreground flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Clock Card */}
      <div className="rounded-[12px] border border-border bg-card p-5 text-center shadow-sm">
        <div className="text-xs text-muted-foreground font-medium">
          Wednesday, Oct 14
        </div>
        <div className="my-2 font-mono text-[40px] font-semibold tracking-tight text-foreground tabular-nums">
          {currentTime}
        </div>
        <div className="text-xs text-muted-foreground">
          {isTimedIn
            ? `Time in at 9:00 AM · ${companyName}`
            : `Currently off-duty · ${companyName}`}
        </div>

        {/* Location & Presence verification pills */}
        <div className="my-3 flex items-center justify-center gap-2">
          {isTimedIn ? (
            <>
              <Pill variant="approved">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                On site
              </Pill>
              <Pill variant="verified">
                <MapPin className="size-3" />
                Location verified
              </Pill>
            </>
          ) : (
            <Pill variant="pending">Not clocked in</Pill>
          )}
        </div>

        {/* Action Button: Time out / Time in */}
        {isTimedIn ? (
          <Button
            variant="destructive"
            className="w-full py-2.5"
            onClick={handleTimeToggle}
          >
            <Clock className="size-4 mr-2" />
            Time out
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full py-2.5"
            onClick={handleTimeToggle}
          >
            <Play className="size-4 mr-2" />
            Time in
          </Button>
        )}
      </div>

      {/* This Week History Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          This week
        </h3>
        <div className="divide-y divide-border text-[13px]">
          {records.map((r) => (
            <div
              key={r.id}
              className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div>
                <div className="font-medium text-foreground">{r.day}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {r.timeRange}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-foreground font-medium">
                  {r.hours}
                </span>
                <Pill variant={r.status}>{r.statusText}</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Progress Card */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Total progress</span>
          <span className="font-mono text-foreground font-medium">
            {initialApprovedHours} / {requiredHours} hrs
          </span>
        </div>
        <ProgressBar
          value={initialApprovedHours}
          max={requiredHours}
          color="primary"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          {remainingHours} hrs left · about {remainingDays} working days
        </div>
      </div>
    </div>
  );
}
