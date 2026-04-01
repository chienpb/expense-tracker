import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal spending dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
