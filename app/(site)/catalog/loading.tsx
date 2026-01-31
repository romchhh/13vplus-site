export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-white pt-20 px-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-6 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
        
        {/* Filters Skeleton */}
        <div className="mb-8 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
