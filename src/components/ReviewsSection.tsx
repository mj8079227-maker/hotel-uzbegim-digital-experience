import { useState } from 'react';
import { MessageSquarePlus, Star } from 'lucide-react';
import type { GuestReview, Room } from '../types/hotel';

interface ReviewsSectionProps {
  reviews: GuestReview[];
  rooms: Room[];
}

export function ReviewsSection({ reviews, rooms }: ReviewsSectionProps) {
  const [guestName, setGuestName] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [roomStayed, setRoomStayed] = useState(rooms[0]?.name || 'Deluxe King Room');
  const [stayDate, setStayDate] = useState(new Date().toISOString().slice(0, 7));
  const [reservationRef, setReservationRef] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          originCity,
          roomStayed,
          stayDate,
          reservationRef,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit your review.');
        return;
      }
      setSuccessMsg(
        data.message ||
          'Thank you for your feedback. Your genuine review has been recorded for verification by hotel management.'
      );
      setGuestName('');
      setOriginCity('');
      setReservationRef('');
      setComment('');
      setRating(5);
    } catch {
      setError('Network error while submitting your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="border-t border-[#0F291E]/10 bg-[#FAF7F0] py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Genuine Published Reviews */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
              Guest Perspectives
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl">
              Verified Guest Reviews
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#526058]">
              Every review displayed here is submitted directly by guests who have stayed at Hotel Uzbegim and verified by our management team.
            </p>

            {reviews.length === 0 ? (
              <div className="mt-10 border border-[#0F291E]/12 bg-white p-8 lg:p-10">
                <MessageSquarePlus className="h-7 w-7 text-[#9A7432]" />
                <h3 className="mt-4 font-serif text-2xl font-medium text-[#0F291E]">
                  No Published Guest Reviews Yet
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[#526058]">
                  Hotel Uzbegim publishes only authentic reviews submitted by verified guests. Have you recently stayed with us in Urgench? Share your experience using the review form.
                </p>
              </div>
            ) : (
              <div className="mt-10 space-y-6">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="border border-[#0F291E]/12 bg-white p-6 lg:p-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${
                              idx < review.rating
                                ? 'fill-[#B38A3E] text-[#B38A3E]'
                                : 'text-[#0F291E]/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs tabular-nums text-[#526058]">{review.stayDate}</span>
                    </div>

                    <p className="mt-4 font-serif text-xl leading-relaxed text-[#17221B]">
                      &ldquo;{review.comment}&rdquo;
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#0F291E]/10 pt-4 text-xs text-[#526058]">
                      <span className="font-semibold text-[#0F291E]">{review.guestName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.originCity}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.roomStayed}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right: Genuine Review Submission Form */}
          <div className="lg:col-span-5">
            <div className="border border-[#0F291E]/12 bg-white p-6 sm:p-8">
              <h3 className="font-serif text-2xl font-medium text-[#0F291E]">
                Share Your Stay Experience
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#526058]">
                Submitted reviews are verified by Hotel Uzbegim staff prior to publication.
              </p>

              <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Your Rating
                  </span>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        aria-label={`Rate ${starValue} out of 5`}
                        className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#0F291E]/12 hover:border-[#B38A3E]"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            starValue <= rating
                              ? 'fill-[#B38A3E] text-[#B38A3E]'
                              : 'text-[#0F291E]/25'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-medium tabular-nums text-[#0F291E]">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rev-name" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      Guest Name
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="rev-city" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      City / Country
                    </label>
                    <input
                      id="rev-city"
                      type="text"
                      placeholder="e.g. Tashkent, UZ"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rev-room" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      Room Type
                    </label>
                    <select
                      id="rev-room"
                      value={roomStayed}
                      onChange={(e) => setRoomStayed(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rev-date" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      Month of Stay
                    </label>
                    <input
                      id="rev-date"
                      type="month"
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rev-ref" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Reservation Reference (Optional)
                  </label>
                  <input
                    id="rev-ref"
                    type="text"
                    placeholder="UZB-2026-XXXXXX"
                    value={reservationRef}
                    onChange={(e) => setReservationRef(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 px-3 font-mono text-sm uppercase text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="rev-comment" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Your Review
                  </label>
                  <textarea
                    id="rev-comment"
                    required
                    rows={4}
                    minLength={10}
                    placeholder="Tell future guests about your stay at Hotel Uzbegim..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1.5 w-full rounded-sm border border-[#0F291E]/20 p-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                  />
                </div>

                {error && (
                  <div role="alert" className="border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs font-medium text-[#9A3412]">
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div role="status" className="border border-[#0F291E]/25 bg-[#FAF7F0] px-4 py-3 text-xs font-medium text-[#0F291E]">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-sm bg-[#0F291E] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap transition-colors hover:bg-[#193D2D] disabled:opacity-50"
                >
                  {submitting ? 'Submitting Review...' : 'Submit Guest Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
