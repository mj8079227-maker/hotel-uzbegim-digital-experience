import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import type { HotelSettings } from '../types/hotel';
import { HotelMap } from './HotelMap';

interface ContactSectionProps {
  settings: HotelSettings;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSentMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to send your message.');
        return;
      }
      setSentMessage(data.message || 'Thank you. Your inquiry has been delivered to our reception team.');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      setError('Network error while sending your message.');
    } finally {
      setSubmitting(false);
    }
  }

  const cleanWhatsappDigits = settings.whatsappNumber.replace(/[^\d]/g, '');
  const whatsappUrl = cleanWhatsappDigits
    ? `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(
        'Hello Hotel Uzbegim reception, I would like to inquire about a stay.'
      )}`
    : '';

  return (
    <section id="contact" className="border-t border-[#0F291E]/10 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
            Location &amp; Reception
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl lg:text-5xl">
            Contact Us in Urgench
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#526058]">
            Our reception desk welcomes inquiries regarding room availability, group stays, and regional travel assistance across Urgench and Khorezm.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left: Direct Contact Details & Interactive Google Map */}
          <div className="space-y-8 lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 border border-[#0F291E]/12 bg-[#FAF7F0] p-6 sm:grid-cols-2 lg:p-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7432]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Hotel Address</span>
                </div>
                <p className="mt-2 font-serif text-xl font-medium text-[#0F291E]">
                  {settings.address}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7432]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>Telephone</span>
                </div>
                <a
                  href={`tel:${settings.telephone.replace(/\s+/g, '')}`}
                  className="mt-2 inline-block font-serif text-xl font-medium tabular-nums text-[#0F291E] hover:text-[#9A7432] transition-colors"
                >
                  {settings.telephone}
                </a>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7432]">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Reception Email</span>
                </div>
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 inline-block text-sm font-medium text-[#0F291E] underline decoration-[#0F291E]/30 underline-offset-4 hover:decoration-[#9A7432]"
                >
                  {settings.email}
                </a>
              </div>

              {settings.whatsappApproved && cleanWhatsappDigits && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7432]">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>WhatsApp Concierge</span>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-[40px] items-center gap-2 rounded-sm bg-[#0F291E] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap hover:bg-[#193D2D]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Message on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            <HotelMap
              hotelName={settings.hotelName}
              address={settings.address}
              telephone={settings.telephone}
            />
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-5">
            <div className="border border-[#0F291E]/12 bg-[#FAF7F0] p-6 sm:p-8">
              <h3 className="font-serif text-2xl font-medium text-[#0F291E]">
                Send an Inquiry
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#526058]">
                Write directly to Hotel Uzbegim reception for bespoke requests, corporate stays, or family arrangements.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="ct-name" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Your Name
                  </label>
                  <input
                    id="ct-name"
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-white px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-email" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      Email
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-white px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-phone" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                      Phone (Optional)
                    </label>
                    <input
                      id="ct-phone"
                      type="tel"
                      placeholder="+998 ..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-white px-3 text-sm tabular-nums text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-subject" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Subject
                  </label>
                  <input
                    id="ct-subject"
                    type="text"
                    placeholder="Room rate inquiry, family booking, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-sm border border-[#0F291E]/20 bg-white px-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="ct-msg" className="block text-xs font-semibold uppercase tracking-wider text-[#526058]">
                    Message
                  </label>
                  <textarea
                    id="ct-msg"
                    required
                    rows={4}
                    placeholder="How may our reception team assist you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1.5 w-full rounded-sm border border-[#0F291E]/20 bg-white p-3 text-sm text-[#17221B] focus:border-[#0F291E] focus:outline-none"
                  />
                </div>

                {error && (
                  <div role="alert" className="border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-xs font-medium text-[#9A3412]">
                    {error}
                  </div>
                )}

                {sentMessage && (
                  <div role="status" className="border border-[#0F291E]/25 bg-white px-4 py-3 text-xs font-medium text-[#0F291E]">
                    {sentMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-sm bg-[#0F291E] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap transition-colors hover:bg-[#193D2D] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
