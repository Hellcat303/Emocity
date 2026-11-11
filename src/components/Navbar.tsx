import React from 'react';
import { Sparkles, QrCode, ShieldCheck, Ticket } from 'lucide-react';

interface NavbarProps {
  onRegisterClick: () => void;
  onFindPassClick: () => void;
  onInfographicsClick?: () => void;
  remainingQuota: number;
  isAdminAuthenticated?: boolean;
  onAdminClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRegisterClick,
  onFindPassClick,
  onInfographicsClick,
  remainingQuota,
  isAdminAuthenticated,
  onAdminClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a href="#hero" className="flex items-center gap-2 group text-neutral-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-neutral-950 font-bold text-sm tracking-wider shadow-sm shadow-amber-500/20">
            E
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            EMOTOPIA
          </span>
        </a>

        {/* Zone 2: clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <a
            href="#experience"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Chambers
          </a>
          <a
            href="#schedule"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Schedule & Quota
          </a>
          {onInfographicsClick && (
            <button
              type="button"
              onClick={onInfographicsClick}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-neutral-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Infographics & Guide</span>
            </button>
          )}
          <button
            type="button"
            onClick={onFindPassClick}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-neutral-300"
          >
            <QrCode className="w-4 h-4 text-neutral-400" />
            <span>Find My Pass</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminAuthenticated && onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="px-2.5 py-1.5 text-xs font-mono font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRegisterClick}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 rounded-lg hover:from-amber-300 hover:to-rose-300 transition-all duration-200 shadow-md shadow-amber-500/15 cursor-pointer whitespace-nowrap shrink-0 active:scale-98 flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Register Early Bird</span>
          </button>
        </div>
      </div>
    </header>
  );
};
