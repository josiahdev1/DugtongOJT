"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Progress = { name: string; percent: number };
type Weekly = { day: string; hours: number };

export function DashboardCharts({ approved, pending, progress, weekly, error }: { approved: number; pending: number; progress: Progress[]; weekly: Weekly[]; error?: boolean }) {
  const total = approved + pending;
  const hasProgress = progress.length > 0;
  const hasWeekly = weekly.some((day) => day.hours > 0);
  const state = error ? "We could not load chart data." : "No hours data yet.";

  return <section className="grid gap-4 xl:grid-cols-2" aria-label="Roster insights">
    <Card>
      <CardHeader><CardTitle>Hours status</CardTitle><CardDescription>Approved and pending hours across the roster.</CardDescription></CardHeader>
      <CardContent className="h-48">
        {error || total === 0 ? <EmptyChart message={state} /> : <><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: "Approved", value: approved }, { name: "Pending", value: pending }]} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="78%" isAnimationActive={false}>{["var(--primary)", "var(--warning)"].map((fill) => <Cell key={fill} fill={fill} />)}</Pie><Tooltip formatter={(value) => `${value} hours`} /></PieChart></ResponsiveContainer><p className="sr-only">{approved} approved hours and {pending} pending hours.</p><p className="text-center text-xs text-muted-foreground">{approved} approved · {pending} pending hours</p></>}
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Weekly approved hours</CardTitle><CardDescription>Approved entries from the last seven days.</CardDescription></CardHeader>
      <CardContent className="h-48">
        {error || !hasWeekly ? <EmptyChart message={state} /> : <><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly}><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} /><YAxis hide /><Tooltip formatter={(value) => `${value} hours`} /><Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer><p className="sr-only">{weekly.map((day) => `${day.day}: ${day.hours} hours`).join(", ")}</p></>}
      </CardContent>
    </Card>
    <Card className="xl:col-span-2">
      <CardHeader><CardTitle>Student progress</CardTitle><CardDescription>Approved hours as a percentage of each student&apos;s requirement.</CardDescription></CardHeader>
      <CardContent>
        {error || !hasProgress ? <EmptyChart message={state} /> : <div className="grid gap-3">{progress.map((student) => { const color = student.percent >= 100 ? "bg-success" : student.percent < 30 ? "bg-warning" : "bg-primary"; return <div key={student.name} className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-3 text-sm"><span className="truncate">{student.name}</span><span className="text-right text-xs tabular-nums text-muted-foreground">{student.percent}%</span><div className="col-span-2 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label={`${student.name}: ${student.percent}% complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={student.percent}><div className={`h-full rounded-full ${color}`} style={{ width: `${student.percent}%` }} /></div></div>; })}</div>}
      </CardContent>
    </Card>
  </section>;
}

function EmptyChart({ message }: { message: string }) { return <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">{message}</div>; }
