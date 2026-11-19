import { useEffect, useState } from 'react';
import { Check, Lock, LogOut, X } from 'lucide-react';
import type {
  BookingRequest,
  ContactInquiry,
  GuestReview,
  HotelSettings,
  Room,
} from '../types/hotel';

interface StaffPortalModalProps {
  open: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

interface StaffDashboardPayload {
  rooms: Room[];
  bookings: BookingRequest[];
  reviews: GuestReview[];
  inquiries: ContactInquiry[];
  settings: HotelSettings;
}

export function StaffPortalModal({ open, onClose, onDataUpdated }: StaffPortalModalProps) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.sessionStorage.getItem('uzbegim_staff_token') : null
  );
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<'bookings' | 'rooms' | 'reviews' | 'settings'>('bookings');
  const [dashboard, setDashboard] = useState<StaffDashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function fetchDashboard(activeToken: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.status === 401) {
        window.sessionStorage.removeItem('uzbegim_staff_token');
        setToken(null);
        setDashboard(null);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as StaffDashboardPayload;
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && token) {
      fetchDashboard(token);
    }
  }, [open, token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Access denied.');
        return;
      }
      window.sessionStorage.setItem('uzbegim_staff_token', data.token);
      setToken(data.token);
      setPasscode('');
    } catch {
      setAuthError('Network error during sign-in.');
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem('uzbegim_staff_token');
    setToken(null);
    setDashboard(null);
  }

  async function updateBooking(
    id: string,
    status: 'approved' | 'declined',
    managementNote: string,
    quotedTotal: number | null,
    quotedCurrency: 'USD' | 'UZS'
  ) {
    if (!token) return;
    const res = await fetch(`/api/staff/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, managementNote, quotedTotal, quotedCurrency }),
    });
    if (res.ok) {
      setFeedback(`Reservation updated to ${status}.`);
      await fetchDashboard(token);
      onDataUpdated();
    }
  }

  async function updateRoom(room: Room) {
    if (!token) return;
    const res = await fetch(`/api/staff/rooms/${room.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pricePerNight: room.pricePerNight,
        currency: room.currency,
        description: room.description,
        capacityAdults: room.capacityAdults,
        capacityChildren: room.capacityChildren,
        bedConfiguration: room.bedConfiguration,
        available: room.available,
      }),
    });
    if (res.ok) {
      setFeedback(`${room.name} details updated.`);
      await fetchDashboard(token);
      onDataUpdated();
    }
  }

  async function moderateReview(id: string, status: 'approved' | 'declined') {
    if (!token) return;
    const res = await fetch(`/api/staff/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setFeedback(`Review marked as ${status}.`);
      await fetchDashboard(token);
      onDataUpdated();
    }
  }

  async function saveSettings(settings: HotelSettings) {
    if (!token) return;
    const res = await fetch('/api/staff/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setFeedback('Hotel settings and policies saved.');
      await fetchDashboard(token);
      onDataUpdated();
    }
  }

  async function markInquiryReplied(id: string) {
    if (!token) return;
    const res = await fetch(`/api/staff/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'replied' }),
    });
    if (res.ok) {
      await fetchDashboard(token);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hotel Uzbegim Staff Content Management"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F291E]/75 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden bg-[#FAF7F0] text-[#17221B] shadow-2xl border border-[#0F291E]/20">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#0F291E]/12 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7432]">
              Management Console
            </p>
            <h2 className="font-serif text-2xl font-medium text-[#0F291E]">
              Hotel Uzbegim Staff Portal
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-[#0F291E]/20 px-3 py-1.5 text-xs font-medium text-[#0F291E] hover:bg-[#FAF7F0]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Staff Portal"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#0F291E]/20 text-[#0F291E] hover:bg-[#FAF7F0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!token ? (
            <div className="mx-auto max-w-md border border-[#0F291E]/12 bg-white p-8">
              <div className="flex items-center gap-2 text-[#9A7432]">
                <Lock className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Authorized Personnel
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-medium text-[#0F291E]">
                Staff Sign In
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#526058]">
                Manage room rates, approve reservation requests, publish verified guest reviews, and configure WhatsApp concierge availability. Default management demo access code: <span className="font-mono font-semibold text-[#0F291E]">UZBEGIM2026</span>
              </p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="staff-code" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Staff Access Code
                  </label>
                  <input
                    id="staff-code"
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter staff code"
                    className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm focus:border-[#0F291E] focus:outline-none"
                  />
                </div>
                {authError && (
                  <p role="alert" className="text-xs font-medium text-[#9A3412]">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="min-h-[44px] w-full rounded-sm bg-[#0F291E] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] hover:bg-[#193D2D]"
                >
                  {loggingIn ? 'Verifying...' : 'Access Staff Console'}
                </button>
              </form>
            </div>
          ) : loading || !dashboard ? (
            <p className="py-12 text-center text-sm text-[#526058]">Loading hotel records...</p>
          ) : (
            <div className="space-y-6">
              {feedback && (
                <div className="flex items-center justify-between border border-[#0F291E]/20 bg-white px-4 py-3 text-xs font-medium text-[#0F291E]">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#9A7432]" />
                    {feedback}
                  </span>
                  <button type="button" onClick={() => setFeedback(null)} className="text-[#526058] hover:text-[#0F291E]">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-[#0F291E]/12">
                {[
                  { id: 'bookings', label: `Reservations (${dashboard.bookings.length})` },
                  { id: 'rooms', label: `Rooms & Pricing (${dashboard.rooms.length})` },
                  { id: 'reviews', label: `Guest Reviews (${dashboard.reviews.length})` },
                  { id: 'settings', label: `Settings & Inquiries (${dashboard.inquiries.length})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id as typeof tab)}
                    className={`min-h-[44px] border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                      tab === item.id
                        ? 'border-[#0F291E] text-[#0F291E]'
                        : 'border-transparent text-[#526058] hover:text-[#0F291E]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === 'bookings' && (
                <div className="space-y-4">
                  {dashboard.bookings.length === 0 ? (
                    <p className="border border-[#0F291E]/10 bg-white p-8 text-center text-sm text-[#526058]">
                      No reservation requests submitted yet.
                    </p>
                  ) : (
                    dashboard.bookings.map((bk) => (
                      <BookingRowEditor key={bk.id} booking={bk} onSave={updateBooking} />
                    ))
                  )}
                </div>
              )}

              {tab === 'rooms' && (
                <div className="space-y-4">
                  {dashboard.rooms.map((room) => (
                    <RoomRowEditor key={room.id} room={room} onSave={updateRoom} />
                  ))}
                </div>
              )}

              {tab === 'reviews' && (
                <div className="space-y-4">
                  {dashboard.reviews.length === 0 ? (
                    <p className="border border-[#0F291E]/10 bg-white p-8 text-center text-sm text-[#526058]">
                      No guest reviews have been submitted yet.
                    </p>
                  ) : (
                    dashboard.reviews.map((rev) => (
                      <div key={rev.id} className="border border-[#0F291E]/12 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#526058]">
                          <span>
                            <strong className="text-[#0F291E]">{rev.guestName}</strong> · {rev.originCity} · {rev.roomStayed} · {rev.rating}/5
                          </span>
                          <span className="font-semibold uppercase text-[#0F291E]">Status: {rev.status}</span>
                        </div>
                        <p className="mt-3 text-sm text-[#17221B]">{rev.comment}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moderateReview(rev.id, 'approved')}
                            className="min-h-[38px] rounded-sm bg-[#0F291E] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0]"
                          >
                            Approve &amp; Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => moderateReview(rev.id, 'declined')}
                            className="min-h-[38px] rounded-sm border border-[#9A3412]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9A3412]"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'settings' && (
                <SettingsAndInquiriesEditor
                  settings={dashboard.settings}
                  inquiries={dashboard.inquiries}
                  onSaveSettings={saveSettings}
                  onMarkReplied={markInquiryReplied}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingRowEditor({
  booking,
  onSave,
}: {
  booking: BookingRequest;
  onSave: (
    id: string,
    status: 'approved' | 'declined',
    note: string,
    total: number | null,
    currency: 'USD' | 'UZS'
  ) => Promise<void>;
}) {
  const [note, setNote] = useState(booking.managementNote);
  const [totalStr, setTotalStr] = useState(booking.quotedTotal !== null ? String(booking.quotedTotal) : '');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>(booking.quotedCurrency);

  return (
    <div className="border border-[#0F291E]/12 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0F291E]/10 pb-3">
        <div>
          <span className="font-mono text-xs font-semibold text-[#9A7432]">{booking.referenceCode}</span>
          <h4 className="font-serif text-xl font-medium text-[#0F291E]">
            {booking.guestName} · {booking.roomName}
          </h4>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0F291E]">
          Status: {booking.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#526058] sm:grid-cols-3">
        <div>Dates: <strong className="tabular-nums text-[#17221B]">{booking.checkIn} → {booking.checkOut}</strong></div>
        <div>Guests: <strong className="tabular-nums text-[#17221B]">{booking.adults} Adults, {booking.children} Children</strong></div>
        <div>Contact: <strong className="text-[#17221B]">{booking.guestEmail} · {booking.guestPhone}</strong></div>
      </div>
      {booking.specialRequests && (
        <p className="mt-2 text-xs text-[#526058]">Requests: {booking.specialRequests}</p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="number"
          min="0"
          placeholder="Confirmed total (optional)"
          value={totalStr}
          onChange={(e) => setTotalStr(e.target.value)}
          className="min-h-[40px] rounded-sm border border-[#0F291E]/20 px-3 text-xs tabular-nums"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'USD' | 'UZS')}
          className="min-h-[40px] rounded-sm border border-[#0F291E]/20 px-3 text-xs"
        >
          <option value="USD">USD</option>
          <option value="UZS">UZS</option>
        </select>
        <input
          type="text"
          placeholder="Confirmation note for guest"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[40px] rounded-sm border border-[#0F291E]/20 px-3 text-xs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onSave(
              booking.id,
              'approved',
              note || 'Confirmed by Hotel Uzbegim reception.',
              totalStr === '' ? null : Number(totalStr),
              currency
            )
          }
          className="min-h-[40px] rounded-sm bg-[#0F291E] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0]"
        >
          Approve &amp; Confirm
        </button>
        <button
          type="button"
          onClick={() =>
            onSave(
              booking.id,
              'declined',
              note || 'Requested room unavailable for selected dates.',
              totalStr === '' ? null : Number(totalStr),
              currency
            )
          }
          className="min-h-[40px] rounded-sm border border-[#9A3412]/35 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9A3412]"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function RoomRowEditor({ room, onSave }: { room: Room; onSave: (room: Room) => Promise<void> }) {
  const [priceStr, setPriceStr] = useState(room.pricePerNight !== null ? String(room.pricePerNight) : '');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>(room.currency);
  const [description, setDescription] = useState(room.description);
  const [available, setAvailable] = useState(room.available);

  return (
    <div className="border border-[#0F291E]/12 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-serif text-xl font-medium text-[#0F291E]">{room.name}</h4>
        <label className="flex items-center gap-2 text-xs font-medium text-[#0F291E]">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="h-4 w-4 accent-[#0F291E]"
          />
          <span>Available for requests</span>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
            Nightly Rate (blank = confirm on request)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Leave blank until set"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'UZS')}
            className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs"
          >
            <option value="USD">USD</option>
            <option value="UZS">UZS</option>
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
          Room Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-sm border border-[#0F291E]/20 p-2.5 text-xs"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          onSave({
            ...room,
            pricePerNight: priceStr.trim() === '' ? null : Number(priceStr),
            currency,
            description,
            available,
          })
        }
        className="mt-3 min-h-[40px] rounded-sm bg-[#0F291E] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0]"
      >
        Save Room Changes
      </button>
    </div>
  );
}

function SettingsAndInquiriesEditor({
  settings,
  inquiries,
  onSaveSettings,
  onMarkReplied,
}: {
  settings: HotelSettings;
  inquiries: ContactInquiry[];
  onSaveSettings: (s: HotelSettings) => Promise<void>;
  onMarkReplied: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<HotelSettings>(settings);

  return (
    <div className="space-y-6">
      <div className="border border-[#0F291E]/12 bg-white p-5 space-y-4">
        <h4 className="font-serif text-xl font-medium text-[#0F291E]">
          WhatsApp Approval, Policies &amp; Social Links
        </h4>

        <label className="flex items-center gap-3 text-sm font-medium text-[#0F291E]">
          <input
            type="checkbox"
            checked={draft.whatsappApproved}
            onChange={(e) => setDraft({ ...draft, whatsappApproved: e.target.checked })}
            className="h-4 w-4 accent-[#0F291E]"
          />
          <span>Approve WhatsApp Contact Option on Public Website</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={draft.whatsappNumber}
              onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
              className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
              Reception Email
            </label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
            Check-In &amp; Stay Policy
          </label>
          <textarea
            rows={2}
            value={draft.checkInPolicy}
            onChange={(e) => setDraft({ ...draft, checkInPolicy: e.target.value })}
            className="mt-1 w-full rounded-sm border border-[#0F291E]/20 p-2.5 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
              Instagram URL
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={draft.socialLinks.instagram}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  socialLinks: { ...draft.socialLinks, instagram: e.target.value },
                })
              }
              className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
              Facebook URL
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={draft.socialLinks.facebook}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  socialLinks: { ...draft.socialLinks, facebook: e.target.value },
                })
              }
              className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
              Telegram Channel / Handle
            </label>
            <input
              type="url"
              placeholder="https://t.me/..."
              value={draft.socialLinks.telegram}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  socialLinks: { ...draft.socialLinks, telegram: e.target.value },
                })
              }
              className="mt-1 min-h-[40px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-xs"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSaveSettings(draft)}
          className="min-h-[40px] rounded-sm bg-[#0F291E] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0]"
        >
          Save Hotel Settings
        </button>
      </div>

      <div className="border border-[#0F291E]/12 bg-white p-5">
        <h4 className="font-serif text-xl font-medium text-[#0F291E]">
          Guest Contact Inquiries ({inquiries.length})
        </h4>
        {inquiries.length === 0 ? (
          <p className="mt-3 text-xs text-[#526058]">No inquiries received yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="border border-[#0F291E]/10 bg-[#FAF7F0] p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[#0F291E]">
                    {inq.name} · {inq.subject}
                  </strong>
                  <span className="uppercase text-[#526058]">{inq.status}</span>
                </div>
                <p className="mt-1 text-[#526058]">
                  {inq.email} {inq.phone ? `· ${inq.phone}` : ''}
                </p>
                <p className="mt-2 text-sm text-[#17221B]">{inq.message}</p>
                {inq.status === 'new' && (
                  <button
                    type="button"
                    onClick={() => onMarkReplied(inq.id)}
                    className="mt-3 rounded-sm border border-[#0F291E]/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0F291E]"
                  >
                    Mark as Replied
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
