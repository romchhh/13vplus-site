export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
            
            {/* Sizes Skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 w-12 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
            
            {/* Buttons Skeleton */}
            <div className="space-y-3">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* You Might Like Skeleton */}
        <div className="mt-16">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
