import React from 'react';
import { MapPin, Calendar, Clock, Ticket, Lock } from 'lucide-react';

interface FooterProps {
  onRegisterClick: () => void;
  onOrganizerClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRegisterClick, onOrganizerClick }) => {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-neutral-950 font-bold text-xs">
                E
              </span>
              <span className="font-display text-lg font-bold text-neutral-100 tracking-tight">
                EMOTOPIA
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              The City of Emotions. An immersive architectural exhibition featuring 30-minute private
              sensory sessions with dedicated capacity quotas and instant digital passes.
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="font-semibold uppercase tracking-wider text-neutral-200 text-xs">
              Event Details
            </div>
            <div className="flex items-start gap-2 text-neutral-400">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>November 20 – 22, 2026</span>
            </div>
            <div className="flex items-start gap-2 text-neutral-400">
              <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>10:00 AM – 7:00 PM Daily (30-min slots)</span>
            </div>
            <div className="flex items-start gap-2 text-neutral-400">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Grand Atrium, 100 Sensory Blvd, Arts District</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="font-semibold uppercase tracking-wider text-neutral-200 text-xs">
              Quick Navigation
            </div>
            <ul className="space-y-1.5">
              <li>
                <a href="#hero" className="hover:text-amber-400 transition-colors">
                  Top of Page
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-amber-400 transition-colors">
                  The Four Chambers
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-amber-400 transition-colors">
                  Time Quota Matrix
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOrganizerClick}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300"
                >
                  <Lock className="w-3 h-3 text-neutral-600" />
                  <span>Admin & Host Access</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quota Rules Notice */}
          <div className="space-y-2">
            <div className="font-semibold uppercase tracking-wider text-neutral-200 text-xs">
              Registration Policies
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Each reservation accommodates 1 to 5 people for a 30-minute block. Each registered
              attendee consumes 1 ticket from the official event early bird quota. Bring your QR pass on
              site for accelerated entrance.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Emotopia Experience Labs. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Non-transferable early bird passes</span>
            <span aria-hidden="true">·</span>
            <span>Live Quota & Session Controlled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
