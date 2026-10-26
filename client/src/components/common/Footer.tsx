import React from 'react';
import { HardHat, ShieldCheck, PhoneCall, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-xl font-black">
                Coo<span className="text-brand-500">Link</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering India&apos;s daily-wage workforce. Eliminating the morning struggle at
              railway stations, junctions, and bus stands by giving workers verified digital
              profiles, upfront wage transparency, and direct connection with local employers.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Govt ID Verified</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Kerala Focus (Malappuram, Calicut)</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">
              Local Trades
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Masonry / മേസ്തിരി പണി</li>
              <li>Tile & Granite Fitting / ടൈൽ വർക്ക്</li>
              <li>Electrical & Wiring / വയർമാൻ</li>
              <li>Plumbing & Sanitary / പ്ലംബിംഗ്</li>
              <li>Carpentry & Roofing / ആശാരി പണി</li>
              <li>Painting & Putty / പെയിന്റിംഗ്</li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">
              Safety & Helpline
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Toll-Free: 1800-COOLINK</span>
              </p>
              <p>Mon - Sat: 6:00 AM - 8:00 PM</p>
              <p className="text-xs text-slate-500">
                Zero commission platform for daily-wage workers.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CooLink Technologies. Built with pride for Kerala workforce.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
            <span>for dignified local employment</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
