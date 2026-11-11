import React from 'react';
import { Users, Clock, Ticket, ShieldCheck, ArrowRight } from 'lucide-react';
import heroImg from '../assets/images/hero_emotopia.jpg';

interface HeroProps {
  totalQuota: number;
  totalBooked: number;
  remainingQuota: number;
  percentageUsed: number;
  onRegisterClick: () => void;
  onInfographicsClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalQuota,
  totalBooked,
  remainingQuota,
  percentageUsed,
  onRegisterClick,
  onInfographicsClick,
}) => {
  return (
    <section id="hero" className="relative pt-6 pb-12 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-950/40 via-amber-950/20 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
          {/* Left Column: Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              {/* Quiet unboxed kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-4">
                <span>Immersive Pavilion Experience</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>Early Bird Window Open</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">Strict Quota</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.08] mb-5 text-balance">
                Step Inside Emotopia:{' '}
                <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
                  The City of Emotions
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
                An experiential architectural journey navigating the human psyche. Register your
                private group (1–5 people) for an exclusive 30-minute immersive section inside the
                chambers. Limited early bird quota of {totalQuota} tickets with instant on-site QR pass.
              </p>
            </div>

            {/* CTAs and quick trust cues */}
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="px-6 py-3.5 text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 hover:from-amber-300 hover:to-rose-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Your 30-Min Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#experience"
                  className="px-5 py-3.5 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Explore Chambers</span>
                </a>

                {onInfographicsClick && (
                  <button
                    type="button"
                    onClick={onInfographicsClick}
                    className="px-5 py-3.5 text-sm font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>View Infographics & Map</span>
                  </button>
                )}
              </div>

              {/* Live Quota Indicator inline */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 max-w-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-neutral-400 font-medium">Early Bird Ticket Quota</span>
                  <span className="text-amber-400 font-semibold font-mono tabular-nums">
                    {remainingQuota} of {totalQuota} Remaining ({totalBooked} Claimed)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                  <span>Capacity: {totalQuota} Total Early Birds</span>
                  <span>Session Cap: Max 5 Attendees / 30 Min</span>
                  <span className="text-emerald-400">Guaranteed Entry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 min-h-[360px] lg:min-h-full flex items-center justify-center group shadow-xl">
            <img
              src={heroImg}
              onError={(e) => {
                e.currentTarget.src = '/images/hero_emotopia.jpg';
              }}
              alt="Night view of illuminated Emotopia architectural pavilions glowing in emotional color spectrums"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Measured gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/25 to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 p-3 bg-neutral-950/80 backdrop-blur-md rounded-xl border border-neutral-800/70 text-xs">
              <p className="font-semibold text-neutral-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>The Luminary Districts · Emotopia 2026</span>
              </p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Grand Exhibition Hall · Central Atrium
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Metric / Rule Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Overall Quota</span>
            </div>
            <p className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
              {totalQuota} <span className="text-sm font-normal text-neutral-400">Tickets Max</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Strict limit. Once reached, early bird passes close permanently.
            </p>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Users className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Group Quota</span>
            </div>
            <p className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
              1 – 5 <span className="text-sm font-normal text-neutral-400">People</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Up to 5 total attendees per 30-min section. Multiple groups can share remaining spots!
            </p>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Time Quota</span>
            </div>
            <p className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
              30 <span className="text-sm font-normal text-neutral-400">Minutes</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Dedicated time section. Choose your slot and enjoy uninterrupted flow.
            </p>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">On-Site Entry</span>
            </div>
            <p className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
              Instant <span className="text-sm font-normal text-neutral-400">QR Pass</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Instant digital barcode pass scanned at the gate upon arrival.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
