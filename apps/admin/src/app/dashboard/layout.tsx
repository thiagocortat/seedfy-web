import { Sidebar } from '../../components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pl-64">
      <Sidebar />
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
