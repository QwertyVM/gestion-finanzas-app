'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60 dark:bg-muted/40', className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Hero Card Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-card border border-border/80 rounded-xl p-3 space-y-2.5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="bg-card border border-border/80 rounded-xl p-3 space-y-2.5">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExecutiveDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-60" />
        </div>
        <Skeleton className="h-7 w-36" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-7 bg-card border border-border/80 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs p-4 space-y-3">
        <div className="flex justify-between pb-3 border-b border-border/60">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2.5">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
