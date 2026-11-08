export default function DashboardProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded w-32 animate-pulse" />
      </div>
      <div className="border rounded-lg">
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-8 bg-gray-100 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
