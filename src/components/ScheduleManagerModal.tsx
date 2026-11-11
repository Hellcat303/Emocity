import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import {
  EventDateConfig,
  formatDateLabel,
  generateTimeSlots,
  Booking,
} from '../utils/bookingLogic.ts';
import { INITIAL_EVENT_DATES } from '../data/seedData.ts';

interface ScheduleManagerModalProps {
  dateConfigs: EventDateConfig[];
  bookings: Booking[];
  onSaveDateConfigs: (updated: EventDateConfig[]) => void;
  onClose: () => void;
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

export const ScheduleManagerModal: React.FC<ScheduleManagerModalProps> = ({
  dateConfigs,
  bookings,
  onSaveDateConfigs,
  onClose,
}) => {
  const [configs, setConfigs] = useState<EventDateConfig[]>(dateConfigs);
  const [selectedDateId, setSelectedDateId] = useState<string>(
    configs[0]?.id || '2026-11-20'
  );
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeDateConfig =
    configs.find((c) => c.id === selectedDateId) || configs[0];

  // Update a single date config
  const updateConfig = (
    id: string,
    updates: Partial<EventDateConfig>
  ) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Add a new date
  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateInput) return;

    if (configs.some((c) => c.date === newDateInput)) {
      setFeedback('This date is already configured in your schedule.');
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
    setFeedback(`Added ${label} to your event dates!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Remove a date
  const handleRemoveDate = (id: string) => {
    const hasBookings = bookings.some(
      (b) => b.slotDate === id && b.status !== 'cancelled'
    );
    if (hasBookings) {
      if (
        !window.confirm(
          'This date already has active attendee bookings. Are you sure you want to remove it?'
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
    setFeedback('Date removed.');
    setTimeout(() => setFeedback(null), 2500);
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
    setFeedback(`Applied ${startHour}:00 - ${endHour}:00 to all dates!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Reset to default dates
  const handleResetDefaults = () => {
    setConfigs(INITIAL_EVENT_DATES);
    setSelectedDateId(INITIAL_EVENT_DATES[0].id);
    setFeedback('Reset to default schedule (Nov 20–22, 10am-7pm).');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Save changes
  const handleSaveAll = () => {
    onSaveDateConfigs(configs);
    onClose();
  };

  // Generate slots for the preview grid of the currently selected date
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>Event Dates & Available Times Setup</span>
                <span className="text-[11px] font-mono font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  HOST CONTROLS
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Easily input which dates your event runs, set daily operating hours, and block out breaks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule manager"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-white cursor-pointer ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Quick Add Date Bar */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <form
              onSubmit={handleAddDate}
              className="flex flex-1 items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date</span>
              </button>
            </form>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Reset Defaults
            </button>
          </div>

          {/* Date Selector Tabs */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
              <span>Configured Event Dates ({configs.length})</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Click a date to configure operating hours and break slots
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {configs.map((config) => {
                const isSelected = selectedDateId === config.id;
                return (
                  <div
                    key={config.id}
                    className={`flex items-center rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 text-neutral-100 shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDateId(config.id)}
                      className="px-3.5 py-2 cursor-pointer font-medium text-left"
                    >
                      <div className="font-semibold text-neutral-200">{config.short}</div>
                      <div className="text-[10px] text-neutral-400">
                        {config.startHour}:00 – {config.endHour}:00
                      </div>
                    </button>
                    {configs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(config.id)}
                        title={`Remove ${config.short}`}
                        className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800/80 rounded-r-xl transition-colors cursor-pointer border-l border-neutral-800/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Date Settings Panel */}
          {activeDateConfig && (
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <div className="text-xs font-mono text-amber-400 uppercase">
                    Configuring Schedule For
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-100">
                    {activeDateConfig.label} ({activeDateConfig.date})
                  </h3>
                </div>

                <div className="flex items-center gap-3">
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
                    <span>Available for Booking</span>
                  </label>
                </div>
              </div>

              {/* Operating Hours Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label htmlFor="start-hour" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Opening Time (Start Hour)
                  </label>
                  <select
                    id="start-hour"
                    value={activeDateConfig.startHour}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < activeDateConfig.endHour) {
                        updateConfig(activeDateConfig.id, { startHour: val });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
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
                  <label htmlFor="end-hour" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Closing Time (End Hour)
                  </label>
                  <select
                    id="end-hour"
                    value={activeDateConfig.endHour}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > activeDateConfig.startHour) {
                        updateConfig(activeDateConfig.id, { endHour: val });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400"
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
                    className="w-full px-3 py-2 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apply Hours to All Days</span>
                  </button>
                </div>
              </div>

              {/* Interactive 30-min Slot Block / Break Manager */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Click any 30-min slot to Block or Unblock (Breaks / Maintenance)</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {activeDateConfig.blockedSlotIds.length} slot(s) currently blocked
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                  {previewSlots.map((slot) => {
                    const isBlocked = activeDateConfig.blockedSlotIds.includes(
                      slot.id
                    );
                    const isBooked = slot.bookedGroups > 0;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleBlockSlot(slot.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                          isBlocked
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                            : isBooked
                            ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-semibold">
                          <span>{slot.startTime}</span>
                          {isBlocked ? (
                            <Ban className="w-3 h-3 text-rose-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <div className="text-[10px] mt-0.5 truncate">
                          {isBlocked ? 'Blocked (Break)' : isBooked ? '1 Group Booked' : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Changes will take effect immediately on the live registration form.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Update Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
