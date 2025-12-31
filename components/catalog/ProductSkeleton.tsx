export default function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {/* Image skeleton */}
      <div className="relative w-full aspect-[3/4] bg-gray-200 rounded"></div>
      
      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      
      {/* Price skeleton */}
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

