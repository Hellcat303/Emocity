import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Sliders,
  CheckCircle2,
  Ban,
  Ticket,
  Users,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  QrCode,
  LogOut,
  ExternalLink,
  Settings,
  Terminal,
  Github,
  Globe,
} from 'lucide-react';
import {
  Booking,
  EventDateConfig,
  formatDateLabel,
  generateTimeSlots,
  verifyAndCheckIn,
} from '../utils/bookingLogic.ts';
import { INITIAL_EVENT_DATES } from '../data/seedData.ts';

interface AdminDashboardProps {
  dateConfigs: EventDateConfig[];
  bookings: Booking[];
  totalQuota: number;
  remainingQuota: number;
  totalBooked: number;
  onSaveDateConfigs: (updated: EventDateConfig[]) => void;
  onUpdateBookings: (updated: Booking[]) => void;
  onUpdateQuota: (newTotal: number) => void;
  onClose: () => void;
  onViewPass: (booking: Booking) => void;
}

const HOUR_OPTIONS = [
  { value: 8, label: '08:00 AM' },
  { value: 9, label: '09:00 AM' },
  { value: 10, label: '10:00 AM' },
  { value: 11, label: '11:00 AM' },
  { value: 12, label: '12:00 PM' },
  { value: 13, label: '01:00 PM' },
  { value: 14, label: '02:00 PM' },
  { value: 15, label: '03:00 PM' },
  { value: 16, label: '04:00 PM' },
  { value: 17, label: '05:00 PM' },
  { value: 18, label: '06:00 PM' },
  { value: 19, label: '07:00 PM' },
  { value: 20, label: '08:00 PM' },
  { value: 21, label: '09:00 PM' },
  { value: 22, label: '10:00 PM' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dateConfigs,
  bookings,
  totalQuota,
  remainingQuota,
  totalBooked,
  onSaveDateConfigs,
  onUpdateBookings,
  onUpdateQuota,
  onClose,
  onViewPass,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'quota' | 'checkin' | 'roster' | 'deploy'>('schedule');

  // Schedule Management State
  const [configs, setConfigs] = useState<EventDateConfig[]>(dateConfigs);
  const [selectedDateId, setSelectedDateId] = useState<string>(
    configs[0]?.id || '2026-11-20'
  );
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  // Quota Management State
  const [isEditingQuota, setIsEditingQuota] = useState<boolean>(false);
  const [customQuotaInput, setCustomQuotaInput] = useState<string>(totalQuota.toString());
  const [quotaFeedback, setQuotaFeedback] = useState<string | null>(null);

  // Check-In State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in'>('all');

  const activeDateConfig =
    configs.find((c) => c.id === selectedDateId) || configs[0];

  // Helper to update a date config
  const updateConfig = (id: string, updates: Partial<EventDateConfig>) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Add date
  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateInput) return;

    if (configs.some((c) => c.date === newDateInput)) {
      setScheduleFeedback('This date already exists in the schedule.');
      return;
    }

    const { label, short } = formatDateLabel(newDateInput);
    const newConfig: EventDateConfig = {
      id: newDateInput,
      date: newDateInput,
      label,
      short,
      enabled: true,
      startHour: 10,
      endHour: 19,
      blockedSlotIds: [],
    };

    const updated = [...configs, newConfig].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    setConfigs(updated);
    setSelectedDateId(newDateInput);
    setNewDateInput('');
    setScheduleFeedback(`Added ${label}! Remember to click "Save Schedule Changes" below.`);
    setTimeout(() => setScheduleFeedback(null), 4000);
  };

  // Remove date
  const handleRemoveDate = (id: string) => {
    const hasBookings = bookings.some(
      (b) => b.slotDate === id && b.status !== 'cancelled'
    );
    if (hasBookings) {
      if (
        !window.confirm(
          'This date already has active bookings. Are you sure you want to remove it?'
        )
      ) {
        return;
      }
    }
    const updated = configs.filter((c) => c.id !== id);
    setConfigs(updated);
    if (selectedDateId === id && updated.length > 0) {
      setSelectedDateId(updated[0].id);
    }
    setScheduleFeedback('Date removed from draft. Click "Save Schedule Changes" to persist.');
    setTimeout(() => setScheduleFeedback(null), 3000);
  };

  // Toggle blocking/unblocking a 30-min slot
  const handleToggleBlockSlot = (slotId: string) => {
    if (!activeDateConfig) return;
    const isCurrentlyBlocked = activeDateConfig.blockedSlotIds.includes(slotId);
    const updatedBlocked = isCurrentlyBlocked
      ? activeDateConfig.blockedSlotIds.filter((id) => id !== slotId)
      : [...activeDateConfig.blockedSlotIds, slotId];

    updateConfig(activeDateConfig.id, { blockedSlotIds: updatedBlocked });
  };

  // Apply operating hours to all days
  const handleApplyHoursToAll = () => {
    if (!activeDateConfig) return;
    const { startHour, endHour } = activeDateConfig;
    setConfigs((prev) =>
      prev.map((c) => ({
        ...c,
        startHour,
        endHour,
      }))
    );
    setScheduleFeedback(`Applied ${startHour}:00 - ${endHour}:00 to all dates! Click "Save Schedule Changes".`);
    setTimeout(() => setScheduleFeedback(null), 4000);
  };

  // Reset defaults
  const handleResetDefaults = () => {
    setConfigs(INITIAL_EVENT_DATES);
    setSelectedDateId(INITIAL_EVENT_DATES[0].id);
    setScheduleFeedback('Schedule reset to default dates.');
    setTimeout(() => setScheduleFeedback(null), 3000);
  };

  // Save Schedule
  const handleSaveSchedule = () => {
    onSaveDateConfigs(configs);
    setScheduleFeedback('Schedule & available times updated successfully! Live website refreshed.');
    setTimeout(() => setScheduleFeedback(null), 4000);
  };

  // Quota Save
  const handleSaveQuota = () => {
    const parsed = parseInt(customQuotaInput, 10);
    if (!isNaN(parsed) && parsed >= totalBooked) {
      onUpdateQuota(parsed);
      setIsEditingQuota(false);
      setQuotaFeedback(`Total Early Bird Quota updated to ${parsed} tickets!`);
      setTimeout(() => setQuotaFeedback(null), 3000);
    } else {
      setQuotaFeedback(`Quota cannot be lower than existing bookings (${totalBooked}).`);
    }
  };

  // On-Site Check In
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = verifyAndCheckIn(bookings, searchQuery);
    if (result.success) {
      onUpdateBookings(result.updatedBookings);
      setScanFeedback({ type: 'success', text: result.message });
      setSearchQuery('');
    } else {
      setScanFeedback({ type: 'error', text: result.message });
    }
  };

  const handleDirectCheckIn = (ref: string) => {
    const result = verifyAndCheckIn(bookings, ref);
    if (result.success) {
      onUpdateBookings(result.updatedBookings);
      setScanFeedback({ type: 'success', text: result.message });
    } else {
      setScanFeedback({ type: 'error', text: result.message });
    }
  };

  // Filtered bookings
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
    link.setAttribute('download', `emotopia-guest-roster-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preview slots for active date
  const previewSlots = activeDateConfig
    ? generateTimeSlots(
        activeDateConfig.date,
        activeDateConfig.startHour,
        activeDateConfig.endHour,
        bookings,
        50,
        activeDateConfig.blockedSlotIds
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-20 bg-neutral-900 border-b border-neutral-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-neutral-950 font-bold text-sm">
            E
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-neutral-100">
                EMOTOPIA
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-400 text-neutral-950">
                ADMIN PANEL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Host Configuration & On-Site Gate Management
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dates & Available Times</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quota')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quota'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket Quota ({remainingQuota} left)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checkin'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Gate Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roster'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guest Roster ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Run Locally & Hosting</span>
          </button>
        </div>

        {/* Exit Admin */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </button>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {/* TAB 1: DATES & AVAILABLE TIMES */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-100 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <span>Event Dates & Available Times Setup</span>
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure event operating dates, opening hours, closing hours, and click 30-min slots to block break periods.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/15"
              >
                <Check className="w-4 h-4" />
                <span>Save Schedule Changes</span>
              </button>
            </div>

            {/* Schedule Feedback Banner */}
            {scheduleFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{scheduleFeedback}</span>
              </div>
            )}

            {/* Quick Add Date Bar */}
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <form onSubmit={handleAddDate} className="flex flex-1 items-center gap-3">
                <div className="relative flex-1">
                  <label htmlFor="admin-add-date" className="block text-[10px] text-neutral-400 uppercase font-mono mb-1">
                    Add New Event Date
                  </label>
                  <input
                    id="admin-add-date"
                    type="date"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 mt-4 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Date</span>
                </button>
              </form>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors cursor-pointer shrink-0 sm:mt-4"
              >
                Reset Default Dates
              </button>
            </div>

            {/* Configured Event Dates List */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
                <span>Configured Event Dates ({configs.length})</span>
                <span className="text-[11px] text-neutral-500">
                  Select a date tab to configure its daily hours and break slots
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {configs.map((config) => {
                  const isSelected = selectedDateId === config.id;
                  return (
                    <div
                      key={config.id}
                      className={`flex items-center rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-neutral-100 shadow-sm'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDateId(config.id)}
                        className="px-4 py-2.5 cursor-pointer font-medium text-left"
                      >
                        <div className="font-semibold text-neutral-200">{config.short}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {config.startHour}:00 – {config.endHour}:00
                        </div>
                      </button>
                      {configs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDate(config.id)}
                          title={`Remove ${config.short}`}
                          className="p-2.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800/80 rounded-r-xl transition-colors cursor-pointer border-l border-neutral-800/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Date Daily Hours & Breaks Panel */}
            {activeDateConfig && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="text-xs font-mono text-amber-400 uppercase">
                      Editing Schedule For
                    </div>
                    <h3 className="font-display text-xl font-bold text-neutral-100">
                      {activeDateConfig.label} ({activeDateConfig.date})
                    </h3>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeDateConfig.enabled}
                      onChange={(e) =>
                        updateConfig(activeDateConfig.id, {
                          enabled: e.target.checked,
                        })
                      }
                      className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span>Available for Customer Registration</span>
                  </label>
                </div>

                {/* Operating Hours Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label htmlFor="admin-start-hour" className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Opening Time (Start Hour)
                    </label>
                    <select
                      id="admin-start-hour"
                      value={activeDateConfig.startHour}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < activeDateConfig.endHour) {
                          updateConfig(activeDateConfig.id, { startHour: val });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
                    >
                      {HOUR_OPTIONS.filter((h) => h.value < activeDateConfig.endHour).map(
                        (h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-end-hour" className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Closing Time (End Hour)
                    </label>
                    <select
                      id="admin-end-hour"
                      value={activeDateConfig.endHour}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > activeDateConfig.startHour) {
                          updateConfig(activeDateConfig.id, { endHour: val });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
                    >
                      {HOUR_OPTIONS.filter((h) => h.value > activeDateConfig.startHour).map(
                        (h) => (
                          <option key={h.value} value={h.value}>
                            {h.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleApplyHoursToAll}
                      className="w-full px-4 py-2.5 text-xs text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Apply Hours to All Days</span>
                    </button>
                  </div>
                </div>

                {/* 30-min Break & Maintenance Slot Toggle */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Click any 30-min slot to Block or Unblock (Breaks / Maintenance)</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {activeDateConfig.blockedSlotIds.length} slot(s) blocked
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 p-1">
                    {previewSlots.map((slot) => {
                      const isBlocked = activeDateConfig.blockedSlotIds.includes(slot.id);
                      const isFull = slot.status === 'full';
                      const spotsRemaining = Math.max(0, slot.maxCapacity - slot.bookedCount);
                      const hasBookings = slot.bookedCount > 0;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleToggleBlockSlot(slot.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                            isBlocked
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : isFull
                              ? 'bg-neutral-950/70 border-neutral-800 text-neutral-500'
                              : hasBookings
                              ? 'bg-amber-950/20 border-amber-500/30 text-neutral-300 hover:border-amber-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono font-semibold">
                            <span>{slot.startTime}</span>
                            {isBlocked ? (
                              <Ban className="w-3.5 h-3.5 text-rose-400" />
                            ) : isFull ? (
                              <span className="text-[10px] text-neutral-500 font-mono">FULL</span>
                            ) : hasBookings ? (
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            )}
                          </div>
                          <div className="text-[10px] mt-1 truncate">
                            {isBlocked
                              ? 'Blocked (Break)'
                              : isFull
                              ? 'Full (5/5 booked)'
                              : hasBookings
                              ? `${slot.bookedCount}/5 booked (${spotsRemaining} left)`
                              : '5 spots open'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EARLY BIRD QUOTA MANAGEMENT */}
        {activeTab === 'quota' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-100 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-amber-400" />
                  <span>Early Bird Quota Architecture</span>
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage the total early bird tickets cap. When quota reaches 0, registrations lock automatically.
                </p>
              </div>
            </div>

            {quotaFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                {quotaFeedback}
              </div>
            )}

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                  Total Early Bird Cap
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-bold text-neutral-100 tabular-nums">
                    {totalQuota}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingQuota(!isEditingQuota)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {isEditingQuota ? 'Cancel' : 'Change Cap'}
                  </button>
                </div>
                {isEditingQuota && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={totalBooked}
                        value={customQuotaInput}
                        onChange={(e) => setCustomQuotaInput(e.target.value)}
                        className="w-24 px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100"
                      />
                      <button
                        type="button"
                        onClick={handleSaveQuota}
                        className="px-3 py-1.5 text-xs bg-amber-400 text-neutral-950 font-semibold rounded-lg cursor-pointer hover:bg-amber-300"
                      >
                        Save
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                      <span>Presets:</span>
                      {[50, 150, 300, 500].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCustomQuotaInput(preset.toString())}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                  Tickets Claimed
                </div>
                <div className="font-display text-3xl font-bold text-neutral-100 tabular-nums">
                  {totalBooked} <span className="text-xs font-normal text-neutral-400">tickets</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">{bookings.length} reservations</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                  Quota Remaining
                </div>
                <div className="font-display text-3xl font-bold text-emerald-400 tabular-nums">
                  {remainingQuota} <span className="text-xs font-normal text-neutral-400">tickets</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Available for new groups</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                  Checked In at Venue
                </div>
                <div className="font-display text-3xl font-bold text-sky-400 tabular-nums">
                  {checkedInCount} <span className="text-xs font-normal text-neutral-400">groups</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">{totalAttendeesCheckedIn} total attendees</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GATE SCANNER & CHECK-IN */}
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-neutral-100 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-amber-400" />
                <span>On-Site Gate Check-In & Scanner</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Scan attendee QR passes or look up references to grant immediate entrance.
              </p>
            </div>

            {scanFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{scanFeedback.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanFeedback(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleScanSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Scan QR or Enter Reference (e.g. EMO-8R2Q-26 or Attendee Name/Email)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Lead Guest</th>
                    <th className="py-3 px-4">Group Size</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 text-xs">
                  {filteredBookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-amber-400">
                        {b.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-200">{b.leadName}</div>
                        <div className="text-[11px] text-neutral-500">{b.leadEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-300">
                        {b.groupSize} attendees
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
                            className="px-3 py-1 text-[11px] font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg cursor-pointer transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewPass(b)}
                          className="px-3 py-1 text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer transition-colors"
                        >
                          Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GUEST ROSTER & CSV */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-100 flex items-center gap-2">
                  <Users className="w-6 h-6 text-amber-400" />
                  <span>Full Attendee Roster</span>
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Complete manifest of all early bird registrants, attendees, and entry states.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Guest Roster (CSV)</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 w-fit">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  statusFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  statusFilter === 'confirmed' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('checked_in')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  statusFilter === 'checked_in' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Checked In ({checkedInCount})
              </button>
            </div>

            {/* Table */}
            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Lead Attendee</th>
                    <th className="py-3 px-4">Party Size</th>
                    <th className="py-3 px-4">Attendees Names</th>
                    <th className="py-3 px-4">Reserved Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 text-xs">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-amber-400">
                        {b.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-200">{b.leadName}</div>
                        <div className="text-[11px] text-neutral-500">{b.leadEmail} · {b.leadPhone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {b.groupSize}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {b.attendees.map((a) => a.name).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-neutral-300 font-mono text-[11px]">
                        <div>{b.slotTime}</div>
                        <div className="text-[10px] text-neutral-500">{b.slotDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        {b.status === 'checked_in' ? (
                          <span className="text-sky-400 font-mono text-[11px]">
                            Checked In {b.checkInTime}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-mono text-[11px]">Confirmed</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onViewPass(b)}
                          className="px-2.5 py-1 text-[11px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LOCAL RUN & GITHUB / CLOUD HOSTING */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-neutral-100 flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-400" />
                <span>Running Locally & Free Online Hosting Guide</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Everything you and your teacher need to download this project, run it seamlessly on Windows/Mac, or push to GitHub and host on Vercel / Netlify for free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Local Machine */}
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>1. Running Locally on Your Computer</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  You can download the project ZIP from the export menu and unzip it to your machine.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-neutral-200 font-medium block mb-1">Method A: 1-Click Launch (Windows)</span>
                    <span className="text-neutral-400 text-[11px]">
                      Double-click <code className="text-amber-300 font-mono">start-emotopia.cmd</code> in the folder. It automatically detects Node.js, runs install if needed, and starts the server!
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-neutral-200 font-medium block mb-1">Method B: Command Line (Windows / Mac / Linux)</span>
                    <pre className="p-2 bg-neutral-900 rounded font-mono text-[11px] text-amber-300 overflow-x-auto">
npm install
npm run dev
                    </pre>
                    <span className="text-neutral-400 text-[11px] block mt-1">
                      Then visit <span className="text-amber-400 font-mono">http://localhost:3000</span> in your browser.
                    </span>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-neutral-300">
                    <strong className="text-amber-300">Note about bun.lock:</strong> If you or your teacher see <code className="font-mono text-neutral-100">bun.lock</code>, it is completely optional. Using standard <code className="font-mono text-amber-300">npm install</code> creates <code className="font-mono text-neutral-100">package-lock.json</code> and works 100% cleanly without errors.
                  </div>
                </div>
              </div>

              {/* Card 2: GitHub & Hosting */}
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                  <Github className="w-4 h-4" />
                  <span>2. Uploading to GitHub & Free Cloud Hosting</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Want the whole school or attendees to access Emotopia from their own phones or computers? You can host it for free!
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-neutral-200 font-medium block mb-1">Step 1: Push to GitHub</span>
                    <p className="text-neutral-400 text-[11px] mb-2">
                      In your project folder, initialize a git repository and push:
                    </p>
                    <pre className="p-2 bg-neutral-900 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto">
git init
git add .
git commit -m "Initial commit of Emotopia event app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emotopia.git
git push -u origin main
                    </pre>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-neutral-200 font-medium block mb-1">Step 2: Deploy to Vercel or Netlify (Free)</span>
                    <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                      <li>Go to <strong className="text-neutral-200">vercel.com</strong> or <strong className="text-neutral-200">netlify.com</strong> and sign in with GitHub.</li>
                      <li>Click "Add New Project" and import your <code className="font-mono text-amber-300">emotopia</code> repository.</li>
                      <li>Vercel/Netlify auto-detects Vite: Build Command is <code className="font-mono text-neutral-200">npm run build</code> and Output Directory is <code className="font-mono text-neutral-200">dist</code>.</li>
                      <li>Click <strong className="text-emerald-400">Deploy</strong>! In under 60 seconds you will receive a public HTTPS URL (e.g. <code className="text-sky-300 font-mono">emotopia.vercel.app</code>) that anyone can visit!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
