import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: "Connec'Ker - Administration",
  description: 'Back-office d\'administration de la plateforme.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <AdminSidebar />
        <main className="ml-64 min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
