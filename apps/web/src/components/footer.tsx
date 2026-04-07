import React from 'react';
import Link from 'next/link';
import { Logo } from '@connecker/ui';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo light />
            <p className="text-sm text-slate-400 leading-relaxed">
              La plateforme immobiliere de reference. Trouvez votre bien ideal parmi des milliers d&apos;annonces verifiees.
            </p>
          </div>

          {/* Liens */}
          <div>
            <h3 className="text-white font-semibold mb-4">Rechercher</h3>
            <ul className="space-y-2.5">
              <li><Link href="/search?type=sale" className="text-sm hover:text-orange-400 transition-colors">Acheter</Link></li>
              <li><Link href="/search?type=rent" className="text-sm hover:text-orange-400 transition-colors">Louer</Link></li>
              <li><Link href="/search?property_type=apartment" className="text-sm hover:text-orange-400 transition-colors">Appartements</Link></li>
              <li><Link href="/search?property_type=house" className="text-sm hover:text-orange-400 transition-colors">Maisons</Link></li>
              <li><Link href="/search?property_type=land" className="text-sm hover:text-orange-400 transition-colors">Terrains</Link></li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm hover:text-orange-400 transition-colors">A propos</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-orange-400 transition-colors">Contact</Link></li>
              <li><Link href="/legal" className="text-sm hover:text-orange-400 transition-colors">Mentions legales</Link></li>
              <li><Link href="/privacy" className="text-sm hover:text-orange-400 transition-colors">Confidentialite</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <Phone size={15} className="text-orange-500" />
                <span>+221 XX XXX XX XX</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail size={15} className="text-orange-500" />
                <span>contact@connecker.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin size={15} className="text-orange-500 mt-0.5" />
                <span>Dakar, Senegal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Connec&apos;Ker. Tous droits reserves.
          </p>
          <div className="flex gap-6">
            <Link href="/legal" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">CGU</Link>
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">Confidentialite</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
