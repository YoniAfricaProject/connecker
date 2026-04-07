import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/lib/auth-context';
import { LoginGate } from '@/components/login-gate';
import { AdminSidebar } from '@/components/sidebar';

const jost = Jost({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Connec'Ker - Administration",
  description: "Back-office d'administration",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={jost.className}>
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
