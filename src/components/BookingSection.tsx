import React, { useState } from 'react';
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  ChevronRight,
  User,
  Mail,
  Phone,
  Settings,
  Ban,
} from 'lucide-react';
import {
  Booking,
  TimeSlot,
  EventDateConfig,
  generateTimeSlots,
  checkSlotAvailability,
  validateBookingForm,
  generateBookingReference,
  EMOTIONS,
} from '../utils/bookingLogic.ts';

interface BookingSectionProps {
  bookings: Booking[];
  totalQuota: number;
  remainingQuota: number;
  dateConfigs: EventDateConfig[];
  onBookingSuccess: (newBooking: Booking) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  bookings,
  totalQuota,
  remainingQuota,
  dateConfigs,
  onBookingSuccess,
}) => {
  const enabledDates = dateConfigs.filter((d) => d.enabled);
  const [selectedDate, setSelectedDate] = useState<string>(
    enabledDates[0]?.id || dateConfigs[0]?.id || '2026-11-20'
  );
  const [groupSize, setGroupSize] = useState<number>(2);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [leadName, setLeadName] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmotion, setLeadEmotion] = useState<string>('Radiant Joy');
  const [additionalAttendees, setAdditionalAttendees] = useState<
    { name: string; emotionalAura: string }[]
  >([
    { name: '', emotionalAura: 'Deep Serenity' },
    { name: '', emotionalAura: 'Cosmic Wonder' },
    { name: '', emotionalAura: 'Fiery Passion' },
    { name: '', emotionalAura: 'Cathartic Rain' },
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Find current date config
  const currentConfig = dateConfigs.find((d) => d.id === selectedDate);

  // Generate slots for the selected date
  const slots: TimeSlot[] = generateTimeSlots(
    selectedDate,
    currentConfig?.startHour ?? 10,
    currentConfig?.endHour ?? 19,
    bookings,
    remainingQuota,
    currentConfig?.blockedSlotIds ?? []
  );

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // Handler for group size change
  const handleGroupSizeChange = (size: number) => {
    setGroupSize(size);
    // If currently selected slot cannot accommodate new size or remaining quota is less, re-check
    if (selectedSlot) {
      const check = checkSlotAvailability(selectedSlot, size, remainingQuota);
      if (!check.available) {
        setSelectedSlotId('');
      }
    }
  };

  // Handler for attendee name edit
  const handleAttendeeNameChange = (index: number, name: string) => {
    const updated = [...additionalAttendees];
    updated[index].name = name;
    setAdditionalAttendees(updated);
    if (formErrors[`attendee_${index + 1}`]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[`attendee_${index + 1}`];
      setFormErrors(updatedErrors);
    }
  };

  // Handler for attendee emotion change
  const handleAttendeeEmotionChange = (index: number, aura: string) => {
    const updated = [...additionalAttendees];
    updated[index].emotionalAura = aura;
    setAdditionalAttendees(updated);
  };

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    const check = checkSlotAvailability(slot, groupSize, remainingQuota);
    if (!check.available) {
      setFormErrors((prev) => ({ ...prev, slot: check.reason || 'This slot is unavailable.' }));
      return;
    }
    setSelectedSlotId(slot.id);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.slot;
      return next;
    });
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullAttendees = [
      { name: leadName.trim(), emotionalAura: leadEmotion },
      ...additionalAttendees.slice(0, groupSize - 1),
    ];

    const validation = validateBookingForm(
      {
        leadName,
        leadEmail,
        leadPhone,
        groupSize,
        attendees: fullAttendees,
        slotId: selectedSlotId,
      },
      selectedSlot,
      remainingQuota
    );

    if (!validation.valid) {
      setFormErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Build confirmed booking object
    const newBooking: Booking = {
      id: `emo-book-${Date.now()}`,
      reference: generateBookingReference(),
      leadName: leadName.trim(),
      leadEmail: leadEmail.trim(),
      leadPhone: leadPhone.trim(),
      groupSize,
      attendees: fullAttendees,
      slotId: selectedSlotId,
      slotDate: selectedDate,
      slotTime: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '30-Minute Session',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingSuccess(newBooking);
      // Reset form
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setSelectedSlotId('');
      setFormErrors({});
    }, 400);
  };

  return (
    <section id="schedule" className="py-16 bg-neutral-900/40 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <span>Time Quota & Group Registration</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>1 to 5 Attendees</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
              Select Your 30-Minute Immersion Slot
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-2">
              Each 30-minute block accommodates up to 5 people total. Multiple groups can share a slot if spots remain (e.g. 1 group of 4 plus another group of 1)!
            </p>
          </div>

          {/* Quota Badge Container */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs text-neutral-400">Early Bird Quota Balance</div>
              <div className="font-display text-xl font-bold text-amber-400 font-mono tabular-nums">
                {remainingQuota} / {totalQuota} Left
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="text-xs text-neutral-400">
              <span className="text-emerald-400 block font-medium">Session Capacity:</span>
              <span>Max 5 People / Slot</span>
            </div>
          </div>
        </div>

        {/* Step 1 & 2: Date and Group Size bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Date Picker */}
          <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Step 1: Choose Event Date</span>
            </label>
            {enabledDates.length === 0 ? (
              <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 text-center text-xs text-neutral-400">
                No event dates are currently open for registration.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {enabledDates.map((date) => (
                  <button
                    key={date.id}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date.id);
                      setSelectedSlotId('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDate === date.id
                        ? 'bg-amber-400/10 border-amber-400 text-neutral-100 shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{date.short}</div>
                    <div className="text-sm font-semibold mt-0.5 text-neutral-200 truncate">
                      {date.label.split(',')[0]}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {date.startHour}:00 – {date.endHour}:00
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group Size Quota Selector (1 - 5) */}
          <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Step 2: Group Size Quota (1 – 5 People)</span>
              </label>
              <span className="text-xs text-neutral-400 font-mono">
                Consumes {groupSize} of {remainingQuota} tickets
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((size) => {
                const isOverQuota = size > remainingQuota;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOverQuota}
                    onClick={() => handleGroupSizeChange(size)}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      groupSize === size
                        ? 'bg-rose-500/10 border-rose-400 text-white shadow-sm ring-1 ring-rose-400/30'
                        : isOverQuota
                        ? 'opacity-40 border-neutral-800 bg-neutral-950/40 cursor-not-allowed text-neutral-600'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span className="font-display text-lg font-bold tabular-nums">{size}</span>
                    <span className="text-[10px] text-neutral-400 uppercase mt-0.5">
                      {size === 1 ? 'Solo' : `${size} Pax`}
                    </span>
                  </button>
                );
              })}
            </div>
            {remainingQuota < groupSize && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Remaining early bird quota ({remainingQuota}) is smaller than selected group size.</span>
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Interactive Time Quota Matrix */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Step 3: Choose 30-Minute Time Section</span>
              </label>
              <p className="text-xs text-neutral-400 mt-1">
                Each 30-minute block fits up to 5 total attendees. If open spots remain, multiple groups can book the same time!
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Open (5 Spots)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Spots Left</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                <span>Full / Need More Spots</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span>Blocked</span>
              </span>
            </div>
          </div>

          {formErrors.slot && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formErrors.slot}</span>
            </div>
          )}

          {/* Time Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isFull = slot.status === 'full';
              const isBlocked = slot.status === 'blocked';
              const isQuotaExhausted = remainingQuota <= 0;
              const remainingSpotsInSlot = Math.max(0, slot.maxCapacity - slot.bookedCount);
              const notEnoughSpace = remainingSpotsInSlot < groupSize && !isSelected;
              const hasPartialBookings = slot.bookedCount > 0 && remainingSpotsInSlot > 0;
              const isDisabled = isFull || isBlocked || isQuotaExhausted || notEnoughSpace;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSlotSelect(slot)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 font-semibold shadow-md shadow-amber-500/20'
                      : isBlocked
                      ? 'bg-neutral-950/40 border-neutral-800/60 text-neutral-600 cursor-not-allowed'
                      : isFull
                      ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-600 cursor-not-allowed'
                      : notEnoughSpace
                      ? 'bg-neutral-950/40 border-neutral-800/60 text-neutral-500 cursor-not-allowed'
                      : isQuotaExhausted
                      ? 'bg-neutral-950/40 border-neutral-800 text-neutral-600 cursor-not-allowed'
                      : hasPartialBookings
                      ? 'bg-amber-950/20 border-amber-500/40 text-neutral-200 hover:border-amber-400 hover:bg-neutral-900/90'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono tabular-nums font-semibold">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                    ) : isBlocked ? (
                      <Ban className="w-3.5 h-3.5 text-neutral-600" />
                    ) : isFull ? (
                      <span className="text-[10px] text-neutral-600 uppercase font-mono">Full</span>
                    ) : notEnoughSpace ? (
                      <span className="text-[10px] text-neutral-500 font-mono">{remainingSpotsInSlot} left</span>
                    ) : hasPartialBookings ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isSelected
                        ? 'text-neutral-900 font-medium'
                        : isBlocked
                        ? 'text-neutral-600 italic'
                        : isFull
                        ? 'text-neutral-600'
                        : notEnoughSpace
                        ? 'text-neutral-500'
                        : hasPartialBookings
                        ? 'text-amber-400/90'
                        : 'text-neutral-400'
                    }`}
                  >
                    {isBlocked
                      ? 'Blocked (Break)'
                      : isFull
                      ? 'Full (5/5 booked)'
                      : isSelected
                      ? `Your Slot (${groupSize} Pax)`
                      : notEnoughSpace
                      ? `Only ${remainingSpotsInSlot} spot${remainingSpotsInSlot === 1 ? '' : 's'} (need ${groupSize})`
                      : hasPartialBookings
                      ? `${remainingSpotsInSlot} spot${remainingSpotsInSlot === 1 ? '' : 's'} open (${slot.bookedCount}/5)`
                      : '5 spots open'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Attendee Registration Form & Live Summary */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Fields: Primary Contact + Group Names */}
            <div className="lg:col-span-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Step 4: Primary Contact Details</span>
                </label>
                <p className="text-xs text-neutral-400 mb-4">
                  The primary pass holder will receive the digital on-site entry pass.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      id="lead-name"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={leadName}
                      onChange={(e) => {
                        setLeadName(e.target.value);
                        if (formErrors.leadName) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.leadName;
                            return next;
                          });
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-950 border rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all ${
                        formErrors.leadName
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-neutral-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                  </div>
                  {formErrors.leadName && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.leadName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      id="lead-email"
                      type="email"
                      placeholder="alex@example.com"
                      value={leadEmail}
                      onChange={(e) => {
                        setLeadEmail(e.target.value);
                        if (formErrors.leadEmail) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.leadEmail;
                            return next;
                          });
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-950 border rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all ${
                        formErrors.leadEmail
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-neutral-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                  </div>
                  {formErrors.leadEmail && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.leadEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Mobile Phone (For On-Site SMS/Lookup) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      id="lead-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={leadPhone}
                      onChange={(e) => {
                        setLeadPhone(e.target.value);
                        if (formErrors.leadPhone) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.leadPhone;
                            return next;
                          });
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-950 border rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all ${
                        formErrors.leadPhone
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-neutral-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                  </div>
                  {formErrors.leadPhone && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.leadPhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-aura" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Your Emotional State / Aura Preference
                  </label>
                  <select
                    id="lead-aura"
                    value={leadEmotion}
                    onChange={(e) => setLeadEmotion(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  >
                    {EMOTIONS.map((emo) => (
                      <option key={emo.id} value={emo.name}>
                        {emo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Attendees Fields (if groupSize > 1) */}
              {groupSize > 1 && (
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-200">
                      Additional Group Members ({groupSize - 1} Attendee{groupSize > 2 ? 's' : ''})
                    </h3>
                    <span className="text-xs text-neutral-400">
                      Printed on individual on-site passes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Array.from({ length: groupSize - 1 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <div className="sm:col-span-1 text-xs text-neutral-400 font-mono">
                          #{idx + 2}
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder={`Guest #${idx + 2} Full Name`}
                            value={additionalAttendees[idx]?.name || ''}
                            onChange={(e) => handleAttendeeNameChange(idx, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                          />
                          {formErrors[`attendee_${idx + 1}`] && (
                            <p className="text-[11px] text-rose-400 mt-1">
                              {formErrors[`attendee_${idx + 1}`]}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-5">
                          <select
                            value={additionalAttendees[idx]?.emotionalAura || 'Radiant Joy'}
                            onChange={(e) => handleAttendeeEmotionChange(idx, e.target.value)}
                            aria-label={`Guest #${idx + 2} Emotional Aura`}
                            className="w-full px-2.5 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none focus:border-amber-400"
                          >
                            {EMOTIONS.map((emo) => (
                              <option key={emo.id} value={emo.name}>
                                {emo.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Registration Summary & Quota Impact Card */}
            <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sticky top-24 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Reservation Summary
                </span>
                <span className="text-xs text-emerald-400 font-mono">Early Bird Tier</span>
              </div>

              {/* Time slot summary */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Date</span>
                  <span className="font-medium text-neutral-200">
                    {dateConfigs.find((d) => d.id === selectedDate)?.label || selectedDate}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Session Window</span>
                  <span className="font-semibold text-amber-400 font-mono tabular-nums">
                    {selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime} (30 mins)` : 'Select a slot above'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Group Size</span>
                  <span className="font-medium text-neutral-200">{groupSize} Person(s)</span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Session Capacity</span>
                  <span className="text-neutral-300">Max 5 Attendees / 30 Min</span>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Quota Impact</span>
                  <span className="text-rose-400 font-semibold font-mono tabular-nums">
                    -{groupSize} tickets
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-400">Remaining Quota After</span>
                  <span className="text-emerald-400 font-semibold font-mono tabular-nums">
                    {Math.max(0, remainingQuota - groupSize)} / {totalQuota}
                  </span>
                </div>
              </div>

              {/* Perks list */}
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1.5">
                <div className="text-neutral-300 font-medium text-xs mb-1">Included with Early Bird:</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> Instant On-Site QR Verification Pass
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> 30-Minute Dedicated Emotion Chamber Flow
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> Free Commemorative Aura Reading Card
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || remainingQuota <= 0 || !selectedSlotId}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  !selectedSlotId
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : remainingQuota <= 0
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : isSubmitting
                    ? 'bg-amber-400 text-neutral-950 opacity-80 cursor-wait'
                    : 'bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 text-neutral-950 hover:from-amber-300 hover:to-rose-300 shadow-amber-500/20 active:scale-98'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Generating Your Pass...'
                    : !selectedSlotId
                    ? 'Select a 30-Min Slot'
                    : remainingQuota <= 0
                    ? 'Quota Exhausted'
                    : `Confirm Registration (${groupSize} Pax)`}
                </span>
              </button>

              <p className="text-[11px] text-center text-neutral-500">
                Guaranteed slot. Bring your QR pass for instant check-in on-site.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
