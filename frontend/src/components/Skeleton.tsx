import React from 'react';

/**
 * Base Shimmer Element
 * Features pulse animation and smooth dark/light gradient
 */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-lg ${className}`}
    />
  );
};

/**
 * Stat Card Skeleton
 */
export const SkeletonStatCard: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton
 */
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden p-4 space-y-4 w-full">
      {/* Table Header shimmer */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex gap-4 py-2 border-b border-gray-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-3 border-b border-gray-50 dark:border-slate-800/50">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" style={{ opacity: 1 - r * 0.12 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Chart Skeleton
 */
export const SkeletonChart: React.FC<{ title?: string; height?: string }> = ({ title = 'Chart Loading', height = 'h-72' }) => {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4 w-full">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className={`${height} bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-6 flex items-end justify-between gap-3`}>
        {Array.from({ length: 8 }).map((_, i) => {
          const h = 25 + ((i * 37) % 65);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} />
              <Skeleton className="h-2.5 w-8" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Comprehensive Dashboard Skeleton Screen
 */
export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards */}
      <SkeletonStatCard count={4} />

      {/* Main Grid: Chart + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonChart height="h-72" />
          <SkeletonTable rows={4} cols={5} />
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 border border-gray-100 dark:border-slate-800 rounded-lg space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Model Detail Panel Skeleton (Specifically designed for the Predictions tab)
 */
export const SkeletonModelDetail: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full animate-fadeIn">
      {/* KPI Cards (2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-2 sm:space-y-3"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
            <Skeleton className="h-2.5 w-24 sm:w-32" />
          </div>
        ))}
      </div>

      {/* 2 Charts / Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonChart height="h-56 sm:h-64" />
        <SkeletonChart height="h-56 sm:h-64" />
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
};
