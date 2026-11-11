export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxGroups: number; // Up to 5 groups (e.g. 5 singles or combinations)
  maxCapacity: number; // 5 attendees max per session
  bookedCount: number; // attendees already booked
  bookedGroups: number; // groups already booked
  remainingSpots: number; // spots still open in this session
  isAvailable: boolean;
  status: 'available' | 'full' | 'quota_exhausted' | 'blocked';
}

export interface EventDateConfig {
  id: string;
  date: string;
  label: string;
  short: string;
  enabled: boolean;
  startHour: number;
  endHour: number;
  blockedSlotIds: string[];
}

export interface Attendee {
  name: string;
  email?: string;
  emotionalAura?: string;
}

export interface Booking {
  id: string;
  reference: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  groupSize: number;
  attendees: Attendee[];
  slotId: string;
  slotDate: string;
  slotTime: string;
  status: 'confirmed' | 'checked_in' | 'cancelled';
  checkInTime?: string;
  createdAt: string;
}

export interface QuotaConfig {
  totalEarlyBirdQuota: number;
  maxGroupSize: number;
  minGroupSize: number;
  sessionDurationMinutes: number;
}

export const DEFAULT_QUOTA_CONFIG: QuotaConfig = {
  totalEarlyBirdQuota: 50,
  maxGroupSize: 5,
  minGroupSize: 1,
  sessionDurationMinutes: 30,
};

export const EMOTIONS = [
  { id: 'joy', name: 'Radiant Joy', color: 'from-amber-400 to-yellow-500', text: 'text-amber-400' },
  { id: 'serenity', name: 'Deep Serenity', color: 'from-sky-400 to-blue-500', text: 'text-sky-400' },
  { id: 'wonder', name: 'Cosmic Wonder', color: 'from-indigo-400 to-purple-500', text: 'text-indigo-400' },
  { id: 'passion', name: 'Fiery Passion', color: 'from-rose-500 to-pink-600', text: 'text-rose-400' },
  { id: 'melancholy', name: 'Cathartic Rain', color: 'from-teal-400 to-emerald-600', text: 'text-emerald-400' },
];

/**
 * Calculates remaining early bird quota across all active bookings
 */
export function calculateRemainingQuota(
  totalQuota: number,
  bookings: Booking[]
): {
  totalQuota: number;
  totalBooked: number;
  remaining: number;
  percentageUsed: number;
} {
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const totalBooked = activeBookings.reduce((sum, b) => sum + b.groupSize, 0);
  const remaining = Math.max(0, totalQuota - totalBooked);
  const percentageUsed = totalQuota > 0 ? Math.min(100, Math.round((totalBooked / totalQuota) * 100)) : 100;

  return {
    totalQuota,
    totalBooked,
    remaining,
    percentageUsed,
  };
}

/**
 * Formats a YYYY-MM-DD date string into human friendly label and short tag
 */
export function formatDateLabel(dateStr: string): { label: string; short: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
    return {
      label: `${weekday}, ${monthShort} ${day}`,
      short: `${monthShort} ${day}`,
    };
  } catch (e) {
    return {
      label: dateStr,
      short: dateStr,
    };
  }
}

/**
 * Generates regular 30-minute time slots for a given day and merges booking occupancy & blocked slots
 */
export function generateTimeSlots(
  date: string,
  startHour = 10,
  endHour = 19,
  bookings: Booking[] = [],
  totalQuotaRemaining = 50,
  blockedSlotIds: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled' && b.slotDate === date);

  for (let hour = startHour; hour < endHour; hour++) {
    for (const minute of [0, 30]) {
      const nextMinute = minute === 0 ? 30 : 0;
      const nextHour = minute === 0 ? hour : hour + 1;

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startTime = `${pad(hour)}:${pad(minute)}`;
      const endTime = `${pad(nextHour)}:${pad(nextMinute)}`;
      const slotId = `${date}_${startTime.replace(':', '')}`;

      const slotBookings = activeBookings.filter((b) => b.slotId === slotId);
      const bookedGroups = slotBookings.length;
      const bookedCount = slotBookings.reduce((sum, b) => sum + b.groupSize, 0);

      // Capacity: max 5 attendees total per 30-min session. Multiple groups can share if capacity allows.
      const maxCapacity = 5;
      const remainingSpots = Math.max(0, maxCapacity - bookedCount);

      const isBlocked = blockedSlotIds.includes(slotId);

      let status: 'available' | 'full' | 'quota_exhausted' | 'blocked' = 'available';
      if (isBlocked) {
        status = 'blocked';
      } else if (remainingSpots <= 0) {
        status = 'full';
      } else if (totalQuotaRemaining <= 0) {
        status = 'quota_exhausted';
      }

      slots.push({
        id: slotId,
        date,
        startTime,
        endTime,
        maxGroups: 5,
        maxCapacity,
        bookedCount,
        bookedGroups,
        remainingSpots,
        isAvailable: status === 'available',
        status,
      });
    }
  }

  return slots;
}

/**
 * Verifies if a specific slot can accommodate the requested group size
 */
export function checkSlotAvailability(
  slot: TimeSlot | undefined,
  requestedGroupSize: number,
  remainingTotalQuota: number
): { available: boolean; reason?: string } {
  if (!slot) {
    return { available: false, reason: 'Time slot does not exist.' };
  }

  if (slot.status === 'blocked') {
    return { available: false, reason: 'This 30-minute session has been blocked by the organizer.' };
  }

  if (requestedGroupSize < 1 || requestedGroupSize > 5) {
    return { available: false, reason: 'Group size must be between 1 and 5 attendees.' };
  }

  if (remainingTotalQuota < requestedGroupSize) {
    return {
      available: false,
      reason: `Only ${remainingTotalQuota} ticket${remainingTotalQuota === 1 ? '' : 's'} left in early bird quota.`,
    };
  }

  const spaceRemainingInSlot = slot.maxCapacity - slot.bookedCount;
  if (spaceRemainingInSlot <= 0) {
    return {
      available: false,
      reason: 'This 30-minute session is at maximum capacity (5/5 people).',
    };
  }

  if (requestedGroupSize > spaceRemainingInSlot) {
    return {
      available: false,
      reason: `Only ${spaceRemainingInSlot} spot${spaceRemainingInSlot === 1 ? '' : 's'} left in this 30-min session (your group needs ${requestedGroupSize}).`,
    };
  }

  return { available: true };
}

/**
 * Validates the registration form fields
 */
export function validateBookingForm(
  data: {
    leadName: string;
    leadEmail: string;
    leadPhone: string;
    groupSize: number;
    attendees: { name: string }[];
    slotId: string;
  },
  selectedSlot: TimeSlot | undefined,
  remainingTotalQuota: number
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.leadName.trim()) {
    errors.leadName = 'Lead contact name is required.';
  } else if (data.leadName.trim().length < 2) {
    errors.leadName = 'Name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.leadEmail.trim()) {
    errors.leadEmail = 'Email address is required.';
  } else if (!emailRegex.test(data.leadEmail.trim())) {
    errors.leadEmail = 'Please provide a valid email address.';
  }

  if (!data.leadPhone.trim()) {
    errors.leadPhone = 'Contact phone number is required.';
  } else if (data.leadPhone.trim().replace(/\D/g, '').length < 7) {
    errors.leadPhone = 'Please enter a valid phone number (min 7 digits).';
  }

  if (data.groupSize < 1 || data.groupSize > 5) {
    errors.groupSize = 'Group size must be between 1 and 5 people.';
  }

  if (!data.slotId) {
    errors.slot = 'Please select an available 30-minute session.';
  } else {
    const slotCheck = checkSlotAvailability(selectedSlot, data.groupSize, remainingTotalQuota);
    if (!slotCheck.available) {
      errors.slot = slotCheck.reason || 'Selected slot is unavailable.';
    }
  }

  // Validate attendee names
  for (let i = 0; i < data.groupSize; i++) {
    const att = data.attendees[i];
    if (i > 0 && (!att || !att.name.trim())) {
      errors[`attendee_${i}`] = `Attendee #${i + 1} name is required.`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates an unmistakable, human-readable booking reference code (e.g. EMO-9X42)
 */
export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `EMO-${code}-${yearSuffix}`;
}

/**
 * Handles on-site ticket lookup and check-in status toggle
 */
export function verifyAndCheckIn(
  bookings: Booking[],
  referenceOrId: string
): {
  success: boolean;
  message: string;
  updatedBookings: Booking[];
  checkedInBooking?: Booking;
} {
  const cleanQuery = referenceOrId.trim().toUpperCase();
  const index = bookings.findIndex(
    (b) => b.reference.toUpperCase() === cleanQuery || b.id === cleanQuery || b.leadEmail.toUpperCase() === cleanQuery
  );

  if (index === -1) {
    return {
      success: false,
      message: 'No registration found matching that reference or email.',
      updatedBookings: bookings,
    };
  }

  const booking = bookings[index];

  if (booking.status === 'checked_in') {
    return {
      success: false,
      message: `Already checked in at ${booking.checkInTime || 'an earlier time'}.`,
      updatedBookings: bookings,
      checkedInBooking: booking,
    };
  }

  if (booking.status === 'cancelled') {
    return {
      success: false,
      message: 'This registration has been cancelled.',
      updatedBookings: bookings,
      checkedInBooking: booking,
    };
  }

  const updatedBooking: Booking = {
    ...booking,
    status: 'checked_in',
    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const updatedBookings = [...bookings];
  updatedBookings[index] = updatedBooking;

  return {
    success: true,
    message: `Welcome, ${booking.leadName}! Group of ${booking.groupSize} successfully verified and checked in.`,
    updatedBookings,
    checkedInBooking: updatedBooking,
  };
}
