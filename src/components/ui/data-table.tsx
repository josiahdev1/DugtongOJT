"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  filterTabs?: {
    id: string;
    label: string;
    count?: number;
  }[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Nothing in this queue",
  emptyIcon,
  filterTabs,
  activeFilter,
  onFilterChange,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc" ? 1 : -1;
    });
  }, [data, sortKey, sortOrder]);

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] overflow-hidden",
        className,
      )}
    >
      {/* Optional Top Filter Tabs */}
      {filterTabs && filterTabs.length > 0 && (
        <div className="flex items-center justify-between border-b border-border p-3 sm:px-4">
          <div className="inline-flex gap-0.5 rounded-[8px] bg-surface p-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onFilterChange && onFilterChange(tab.id)}
                  className={cn(
                    "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                    isActive
                      ? "bg-card text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1.5 font-mono text-xs opacity-75">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Scroll Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface text-left">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-border",
                      col.sortable && "cursor-pointer hover:text-primary select-none",
                      col.className,
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted-foreground/60">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="size-3 text-primary" />
                            ) : (
                              <ArrowDown className="size-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              // Shimmer skeleton state
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-3 py-3">
                      <div className="h-3 w-4/5 rounded bg-gradient-to-r from-surface via-muted-foreground/15 to-surface animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon || (
                      <div className="size-10 rounded-full bg-surface grid place-items-center text-primary-soft">
                        <ArrowUpDown className="size-5" />
                      </div>
                    )}
                    <span className="text-[13px] font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Real data rows
              sortedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="transition-colors hover:bg-[#F6F9FF] dark:hover:bg-[#14203A]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3 py-2.5 leading-5 whitespace-nowrap text-foreground",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

