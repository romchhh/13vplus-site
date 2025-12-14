"use client";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "image" | "card" | "button";
  width?: string;
  height?: string;
  count?: number;
}

export default function SkeletonLoader({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const variantClasses = {
    text: "h-4 w-full",
    image: "aspect-[2/3] w-full",
    card: "h-64 w-full",
    button: "h-10 w-24",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-label="Завантаження..."
      role="status"
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonLoader variant="image" className="w-full" />
      <SkeletonLoader variant="text" className="h-5 w-3/4" />
      <SkeletonLoader variant="text" className="h-4 w-1/2" />
    </div>
  );
}

// Catalog grid skeleton
export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

