import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '@/lib/auth-context';
import { LoginGate } from '@/components/login-gate';
import { AdminSidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: "Connec'Ker - Administration",
  description: "Back-office d'administration",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <AdminAuthProvider>
          <LoginGate>
            <AdminSidebar />
            <main className="ml-64 min-h-screen p-8">{children}</main>
          </LoginGate>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
