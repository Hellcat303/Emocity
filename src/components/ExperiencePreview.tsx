import React from 'react';
import { Sparkles, Sun, Compass, Flame, Droplets, Heart } from 'lucide-react';
import experienceImg from '../assets/images/emotopia_experience.jpg';

export const ExperiencePreview: React.FC = () => {
  return (
    <section id="experience" className="py-16 border-t border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
            <span>The Journey Inside</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>4 Emotional Quadrants</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight text-balance">
            Four Emotional Chambers, One Continuous Journey
          </h2>
          <p className="text-neutral-400 text-base mt-3 leading-relaxed">
            During your 30-minute private reservation, your group journeys through interconnected
            spatial pavilions engineered with responsive projection surfaces, acoustic resonance,
            and light refraction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Showcase Card (Spans 2 columns) */}
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 min-h-[380px] group flex flex-col justify-end p-6 sm:p-8">
            <img
              src={experienceImg}
              onError={(e) => {
                e.currentTarget.src = '/images/emotopia_experience.jpg';
              }}
              alt="Visitors inside Emotopia interactive crystal mirror and emotional light prism chamber"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono mb-2">
                <span>CHAMBER 01</span>
                <span aria-hidden="true">·</span>
                <span>The Prismatic Atrium</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100 mb-2">
                Radiant Joy & Cosmic Wonder
              </h3>
              <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                Suspended geometric prisms react to the pulse and proximity of your party, scattering
                luminescent emotional spectrums across mirrors and mist.
              </p>
            </div>
          </div>

          {/* Chamber 2 */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-xs text-sky-400 font-mono mb-1">CHAMBER 02</div>
              <h3 className="font-display text-xl font-bold text-neutral-100 mb-2">
                The Echoing Rain Sanctum
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Deep contemplation, release, and calm. Acoustic water droplets resonate inside a soundproof
                dome tuned to therapeutic frequencies.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
              Intensity: Gentle · Mood: Meditative
            </div>
          </div>

          {/* Chamber 3 */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-xs text-rose-400 font-mono mb-1">CHAMBER 03</div>
              <h3 className="font-display text-xl font-bold text-neutral-100 mb-2">
                The Ignition Core
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Vibrant warmth, courage, and vitality. High-intensity kinetic light rings activate as
                your group moves together across tactile sensory pads.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
              Intensity: Dynamic · Mood: Passionate
            </div>
          </div>

          {/* Chamber 4 (Spans 2 columns on desktop) */}
          <div className="md:col-span-2 rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-indigo-950/30 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-xs text-indigo-400 font-mono mb-1">CHAMBER 04</div>
                <h3 className="font-display text-2xl font-bold text-neutral-100 mb-2">
                  The Synthesizer Pavilion (Catharsis & Reflection)
                </h3>
                <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                  The finale of your 30-minute block. Your group's shared emotional journey is
                  crystallized into a commemorative digital soundscape and printed aura reading.
                </p>
              </div>
              <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3 text-xs text-right shrink-0">
                <span className="text-amber-400 font-semibold block">Exclusive to Early Birds</span>
                <span className="text-neutral-400">Free Commemorative Aura Card</span>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
              <span>Duration: 30 minutes</span>
              <span aria-hidden="true">·</span>
              <span>Capacity: 1 group (up to 5 people)</span>
              <span aria-hidden="true">·</span>
              <span>Accessibility: All mobility friendly</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
