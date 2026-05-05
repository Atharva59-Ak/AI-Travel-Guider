import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ 
  className = "", 
  variant = "text",
  width,
  height 
}: SkeletonProps) {
  const baseClasses = "skeleton relative overflow-hidden";
  
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded",
    rounded: "rounded-lg",
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  );
}

// Pre-built skeleton layouts for common use cases
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <Skeleton variant="circular" width={64} height={64} className="mb-4" />
      <Skeleton className="w-3/4 mb-2" />
      <Skeleton className="w-1/2 mb-4" />
      <Skeleton className="w-full mb-2" />
      <Skeleton className="w-2/3" />
    </div>
  );
}

export function ImageSkeleton() {
  return (
    <div className="relative">
      <Skeleton variant="rounded" className="w-full h-48" />
      <div className="mt-3 space-y-2">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-1/2" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-1/3" />
        <Skeleton className="w-1/4" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="rounded" width={80} height={80} />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="w-1/2 mb-2" />
          <Skeleton className="w-3/4 mb-4" height="2rem" />
          <Skeleton className="w-full" />
        </div>
      ))}
    </div>
  );
}
