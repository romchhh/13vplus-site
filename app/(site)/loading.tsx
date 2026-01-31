export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="h-screen bg-gradient-to-b from-gray-200 to-gray-100 animate-pulse" />
      
      {/* Categories Skeleton */}
      <div className="max-w-[1920px] mx-auto px-6 py-16">
        <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-8 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 h-[500px] bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-[1920px] mx-auto px-6 py-16 space-y-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
