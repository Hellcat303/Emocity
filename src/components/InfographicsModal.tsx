import React, { useState } from 'react';
import { X, Sparkles, MapPin, Compass, Clock, Users, ShieldAlert, Download, Layers } from 'lucide-react';
import experienceImg from '../assets/images/emotopia_experience.jpg';
import heroImg from '../assets/images/hero_emotopia.jpg';

interface InfographicsModalProps {
  onClose: () => void;
}

export const InfographicsModal: React.FC<InfographicsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'guidelines' | 'chambers'>('flow');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-neutral-950 font-bold text-sm">
              E
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-neutral-100">
                  EMOTOPIA INFOGRAPHICS & GUIDE
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Exhibition Overview
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Official visual breakdown, floor plan flow, and attendee session instructions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close infographics modal"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 px-6 py-3 bg-neutral-950/40 border-b border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flow'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pavilion Flow & Spatial Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chambers')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chambers'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Chambers Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Attendee Rules & Quota Specs</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'flow' && (
            <div className="space-y-6">
              {/* Visual Infographic Diagram Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-display text-sm font-bold text-neutral-100 uppercase tracking-wide">
                      The Continuous Emotopia Loop (30-Minute Allocation)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Grand Atrium Layout
                  </span>
                </div>

                {/* Illustrated Flow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/20 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">01 · MIN 00–07</div>
                      <div className="font-bold text-neutral-100 text-sm mb-1">The Prismatic Atrium</div>
                      <p className="text-neutral-400 text-[11px]">
                        Luminescent crystalline mirrors react to group proximity. Awakening joy.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-amber-300">
                      Spectrum: Gold & Violet
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-sky-500/20 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-sky-400 font-bold mb-1">02 · MIN 08–15</div>
                      <div className="font-bold text-neutral-100 text-sm mb-1">Echoing Rain Sanctum</div>
                      <p className="text-neutral-400 text-[11px]">
                        Acoustic water drops tuned to therapeutic resonance frequencies. Deep calm.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-sky-300">
                      Spectrum: Azure Blue
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-rose-500/20 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-rose-400 font-bold mb-1">03 · MIN 16–23</div>
                      <div className="font-bold text-neutral-100 text-sm mb-1">The Ignition Core</div>
                      <p className="text-neutral-400 text-[11px]">
                        Kinetic light rings responding to collective rhythmic steps. Courage & passion.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-rose-300">
                      Spectrum: Crimson & Ruby
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-indigo-500/20 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-indigo-400 font-bold mb-1">04 · MIN 24–30</div>
                      <div className="font-bold text-neutral-100 text-sm mb-1">Synthesizer Pavilion</div>
                      <p className="text-neutral-400 text-[11px]">
                        Catharsis synthesis and printed commemorative aura card distribution.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-indigo-300">
                      Spectrum: Deep Indigo
                    </div>
                  </div>
                </div>

                {/* Banner calling out user's infographics */}
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-neutral-200">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Have Your Own School / Event Infographic?</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Yes! Please share your infographic or poster image files with us. We will showcase them prominently in this viewer so your teacher, classmates, and visitors can explore your custom graphics!
                  </p>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-neutral-800 h-52 group">
                  <img
                    src={heroImg}
                    onError={(e) => { e.currentTarget.src = '/images/hero_emotopia.jpg'; }}
                    alt="Emotopia Architectural Rendering"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-end">
                    <div className="font-bold text-neutral-100">Pavilion Exterior Architecture</div>
                    <div className="text-[10px] text-amber-400">Atmospheric Light Dome</div>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-neutral-800 h-52 group">
                  <img
                    src={experienceImg}
                    onError={(e) => { e.currentTarget.src = '/images/emotopia_experience.jpg'; }}
                    alt="Chamber Interior Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-end">
                    <div className="font-bold text-neutral-100">Interactive Prism Interior</div>
                    <div className="text-[10px] text-rose-400">Chamber 01 Live Environment</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chambers' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <h4 className="font-bold text-neutral-100 text-sm mb-2 text-amber-400">
                  Detailed Chamber Specifications
                </h4>
                <div className="space-y-3 text-neutral-300">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-100">Chamber 01: Joy & Cosmic Wonder</div>
                    <p className="text-neutral-400 mt-1">
                      Sensor-driven prisms and mirrors refract warm golden wavelengths. Responds to vocal resonance and group harmony.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-100">Chamber 02: Serenity & Reflection</div>
                    <p className="text-neutral-400 mt-1">
                      Sound-isolated sanctuary with laminar water droplets. Binaural ambient soundscape tuned to 432 Hz.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-100">Chamber 03: Passion & Drive</div>
                    <p className="text-neutral-400 mt-1">
                      Thermal projection mapping that accelerates with movement and biometric rhythm.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-100">Chamber 04: Cathartic Synthesis</div>
                    <p className="text-neutral-400 mt-1">
                      Final unified dome combining the emotional inputs of your party into a personalized harmonic chord.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Important Visitor Guidelines</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-200 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Arrival Window</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      Arrive at least 10 minutes prior to your booked 30-minute block for rapid QR scanner verification.
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="font-semibold text-neutral-200 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>Capacity & Sharing</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      Each 30-minute session accommodates up to 5 attendees total. Groups can share remaining spots within the same time window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-400">
            Emotopia: The City of Emotions · Interactive Exhibition
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
