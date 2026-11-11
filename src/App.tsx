import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ExperiencePreview } from './components/ExperiencePreview.tsx';
import { BookingSection } from './components/BookingSection.tsx';
import { TicketPassModal } from './components/TicketPassModal.tsx';
import { FindPassModal } from './components/FindPassModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminAuthModal } from './components/AdminAuthModal.tsx';
import { InfographicsModal } from './components/InfographicsModal.tsx';
import { Footer } from './components/Footer.tsx';
import {
  Booking,
  EventDateConfig,
  DEFAULT_QUOTA_CONFIG,
  calculateRemainingQuota,
} from './utils/bookingLogic.ts';
import { INITIAL_BOOKINGS, INITIAL_EVENT_DATES } from './data/seedData.ts';

const STORAGE_KEY_BOOKINGS = 'emotopia_earlybird_bookings_v1';
const STORAGE_KEY_QUOTA = 'emotopia_earlybird_total_quota_v1';
const STORAGE_KEY_DATES = 'emotopia_earlybird_dates_v1';
const STORAGE_KEY_AUTH = 'emotopia_admin_authenticated';

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved bookings:', e);
    }
    return INITIAL_BOOKINGS;
  });

  const [totalQuota, setTotalQuota] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUOTA);
      if (saved) return Number(saved);
    } catch (e) {
      console.error('Failed to load saved quota:', e);
    }
    return DEFAULT_QUOTA_CONFIG.totalEarlyBirdQuota;
  });

  const [dateConfigs, setDateConfigs] = useState<EventDateConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved dates:', e);
    }
    return INITIAL_EVENT_DATES;
  });

  // Admin Auth & Dashboard State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);

  // Customer Modals
  const [activeCustomerModal, setActiveCustomerModal] = useState<
    'ticket' | 'find_pass' | null
  >(null);
  const [showInfographicsModal, setShowInfographicsModal] = useState<boolean>(false);
  const [currentBookingPass, setCurrentBookingPass] = useState<Booking | null>(
    null
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error('Error caching bookings:', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUOTA, totalQuota.toString());
    } catch (e) {
      console.error('Error caching quota:', e);
    }
  }, [totalQuota]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATES, JSON.stringify(dateConfigs));
    } catch (e) {
      console.error('Error caching dates:', e);
    }
  }, [dateConfigs]);

  // Support #admin in URL or keyboard shortcut Ctrl+Shift+A
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        handleOpenAdmin();
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminAuthenticated]);

  // Derive quota stats
  const quotaStats = calculateRemainingQuota(totalQuota, bookings);

  // Scroll to register
  const scrollToRegister = () => {
    const el = document.getElementById('schedule');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open Admin Dashboard logic
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setShowAdminAuthModal(true);
    }
  };

  // On new customer booking created
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setCurrentBookingPass(newBooking);
    setActiveCustomerModal('ticket');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#6366f1', '#10b981'],
      });
    } catch (err) {
      // ignore
    }
  };

  const handleViewPass = (booking: Booking) => {
    setCurrentBookingPass(booking);
    setActiveCustomerModal('ticket');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Bar Navigation (Clean public view) */}
      <Navbar
        onRegisterClick={scrollToRegister}
        onFindPassClick={() => setActiveCustomerModal('find_pass')}
        onInfographicsClick={() => setShowInfographicsModal(true)}
        remainingQuota={quotaStats.remaining}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminClick={handleOpenAdmin}
      />

      {/* Main Public Attendee Flow */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          totalQuota={totalQuota}
          totalBooked={quotaStats.totalBooked}
          remainingQuota={quotaStats.remaining}
          percentageUsed={quotaStats.percentageUsed}
          onRegisterClick={scrollToRegister}
          onInfographicsClick={() => setShowInfographicsModal(true)}
        />

        {/* The 4 Chambers & Experience Breakdown */}
        <ExperiencePreview />

        {/* The Interactive Registration with Group Quota & 30-min Time Slots */}
        <BookingSection
          bookings={bookings}
          totalQuota={totalQuota}
          remainingQuota={quotaStats.remaining}
          dateConfigs={dateConfigs}
          onBookingSuccess={handleBookingSuccess}
        />
      </main>

      {/* Quiet Footer with discreet host link */}
      <Footer
        onRegisterClick={scrollToRegister}
        onOrganizerClick={handleOpenAdmin}
      />

      {/* Infographics & Spatial Map Modal */}
      {showInfographicsModal && (
        <InfographicsModal onClose={() => setShowInfographicsModal(false)} />
      )}

      {/* Customer Digital Ticket Pass Modal */}
      {activeCustomerModal === 'ticket' && (
        <TicketPassModal
          booking={currentBookingPass}
          onClose={() => {
            setActiveCustomerModal(null);
            setCurrentBookingPass(null);
          }}
        />
      )}

      {/* Customer Find My Pass Modal */}
      {activeCustomerModal === 'find_pass' && (
        <FindPassModal
          bookings={bookings}
          onSelectBooking={(b) => {
            setCurrentBookingPass(b);
            setActiveCustomerModal('ticket');
          }}
          onClose={() => setActiveCustomerModal(null)}
        />
      )}

      {/* Admin Passcode Gate Modal */}
      {showAdminAuthModal && (
        <AdminAuthModal
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            setShowAdminAuthModal(false);
            setIsAdminDashboardOpen(true);
          }}
          onClose={() => setShowAdminAuthModal(false)}
        />
      )}

      {/* Dedicated Full Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          dateConfigs={dateConfigs}
          bookings={bookings}
          totalQuota={totalQuota}
          remainingQuota={quotaStats.remaining}
          totalBooked={quotaStats.totalBooked}
          onSaveDateConfigs={(updated) => setDateConfigs(updated)}
          onUpdateBookings={(updated) => setBookings(updated)}
          onUpdateQuota={(newTotal) => setTotalQuota(newTotal)}
          onClose={() => {
            setIsAdminDashboardOpen(false);
            // clear hash if set
            if (window.location.hash === '#admin') {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onViewPass={handleViewPass}
        />
      )}
    </div>
  );
}
