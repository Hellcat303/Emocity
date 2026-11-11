import React, { useState } from 'react';
import { X, Search, QrCode, AlertCircle, ArrowRight } from 'lucide-react';
import { Booking } from '../utils/bookingLogic.ts';

interface FindPassModalProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onClose: () => void;
}

export const FindPassModal: React.FC<FindPassModalProps> = ({
  bookings,
  onSelectBooking,
  onClose,
}) => {
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    const match = bookings.find(
      (b) =>
        b.reference.toUpperCase() === clean ||
        b.leadEmail.toUpperCase() === clean ||
        b.leadName.toUpperCase().includes(clean)
    );

    if (match) {
      onSelectBooking(match);
      onClose();
    } else {
      setError('No registration found for that reference code or email address.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-display text-lg font-bold text-neutral-100">
              Find My Early Bird Pass
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close find pass modal"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-6">
          Enter your 6-character Pass Reference (e.g. <span className="text-amber-400 font-mono">EMO-8R2Q-26</span>)
          or the primary email used when booking.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="EMO-XXXX-26 or your@email.com"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError(null);
              }}
              className="w-full pl-10 pr-4 py-3 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 hover:from-amber-300 hover:to-rose-300 text-neutral-950 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-500/15"
          >
            <span>Retrieve Digital Pass</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick sample references for demo test convenience */}
        <div className="mt-6 pt-4 border-t border-neutral-800">
          <div className="text-[11px] text-neutral-500 mb-2">Sample active passes to try:</div>
          <div className="flex flex-wrap gap-2">
            {bookings.slice(0, 3).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onSelectBooking(b);
                  onClose();
                }}
                className="text-[11px] font-mono px-2 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded cursor-pointer"
              >
                {b.reference} ({b.leadName.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
