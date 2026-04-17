export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // We'll trust the Clerk auth wrapper or middleware for real routes,
  // but let's just make it a basic layout for now.
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
