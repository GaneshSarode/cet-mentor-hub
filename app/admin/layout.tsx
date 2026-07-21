import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // Check if user is authenticated and in the admin allowlist
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

  if (!userId || !adminIds.includes(userId)) {
    redirect('/');
  }

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
