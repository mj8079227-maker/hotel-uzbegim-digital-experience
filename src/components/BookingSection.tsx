import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Search, Users, XCircle } from 'lucide-react';
import type { Room } from '../types/hotel';
import { formatRoomRate } from './RoomsSection';

interface BookingSectionProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoomId: (roomId: string) => void;
  checkInPolicy: string;
}

interface AvailabilityStatus {
  roomId: string;
  available: boolean;
  reason: string;
}

interface SubmittedReceipt {
  referenceCode: string;
  status: 'pending' | 'approved' | 'declined';
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  quotedTotal: number | null;
  quotedCurrency: 'USD' | 'UZS';
}

interface LookupResult {
  referenceCode: string;
  status: 'pending' | 'approved' | 'declined';
  roomName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  managementNote: string;
  quotedTotal: number | null;
  quotedCurrency: 'USD' | 'UZS';
  updatedAt: string;
}

function getDefaultDates() {
  const today = new Date();
  const checkInDate = new Date(today.getTime() + 86400000);
  const checkOutDate = new Date(today.getTime() + 86400000 * 3);
  return {
    checkIn: checkInDate.toISOString().slice(0, 10),
    checkOut: checkOutDate.toISOString().slice(0, 10),
  };
}

export function BookingSection({
  rooms,
  selectedRoomId,
  onSelectRoomId,
  checkInPolicy,
}: BookingSectionProps) {
  const defaults = getDefaultDates();
  const [activeTab, setActiveTab] = useState<'request' | 'status'>('request');

  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityStatus>>({});
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);

  const [lookupRef, setLookupRef] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return;
    let cancelled = false;

    async function checkDates() {
      setCheckingAvail(true);
      try {
        const params = new URLSearchParams({
          checkIn,
          checkOut,
          adults: String(adults),
          children: String(children),
        });
        const res = await fetch(`/api/availability?${params.toString()}`);
        if (!res.ok) return;
        const data = (await res.json()) as { rooms: AvailabilityStatus[] };
        if (!cancelled) {
          const nextMap: Record<string, AvailabilityStatus> = {};
          for (const item of data.rooms) {
            nextMap[item.roomId] = item;
          }
          setAvailabilityMap(nextMap);
        }
      } catch {
        // Silent fallback; validation also runs on submit
      } finally {
        if (!cancelled) setCheckingAvail(false);
      }
    }

    checkDates();
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, adults, children]);

  async function handleSubmitBooking(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!currentRoom) return;

    if (checkOut <= checkIn) {
      setFormError('Check-out date must be after check-in date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom.id,
          checkIn,
          checkOut,
          adults,
          children,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Could not submit reservation request.');
        return;
      }
      setReceipt(data as SubmittedReceipt);
      setLookupRef(data.referenceCode);
      setLookupEmail(guestEmail);
    } catch {
      setFormError('Network error while submitting your reservation request.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookup(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLookupError(null);
    setLookupLoading(true);
    try {
      const params = new URLSearchParams({
        ref: lookupRef.trim(),
        email: lookupEmail.trim(),
      });
      const res = await fetch(`/api/bookings/lookup?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupResult(null);
        setLookupError(data.error || 'Reservation not found.');
        return;
      }
      setLookupResult(data as LookupResult);
    } catch {
      setLookupError('Unable to check reservation status right now.');
    } finally {
      setLookupLoading(false);
    }
  }

  const currentAvailability = currentRoom ? availabilityMap[currentRoom.id] : undefined;
  const nightsCount =
    checkIn && checkOut && checkOut > checkIn
      ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000)
      : 0;

  return (
    <section id="booking" className="border-t border-[#0F291E]/10 bg-[#0F291E] py-20 text-[#FAF7F0] lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left editorial column */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4B26A]">
              Reservations
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              Reserve Your Stay at Hotel Uzbegim
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#FAF7F0]/80">
              Select your preferred arrival and departure dates, guest count, and room category. Every reservation request is reviewed directly by our reception management to issue an official booking confirmation.
            </p>

            <div className="mt-8 border-t border-white/15 pt-6">
              <h3 className="font-serif text-xl font-medium text-[#D4B26A]">
                How Confirmation Works
              </h3>
              <ol className="mt-4 space-y-3 text-sm text-[#FAF7F0]/85">
                <li className="flex gap-3">
                  <span className="font-serif text-base font-semibold tabular-nums text-[#D4B26A]">01.</span>
                  <span>Submit your preferred dates, guest count, and room selection.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-base font-semibold tabular-nums text-[#D4B26A]">02.</span>
                  <span>Receive an immediate Reservation Reference Code to track your request.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-base font-semibold tabular-nums text-[#D4B26A]">03.</span>
                  <span>Once approved by Hotel Uzbegim management, your official confirmation is issued.</span>
                </li>
              </ol>
              <p className="mt-6 text-xs leading-relaxed text-[#FAF7F0]/65">
                {checkInPolicy}
              </p>
            </div>
          </div>

          {/* Right reservation workspace */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 text-[#17221B] sm:p-8 lg:p-10">
              {/* Interactive Tab Switcher */}
              <div className="mb-8 flex border-b border-[#0F291E]/12">
                <button
                  type="button"
                  onClick={() => setActiveTab('request')}
                  className={`min-h-[44px] border-b-2 px-4 pb-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    activeTab === 'request'
                      ? 'border-[#0F291E] text-[#0F291E]'
                      : 'border-transparent text-[#526058] hover:text-[#0F291E]'
                  }`}
                >
                  Request Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className={`min-h-[44px] border-b-2 px-4 pb-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    activeTab === 'status'
                      ? 'border-[#0F291E] text-[#0F291E]'
                      : 'border-transparent text-[#526058] hover:text-[#0F291E]'
                  }`}
                >
                  Check Booking Confirmation
                </button>
              </div>

              {activeTab === 'request' ? (
                receipt ? (
                  <div className="space-y-6">
                    <div className="border border-[#0F291E]/15 bg-[#FAF7F0] p-6">
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7432]" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7432]">
                            Pending Hotel Approval
                          </p>
                          <h3 className="mt-1 font-serif text-2xl font-medium text-[#0F291E]">
                            Reservation Request Received
                          </h3>
                          <p className="mt-2 text-sm text-[#526058]">
                            Save your reference code below to check your confirmation status once Hotel Uzbegim management approves your stay.
                          </p>
                        </div>
                      </div>

                      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-[#0F291E]/10 pt-5 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Reference Code</dt>
                          <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-[#0F291E]">
                            {receipt.referenceCode}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Room Selected</dt>
                          <dd className="mt-1 font-medium text-[#0F291E]">{receipt.roomName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Dates</dt>
                          <dd className="mt-1 tabular-nums text-[#17221B]">
                            {receipt.checkIn} to {receipt.checkOut} ({receipt.nights}{' '}
                            {receipt.nights === 1 ? 'night' : 'nights'})
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Guests</dt>
                          <dd className="mt-1 tabular-nums text-[#17221B]">
                            {receipt.adults} {receipt.adults === 1 ? 'Adult' : 'Adults'}
                            {receipt.children > 0 ? `, ${receipt.children} Children` : ''}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('status');
                          handleLookup();
                        }}
                        className="min-h-[44px] rounded-sm bg-[#0F291E] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap hover:bg-[#193D2D]"
                      >
                        Track Confirmation Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceipt(null)}
                        className="min-h-[44px] rounded-sm border border-[#0F291E]/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0F291E] whitespace-nowrap hover:bg-[#FAF7F0]"
                      >
                        New Reservation Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="bk-checkin" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Check-in Date
                        </label>
                        <div className="relative mt-1.5">
                          <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#526058]" />
                          <input
                            id="bk-checkin"
                            type="date"
                            required
                            min={new Date().toISOString().slice(0, 10)}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-[#FAF7F0]/60 pl-10 pr-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="bk-checkout" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Check-out Date
                        </label>
                        <div className="relative mt-1.5">
                          <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#526058]" />
                          <input
                            id="bk-checkout"
                            type="date"
                            required
                            min={checkIn}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-[#FAF7F0]/60 pl-10 pr-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label htmlFor="bk-adults" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Adults
                        </label>
                        <div className="relative mt-1.5">
                          <Users className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#526058]" />
                          <select
                            id="bk-adults"
                            value={adults}
                            onChange={(e) => setAdults(Number(e.target.value))}
                            className="min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-[#FAF7F0]/60 pl-10 pr-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                          >
                            {[1, 2, 3, 4].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Adult' : 'Adults'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="bk-children" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Children
                        </label>
                        <select
                          id="bk-children"
                          value={children}
                          onChange={(e) => setChildren(Number(e.target.value))}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-[#FAF7F0]/60 px-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        >
                          {[0, 1, 2, 3].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Child' : 'Children'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="bk-room" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Preferred Room
                        </label>
                        <select
                          id="bk-room"
                          value={currentRoom?.id || ''}
                          onChange={(e) => onSelectRoomId(e.target.value)}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-[#FAF7F0]/60 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        >
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Live Availability Feedback */}
                    {currentRoom && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border border-[#0F291E]/10 bg-[#FAF7F0] px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          {checkingAvail ? (
                            <span className="text-[#526058]">Checking room availability...</span>
                          ) : currentAvailability ? (
                            currentAvailability.available ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F291E]" />
                                <span className="font-medium text-[#0F291E]">
                                  {currentRoom.name} · {currentAvailability.reason}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 shrink-0 text-[#9A3412]" />
                                <span className="font-medium text-[#9A3412]">
                                  {currentRoom.name} · {currentAvailability.reason}
                                </span>
                              </>
                            )
                          ) : (
                            <span className="text-[#526058]">{currentRoom.name}</span>
                          )}
                        </div>
                        <span className="font-medium tabular-nums text-[#0F291E]">
                          {nightsCount > 0 ? `${nightsCount} ${nightsCount === 1 ? 'night' : 'nights'} · ` : ''}
                          {formatRoomRate(currentRoom)}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="bk-name" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Full Name
                        </label>
                        <input
                          id="bk-name"
                          type="text"
                          required
                          placeholder="Guest full name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="bk-email" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Email Address
                        </label>
                        <input
                          id="bk-email"
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bk-phone" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                        Telephone Number
                      </label>
                      <input
                        id="bk-phone"
                        type="tel"
                        required
                        placeholder="+998 ..."
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="bk-notes" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        id="bk-notes"
                        rows={2}
                        placeholder="Arrival time, bedding preferences, or family requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="mt-1.5 w-full rounded-sm border border-[#0F291E]/20 p-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                      />
                    </div>

                    {formError && (
                      <div role="alert" className="border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs font-medium text-[#9A3412]">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || (currentAvailability ? !currentAvailability.available : false)}
                      className="flex min-h-[48px] w-full items-center justify-center rounded-sm bg-[#0F291E] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap transition-colors hover:bg-[#193D2D] disabled:cursor-not-allowed disabled:bg-[#526058]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B38A3E]"
                    >
                      {submitting ? 'Submitting Request...' : 'Submit Reservation Request'}
                    </button>
                  </form>
                )
              ) : (
                <div className="space-y-6">
                  <form onSubmit={handleLookup} className="space-y-4">
                    <p className="text-sm text-[#526058]">
                      Enter your Reservation Reference Code and email address to view your current approval status and download or print your hotel confirmation once approved.
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="lk-ref" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Reference Code
                        </label>
                        <input
                          id="lk-ref"
                          type="text"
                          required
                          placeholder="UZB-2026-XXXXXX"
                          value={lookupRef}
                          onChange={(e) => setLookupRef(e.target.value)}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 font-mono text-sm uppercase text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="lk-email" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                          Guest Email
                        </label>
                        <input
                          id="lk-email"
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={lookupEmail}
                          onChange={(e) => setLookupEmail(e.target.value)}
                          className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-[#0F291E] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap hover:bg-[#193D2D]"
                    >
                      <Search className="h-4 w-4" />
                      <span>{lookupLoading ? 'Checking...' : 'Check Status'}</span>
                    </button>
                  </form>

                  {lookupError && (
                    <div role="alert" className="border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs font-medium text-[#9A3412]">
                      {lookupError}
                    </div>
                  )}

                  {lookupResult && (
                    <div className="border border-[#0F291E]/15 bg-[#FAF7F0] p-6">
                      <div className="flex items-start gap-3">
                        {lookupResult.status === 'approved' ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F291E]" />
                        ) : lookupResult.status === 'declined' ? (
                          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#9A3412]" />
                        ) : (
                          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7432]" />
                        )}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
                            {lookupResult.status === 'approved'
                              ? 'Official Booking Confirmation'
                              : lookupResult.status === 'declined'
                                ? 'Reservation Request Declined'
                                : 'Awaiting Hotel Management Approval'}
                          </p>
                          <h4 className="mt-1 font-serif text-2xl font-medium text-[#0F291E]">
                            {lookupResult.guestName} · {lookupResult.referenceCode}
                          </h4>
                          {lookupResult.managementNote && (
                            <p className="mt-2 text-sm text-[#17221B]/85">
                              Management note: {lookupResult.managementNote}
                            </p>
                          )}
                        </div>
                      </div>

                      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#0F291E]/10 pt-4 text-sm">
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Room</dt>
                          <dd className="mt-1 font-medium text-[#0F291E]">{lookupResult.roomName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wider text-[#526058]">Dates</dt>
                          <dd className="mt-1 tabular-nums text-[#17221B]">
                            {lookupResult.checkIn} to {lookupResult.checkOut}
                          </dd>
                        </div>
                        {lookupResult.quotedTotal !== null && (
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[#526058]">Confirmed Total</dt>
                            <dd className="mt-1 font-semibold tabular-nums text-[#0F291E]">
                              {lookupResult.quotedCurrency === 'UZS'
                                ? `${new Intl.NumberFormat('en-US').format(lookupResult.quotedTotal)} UZS`
                                : `$${new Intl.NumberFormat('en-US').format(lookupResult.quotedTotal)}`}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
