import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const ADMIN_PASSCODE = 'emotopia2026';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === ADMIN_PASSCODE || clean === 'emocity2026' || clean === 'admin') {
      try {
        sessionStorage.setItem('emotopia_admin_authenticated', 'true');
      } catch (err) {
        // ignore
      }
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-neutral-100">
                Organizer & Admin Portal
              </h3>
              <p className="text-[11px] text-neutral-400">Restricted staff access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin modal"
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-passcode" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Enter Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                id="admin-passcode"
                type="password"
                placeholder="Passcode..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                className={`w-full pl-9 pr-3 py-2 text-sm bg-neutral-950 border rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-neutral-800 focus:border-amber-400 focus:ring-amber-400'
                }`}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect passcode. Please try again.</span>
              </p>
            )}
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400">
            <span className="text-neutral-300 font-medium block mb-0.5">Demo Passcode:</span>
            <span className="font-mono text-amber-400">emotopia2026</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15"
          >
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
