// Shared loading skeleton shown instantly while any dashboard page loads
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar skeleton */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            <div className="w-32 h-5 bg-gray-100 rounded animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse hidden md:block" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="w-40 h-6 bg-gray-100 rounded animate-pulse" />
            <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="w-full h-32 bg-gray-100 rounded-lg animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="w-full h-10 bg-blue-100 rounded-lg animate-pulse" />
          </div>
          {/* Right card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="w-32 h-6 bg-gray-100 rounded animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
