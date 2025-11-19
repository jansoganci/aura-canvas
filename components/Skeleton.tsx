'use client';

import { FC } from 'react';

interface SkeletonProps {
  className?: string;
}

// Base skeleton with shimmer animation
export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

// Square image skeleton
export const SkeletonImage: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Skeleton className={`aspect-square rounded-2xl ${className}`} />
  );
};

// Text line skeleton
export const SkeletonText: FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const SkeletonCard: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 ${className}`}>
      <Skeleton className="h-6 w-1/3 mx-auto mb-4" />
      <Skeleton className="h-24 w-full mb-4" />
      <SkeletonText lines={2} />
    </div>
  );
};

// Button skeleton
export const SkeletonButton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Skeleton className={`h-12 w-full rounded-xl ${className}`} />
  );
};

// Color grid skeleton (for vote page)
export const SkeletonColorGrid: FC = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
};

// Full page loading skeleton for aura result
export const SkeletonAuraResult: FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <SkeletonImage className="mb-6" />
      <SkeletonCard className="mb-6" />
      <div className="space-y-3">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
};

// Full page loading skeleton for vote page
export const SkeletonVote: FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <SkeletonImage className="mb-6" />
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <Skeleton className="h-6 w-1/2 mx-auto mb-6" />
        <SkeletonColorGrid />
        <SkeletonButton className="mt-6" />
      </div>
    </div>
  );
};
