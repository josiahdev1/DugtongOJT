"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DailyHours = {
  date: string;
  displayDate: string;
  hours: number;
};

export type WeeklyThroughput = {
  week: string;
  schools: number;
  companies: number;
};

export type WeeklyEscalation = {
  week: string;
  count: number;
};

interface TooltipPayloadItem {
  value: number;
  name: string;
  color?: string;
}

function CustomHoursTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-0.5 font-semibold text-primary">
          {payload[0].value} approved hrs
        </p>
      </div>
    );
  }
  return null;
}

function CustomVerificationsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md space-y-1">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((item) => (
          <p key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span>{item.name}:</span>
            <strong className="text-foreground">{item.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CustomEscalationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-0.5 font-semibold text-amber-500">
          {payload[0].value} open escalations
        </p>
      </div>
    );
  }
  return null;
}

/**
 * 1. HOURS LOGGED OVER TIME
 * Compact space-maximizing card with 180px chart height.
 */
export function AdminHoursChart({ data }: { data: DailyHours[] }) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const avgHoursPerDay = data.length > 0 ? (totalHours / data.length).toFixed(1) : "0.0";

  return (
    <Card className="rounded-[12px] border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
        <div>
          <CardTitle className="text-[14px] font-semibold text-foreground">
            Hours logged over time
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Approved OJT hours across all partner schools (30 days)
          </p>
        </div>
        <span className="text-[11px] font-medium font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {totalHours} hrs total
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="h-[180px] w-full" aria-label="Line chart showing approved hours over the last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval={4}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomHoursTooltip />} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>Daily avg: <strong className="font-medium text-foreground">{avgHoursPerDay} hrs</strong></span>
          <span>Window: <strong className="font-medium text-foreground">30 days</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 2. VERIFICATIONS THROUGHPUT
 * Compact space-maximizing bar chart with 180px height.
 */
export function AdminVerificationsChart({ data }: { data: WeeklyThroughput[] }) {
  const totalVerified = data.reduce((sum, d) => sum + d.schools + d.companies, 0);

  return (
    <Card className="rounded-[12px] border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
        <div>
          <CardTitle className="text-[14px] font-semibold text-foreground">
            Verification throughput
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schools and companies verified per week (8 weeks)
          </p>
        </div>
        <span className="text-[11px] font-medium font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {totalVerified} verified
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {/* Legend */}
        <div className="mb-2 flex items-center justify-end gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs bg-primary" aria-hidden="true" />
            <span className="text-muted-foreground">Schools</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs bg-[#0EA5A5]" aria-hidden="true" />
            <span className="text-muted-foreground">Companies</span>
          </div>
        </div>

        <div className="h-[155px] w-full" aria-label="Bar chart showing weekly verification throughput">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomVerificationsTooltip />} />
              <Bar
                dataKey="schools"
                name="Schools verified"
                fill="var(--primary)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="companies"
                name="Companies verified"
                fill="#0EA5A5"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>Weekly pace: <strong className="font-medium text-foreground">{(totalVerified / 8).toFixed(1)} / wk</strong></span>
          <span>Window: <strong className="font-medium text-foreground">8 weeks</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 3. ESCALATION TREND SPARKLINE
 * Compact 60px sparkline designed for the Escalations card.
 */
export function AdminEscalationSparkline({
  data,
  currentCount,
}: {
  data: WeeklyEscalation[];
  currentCount: number;
}) {
  const previousWeeksCount = data.slice(0, -1).reduce((sum, d) => sum + d.count, 0);
  const avgPast = data.length > 1 ? previousWeeksCount / (data.length - 1) : 0;
  const recent = data[data.length - 1]?.count ?? 0;

  const trendDirection =
    recent > avgPast
      ? "trending upward"
      : recent < avgPast
        ? "trending downward"
        : "stable";

  return (
    <div className="flex flex-col gap-1" aria-label="Escalation trend sparkline">
      <div className="h-[54px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Tooltip content={<CustomEscalationTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#F59E0B" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-1.5 text-[11px] text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">
          {currentCount} {currentCount === 1 ? "active issue" : "active issues"}
        </span>
        <span className="font-medium capitalize text-amber-500">
          {trendDirection}
        </span>
      </div>
    </div>
  );
}
