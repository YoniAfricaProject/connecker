import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: "Connec'Kër - Trouvez votre bien immobilier",
  description: "Plateforme immobilière au Sénégal. Achat, vente et location de biens immobiliers. Appartements, maisons, villas, terrains.",
  keywords: ['immobilier', 'Sénégal', 'Dakar', 'achat', 'location', 'appartement', 'maison', 'villa'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
