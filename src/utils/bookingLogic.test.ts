import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingQuota,
  generateTimeSlots,
  checkSlotAvailability,
  validateBookingForm,
  generateBookingReference,
  verifyAndCheckIn,
  formatDateLabel,
  type Booking,
  type TimeSlot,
} from './bookingLogic.ts';

test('calculateRemainingQuota computes remaining tickets and percentage correctly', () => {
  const dummyBookings: Booking[] = [
    {
      id: 'b1',
      reference: 'EMO-TEST-26',
      leadName: 'Alice Morgan',
      leadEmail: 'alice@example.com',
      leadPhone: '555-0199',
      groupSize: 4,
      attendees: [{ name: 'Alice Morgan' }, { name: 'Bob' }, { name: 'Charlie' }, { name: 'Diana' }],
      slotId: '2026-11-20_1000',
      slotDate: '2026-11-20',
      slotTime: '10:00 - 10:30',
      status: 'confirmed',
      createdAt: '2026-10-14T10:00:00.000Z',
    },
    {
      id: 'b2',
      reference: 'EMO-CAN1-26',
      leadName: 'Cancelled User',
      leadEmail: 'cancelled@example.com',
      leadPhone: '555-0100',
      groupSize: 5,
      attendees: [],
      slotId: '2026-11-20_1030',
      slotDate: '2026-11-20',
      slotTime: '10:30 - 11:00',
      status: 'cancelled',
      createdAt: '2026-10-14T10:05:00.000Z',
    },
  ];

  const quota = calculateRemainingQuota(50, dummyBookings);
  // Cancelled booking should NOT count towards used quota
  assert.equal(quota.totalQuota, 50);
  assert.equal(quota.totalBooked, 4);
  assert.equal(quota.remaining, 46);
  assert.equal(quota.percentageUsed, 8);
});

test('checkSlotAvailability enforces shared 5-person capacity (group of 4 allows group of 1)', () => {
  const availableSlot: TimeSlot = {
    id: '2026-11-20_1000',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '10:30',
    maxGroups: 5,
    maxCapacity: 5,
    bookedCount: 0,
    bookedGroups: 0,
    remainingSpots: 5,
    isAvailable: true,
    status: 'available',
  };

  // Valid 3-person group with 10 tickets remaining
  const res1 = checkSlotAvailability(availableSlot, 3, 10);
  assert.equal(res1.available, true);

  // Group size exceeds 5
  const res2 = checkSlotAvailability(availableSlot, 6, 10);
  assert.equal(res2.available, false);

  // Group size 0
  const res3 = checkSlotAvailability(availableSlot, 0, 10);
  assert.equal(res3.available, false);

  // Remaining overall quota is less than group size (e.g., remaining 2, group wants 3)
  const res4 = checkSlotAvailability(availableSlot, 3, 2);
  assert.equal(res4.available, false);
  assert.match(res4.reason || '', /Only 2 tickets left/);

  // Slot has 4 people already booked (e.g., 1 group of 4)
  const slotWith4Booked: TimeSlot = {
    ...availableSlot,
    bookedCount: 4,
    bookedGroups: 1,
    remainingSpots: 1,
    isAvailable: true,
    status: 'available',
  };

  // Another group of 1 CAN book on that time as well!
  const resCanBook1 = checkSlotAvailability(slotWith4Booked, 1, 20);
  assert.equal(resCanBook1.available, true);

  // A group of 2 cannot (only 1 spot left)
  const resCannotBook2 = checkSlotAvailability(slotWith4Booked, 2, 20);
  assert.equal(resCannotBook2.available, false);
  assert.match(resCannotBook2.reason || '', /Only 1 spot left/);
});

test('generateTimeSlots generates 30-min intervals and correctly maps booked status', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'b-sample',
      reference: 'EMO-SAM1-26',
      leadName: 'John',
      leadEmail: 'john@example.com',
      leadPhone: '12345678',
      groupSize: 5,
      attendees: [{ name: 'John' }],
      slotId: '2026-11-20_1000',
      slotDate: '2026-11-20',
      slotTime: '10:00 - 10:30',
      status: 'confirmed',
      createdAt: '2026-10-14T10:00:00.000Z',
    },
  ];

  const slots = generateTimeSlots('2026-11-20', 10, 12, sampleBookings, 45);
  // From 10:00 to 12:00 = 4 slots: 10:00, 10:30, 11:00, 11:30
  assert.equal(slots.length, 4);

  const slot1 = slots[0];
  assert.equal(slot1.startTime, '10:00');
  assert.equal(slot1.endTime, '10:30');
  assert.equal(slot1.status, 'full');
  assert.equal(slot1.isAvailable, false);
  assert.equal(slot1.bookedGroups, 1);

  const slot2 = slots[1];
  assert.equal(slot2.startTime, '10:30');
  assert.equal(slot2.status, 'available');
  assert.equal(slot2.isAvailable, true);
});

test('validateBookingForm validates lead contact, attendee list, and slot', () => {
  const slot: TimeSlot = {
    id: '2026-11-20_1100',
    date: '2026-11-20',
    startTime: '11:00',
    endTime: '11:30',
    maxGroups: 1,
    maxCapacity: 5,
    bookedCount: 0,
    bookedGroups: 0,
    remainingSpots: 5,
    isAvailable: true,
    status: 'available',
  };

  // Missing email & phone
  const invalidRes = validateBookingForm(
    {
      leadName: 'Sarah',
      leadEmail: '',
      leadPhone: '',
      groupSize: 2,
      attendees: [{ name: 'Sarah' }, { name: '' }],
      slotId: slot.id,
    },
    slot,
    20
  );
  assert.equal(invalidRes.valid, false);
  assert.ok(invalidRes.errors.leadEmail);
  assert.ok(invalidRes.errors.leadPhone);
  assert.ok(invalidRes.errors.attendee_1);

  // Valid submission
  const validRes = validateBookingForm(
    {
      leadName: 'Sarah Connor',
      leadEmail: 'sarah@skynet.com',
      leadPhone: '+1-555-892-2341',
      groupSize: 2,
      attendees: [{ name: 'Sarah Connor' }, { name: 'John Connor' }],
      slotId: slot.id,
    },
    slot,
    20
  );
  assert.equal(validRes.valid, true);
});

test('generateBookingReference produces an EMO-XXXX-YY formatted code', () => {
  const code = generateBookingReference();
  assert.match(code, /^EMO-[2-9A-Z]{4}-\d{2}$/);
});

test('verifyAndCheckIn performs on-site check in and prevents double check-in', () => {
  const initialBookings: Booking[] = [
    {
      id: 'book-100',
      reference: 'EMO-ABCD-26',
      leadName: 'Neo Anderson',
      leadEmail: 'neo@matrix.org',
      leadPhone: '555-0101',
      groupSize: 2,
      attendees: [{ name: 'Neo' }, { name: 'Trinity' }],
      slotId: '2026-11-20_1400',
      slotDate: '2026-11-20',
      slotTime: '14:00 - 14:30',
      status: 'confirmed',
      createdAt: '2026-10-14T10:00:00.000Z',
    },
  ];

  // First check in succeeds
  const check1 = verifyAndCheckIn(initialBookings, 'EMO-ABCD-26');
  assert.equal(check1.success, true);
  assert.equal(check1.checkedInBooking?.status, 'checked_in');
  assert.ok(check1.checkedInBooking?.checkInTime);

  // Second check in fails because already checked in
  const check2 = verifyAndCheckIn(check1.updatedBookings, 'EMO-ABCD-26');
  assert.equal(check2.success, false);
  assert.match(check2.message, /Already checked in/);
});

test('formatDateLabel formats YYYY-MM-DD cleanly', () => {
  const formatted = formatDateLabel('2026-11-20');
  assert.equal(formatted.short, 'Nov 20');
  assert.match(formatted.label, /Friday/);
});

test('generateTimeSlots respects custom start/end hours and blocked slots', () => {
  const blockedId = '2026-11-25_1400';
  const slots = generateTimeSlots('2026-11-25', 13, 15, [], 50, [blockedId]);

  // Hours 13 to 15 -> 4 slots: 13:00, 13:30, 14:00, 14:30
  assert.equal(slots.length, 4);

  const blockedSlot = slots.find((s) => s.id === blockedId);
  assert.ok(blockedSlot);
  assert.equal(blockedSlot?.status, 'blocked');
  assert.equal(blockedSlot?.isAvailable, false);

  const check = checkSlotAvailability(blockedSlot, 2, 50);
  assert.equal(check.available, false);
  assert.match(check.reason || '', /blocked by the organizer/);
});

