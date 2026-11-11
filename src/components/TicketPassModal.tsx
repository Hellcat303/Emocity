import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  Calendar,
  Copy,
  Check,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Booking } from '../utils/bookingLogic.ts';

interface TicketPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ booking, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!booking) return;

    // Generate real QR code image
    const payload = JSON.stringify({
      ref: booking.reference,
      id: booking.id,
      name: booking.leadName,
      size: booking.groupSize,
      slot: booking.slotTime,
      date: booking.slotDate,
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [booking]);

  if (!booking) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Emotopia//City of Emotions Event//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Emotopia: The City of Emotions (${booking.slotTime})`,
      `DESCRIPTION:Early bird pass for ${booking.leadName} (${booking.groupSize} attendees). Reference: ${booking.reference}. Arrive 10 minutes before your 30-minute session.`,
      'LOCATION:Emotopia Grand Atrium, 100 Sensory Boulevard, Metropolitan Arts District',
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `emotopia-pass-${booking.reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Official On-Site Entry Pass
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pass modal"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Card Top Branding */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                EMOTOPIA · CITY OF EMOTIONS
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-100 tracking-tight mt-0.5">
                Early Bird Group Pass
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Admit group of {booking.groupSize} · 30-Minute Immersion
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {booking.status === 'checked_in' ? 'CHECKED IN' : 'CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Reference Banner */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Pass Reference</div>
              <div className="font-mono text-lg font-bold text-amber-400 tracking-wider">
                {booking.reference}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg flex items-center gap-1.5 cursor-pointer no-print"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Time & Location details */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950/40 rounded-2xl border border-neutral-800/80 text-xs">
            <div>
              <span className="text-neutral-400 block flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Reserved Time Quota</span>
              </span>
              <span className="font-medium text-neutral-100 block">{booking.slotDate}</span>
              <span className="font-mono text-amber-400 font-semibold">{booking.slotTime}</span>
            </div>
            <div>
              <span className="text-neutral-400 block flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Venue Gate</span>
              </span>
              <span className="font-medium text-neutral-100 block">Grand Atrium</span>
              <span className="text-neutral-400">West Wing Check-in</span>
            </div>
          </div>

          {/* Attendees List */}
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Attendees ({booking.groupSize} Total)</span>
              <span className="text-[11px] text-neutral-500 font-normal">Primary: {booking.leadName}</span>
            </div>
            <div className="space-y-1.5">
              {booking.attendees.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-2 bg-neutral-950/60 rounded-xl border border-neutral-800/60"
                >
                  <span className="font-medium text-neutral-200">
                    {idx + 1}. {att.name || `Guest #${idx + 1}`}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {att.emotionalAura || 'Radiant Joy'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real QR Code Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-neutral-900 shadow-inner">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`QR code for booking ${booking.reference}`}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 font-mono">
                Generating QR...
              </div>
            )}
            <div className="text-center mt-3">
              <span className="font-mono text-xs font-bold tracking-widest text-neutral-900 block">
                {booking.reference}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5 block">
                Present this code to on-site scanner at gate
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons footer */}
        <div className="px-6 py-4 bg-neutral-950/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-400" />
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadICS}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
