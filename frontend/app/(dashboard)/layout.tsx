import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
