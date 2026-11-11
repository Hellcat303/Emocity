import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Settings,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Booking, verifyAndCheckIn } from '../utils/bookingLogic.ts';
import { Calendar } from 'lucide-react';

interface OrganizerDeskProps {
  bookings: Booking[];
  totalQuota: number;
  remainingQuota: number;
  totalBooked: number;
  onUpdateBookings: (updated: Booking[]) => void;
  onUpdateQuota: (newTotal: number) => void;
  onOpenScheduleManager?: () => void;
  onClose: () => void;
  onViewPass: (booking: Booking) => void;
}

export const OrganizerDesk: React.FC<OrganizerDeskProps> = ({
  bookings,
  totalQuota,
  remainingQuota,
  totalBooked,
  onUpdateBookings,
  onUpdateQuota,
  onOpenScheduleManager,
  onClose,
  onViewPass,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in'>('all');
  const [isEditingQuota, setIsEditingQuota] = useState<boolean>(false);
  const [customQuotaInput, setCustomQuotaInput] = useState<string>(totalQuota.toString());

  // Handle Scan / Search check in
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = verifyAndCheckIn(bookings, searchQuery);
    if (result.success) {
      onUpdateBookings(result.updatedBookings);
      setFeedback({ type: 'success', text: result.message });
      setSearchQuery('');
    } else {
      setFeedback({ type: 'error', text: result.message });
    }
  };

  // Direct check-in button click on a specific table row
  const handleDirectCheckIn = (ref: string) => {
    const result = verifyAndCheckIn(bookings, ref);
    if (result.success) {
      onUpdateBookings(result.updatedBookings);
      setFeedback({ type: 'success', text: result.message });
    } else {
      setFeedback({ type: 'error', text: result.message });
    }
  };

  // Filtered list
  const filteredBookings = bookings.filter((b) => {
    const matchesQuery =
      b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.leadEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slotTime.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : b.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const checkedInCount = bookings.filter((b) => b.status === 'checked_in').length;
  const totalAttendeesCheckedIn = bookings
    .filter((b) => b.status === 'checked_in')
    .reduce((sum, b) => sum + b.groupSize, 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Reference,Lead Name,Email,Phone,Group Size,Slot Date,Slot Time,Status,Check In Time'];
    const rows = bookings.map(
      (b) =>
        `"${b.reference}","${b.leadName}","${b.leadEmail}","${b.leadPhone}",${b.groupSize},"${b.slotDate}","${b.slotTime}","${b.status}","${b.checkInTime || ''}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `emocity-guest-roster-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveQuota = () => {
    const parsed = parseInt(customQuotaInput, 10);
    if (!isNaN(parsed) && parsed >= totalBooked) {
      onUpdateQuota(parsed);
      setIsEditingQuota(false);
      setFeedback({ type: 'success', text: `Early bird quota updated to ${parsed} tickets.` });
    } else {
      setFeedback({
        type: 'error',
        text: `Quota cannot be lower than already booked tickets (${totalBooked}).`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>EmoCity On-Site Registration & Quota Desk</span>
                <span className="text-[11px] font-mono font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  STAFF MODE
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Gate check-in scanner, live session quotas, and guest verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenScheduleManager && (
              <button
                type="button"
                onClick={onOpenScheduleManager}
                className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Dates & Available Times</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close organizer desk"
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-neutral-800 bg-neutral-950/30">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Total Quota Cap
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
                {totalQuota}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingQuota(!isEditingQuota)}
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                {isEditingQuota ? 'Cancel' : 'Adjust'}
              </button>
            </div>
            {isEditingQuota && (
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  value={customQuotaInput}
                  onChange={(e) => setCustomQuotaInput(e.target.value)}
                  className="w-16 px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
                <button
                  type="button"
                  onClick={handleSaveQuota}
                  className="px-2 py-1 text-[11px] bg-amber-400 text-neutral-950 font-semibold rounded cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Tickets Claimed
            </div>
            <div className="font-display text-2xl font-bold text-neutral-100 tabular-nums">
              {totalBooked}{' '}
              <span className="text-xs font-normal text-neutral-400">
                ({bookings.length} groups)
              </span>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Quota Remaining
            </div>
            <div className="font-display text-2xl font-bold text-emerald-400 tabular-nums">
              {remainingQuota}{' '}
              <span className="text-xs font-normal text-neutral-400">tickets</span>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Checked In at Gate
            </div>
            <div className="font-display text-2xl font-bold text-sky-400 tabular-nums">
              {checkedInCount}{' '}
              <span className="text-xs font-normal text-neutral-400">
                ({totalAttendeesCheckedIn} people)
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-white ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Scanner Bar & Search */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleScanSubmit}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Scan QR or Enter Reference (e.g. EMO-8R2Q-26 or Guest Name/Email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <QrCode className="w-4 h-4" />
                <span>Verify & Check In</span>
              </button>
            </div>
          </form>

          {/* Filter tabs and export button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'confirmed'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Awaiting Gate ({bookings.filter((b) => b.status === 'confirmed').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('checked_in')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'checked_in'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Checked In ({checkedInCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export Roster CSV</span>
            </button>
          </div>

          {/* Registrations Table */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/60 max-h-96 overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No registrations match the query or filter.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Lead Guest</th>
                    <th className="py-3 px-4">Group Size</th>
                    <th className="py-3 px-4">30-Min Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 text-xs">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-amber-400">
                        {b.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-200">{b.leadName}</div>
                        <div className="text-[11px] text-neutral-500">{b.leadEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-300">
                        {b.groupSize} {b.groupSize === 1 ? 'person' : 'people'}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        <div className="font-mono text-[11px]">{b.slotTime}</div>
                        <div className="text-[10px] text-neutral-500">{b.slotDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        {b.status === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In {b.checkInTime ? `(${b.checkInTime})` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Confirmed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {b.status !== 'checked_in' && (
                          <button
                            type="button"
                            onClick={() => handleDirectCheckIn(b.reference)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded cursor-pointer transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewPass(b)}
                          className="px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded cursor-pointer transition-colors"
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
