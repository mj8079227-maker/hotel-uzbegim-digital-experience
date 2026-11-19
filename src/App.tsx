import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BellRing,
  Car,
  Coffee,
  Home,
  MapPin,
  Phone,
  Settings,
  Share2,
  Snowflake,
  Wifi,
} from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { BookingSection } from './components/BookingSection';
import { ContactSection } from './components/ContactSection';
import { GallerySection } from './components/GallerySection';
import { Header } from './components/Header';
import { ResilientImage } from './components/ResilientImage';
import { ReviewsSection } from './components/ReviewsSection';
import { RoomsSection } from './components/RoomsSection';
import { StaffPortalModal } from './components/StaffPortalModal';
import type { PublicHotelPayload } from './types/hotel';

const FALLBACK_DATA: PublicHotelPayload = {
  rooms: [
    {
      id: 'room-deluxe-king',
      slug: 'deluxe-king',
      name: 'Deluxe King Room',
      category: 'Guest Room',
      description:
        'Refined sanctuary tailored with warm plaster tones, natural linen drapery, and artisanal Khorezm textile accents for tranquil rest in Urgench.',
      imageUrl: '/src/assets/images/room_deluxe_king_1795013279015.jpg',
      capacityAdults: 2,
      capacityChildren: 1,
      bedConfiguration: '1 King Bed',
      facilities: ['Air-conditioned rooms', 'Free Wi-Fi', 'Breakfast', 'Room service'],
      pricePerNight: null,
      currency: 'USD',
      available: true,
    },
    {
      id: 'room-executive-suite',
      slug: 'executive-suite',
      name: 'Executive Suite',
      category: 'Suite',
      description:
        'Expansive suite featuring an arched separation between the private bedroom and sunlit salon, ideal for international guests and extended business stays.',
      imageUrl: '/src/assets/images/room_executive_suite_1795013278188.jpg',
      capacityAdults: 2,
      capacityChildren: 2,
      bedConfiguration: '1 King Bed & Salon Seating',
      facilities: ['Air-conditioned rooms', 'Free Wi-Fi', 'Breakfast', 'Room service'],
      pricePerNight: null,
      currency: 'USD',
      available: true,
    },
    {
      id: 'room-family-suite',
      slug: 'family-accommodation-suite',
      name: 'Family Accommodation Suite',
      category: 'Family Suite',
      description:
        'Thoughtfully proportioned for families traveling together across Uzbekistan, combining dual queen beds with a generous living lounge.',
      imageUrl: '/src/assets/images/room_family_residence_1795013279029.jpg',
      capacityAdults: 4,
      capacityChildren: 2,
      bedConfiguration: '2 Queen Beds & Family Lounge',
      facilities: ['Family accommodation', 'Air-conditioned rooms', 'Free Wi-Fi', 'Breakfast', 'Room service'],
      pricePerNight: null,
      currency: 'USD',
      available: true,
    },
  ],
  facilities: [
    {
      id: 'fac-wifi',
      name: 'Free Wi-Fi',
      summary: 'Complimentary wireless internet connectivity throughout guest rooms, reception, and dining spaces.',
      verified: true,
    },
    {
      id: 'fac-breakfast',
      name: 'Breakfast',
      summary: 'Fresh morning breakfast service prepared daily in our sunlit dining room.',
      verified: true,
    },
    {
      id: 'fac-parking',
      name: 'Free parking',
      summary: 'Complimentary on-site guest parking for arrivals by private vehicle or regional transfer.',
      verified: true,
    },
    {
      id: 'fac-ac',
      name: 'Air-conditioned rooms',
      summary: 'Individual climate control in every guest room and suite for year-round comfort in Khorezm.',
      verified: true,
    },
    {
      id: 'fac-room-service',
      name: 'Room service',
      summary: 'In-room hospitality and dining service attended directly by our hotel team.',
      verified: true,
    },
    {
      id: 'fac-family',
      name: 'Family accommodation',
      summary: 'Spacious multi-bed suites and welcoming arrangements tailored for traveling families.',
      verified: true,
    },
  ],
  gallery: [
    {
      id: 'gal-exterior',
      title: 'Hotel Exterior & Courtyard',
      category: 'Exterior & Courtyard',
      imageUrl: '/src/assets/images/hero_hotel_uzbegim_1795013277720.jpg',
      caption: 'Evening illumination across the travertine arches and central courtyard.',
    },
    {
      id: 'gal-reception',
      title: 'Reception & Concierge Lounge',
      category: 'Reception',
      imageUrl: '/src/assets/images/hotel_reception_lounge_clean_1795013295679.jpg',
      caption: 'Warm welcome at our emerald marble reception desk.',
    },
    {
      id: 'gal-deluxe',
      title: 'Deluxe King Room',
      category: 'Rooms & Suites',
      imageUrl: '/src/assets/images/room_deluxe_king_1795013279015.jpg',
      caption: 'Tailored comfort with crisp linens and Uzbek silk accents.',
    },
    {
      id: 'gal-executive',
      title: 'Executive Suite Salon',
      category: 'Rooms & Suites',
      imageUrl: '/src/assets/images/room_executive_suite_1795013278188.jpg',
      caption: 'Private lounge and arched sleeping quarters bathed in natural daylight.',
    },
    {
      id: 'gal-family',
      title: 'Family Accommodation Suite',
      category: 'Rooms & Suites',
      imageUrl: '/src/assets/images/room_family_residence_1795013279029.jpg',
      caption: 'Generous dual-bed sanctuary designed for families visiting Urgench and Khiva.',
    },
    {
      id: 'gal-dining',
      title: 'Morning Breakfast Salon',
      category: 'Dining',
      imageUrl: '/src/assets/images/hotel_dining_breakfast_1795013280260.jpg',
      caption: 'Fresh seasonal fruit, pastries, and warm hospitality each morning.',
    },
  ],
  reviews: [],
  settings: {
    hotelName: 'Hotel Uzbegim',
    address: 'A. Bakhodirhon 182/1, Urgench, Uzbekistan',
    telephone: '+998 62 226 11 01',
    email: 'reservations@hoteluzbegim.uz',
    whatsappApproved: false,
    whatsappNumber: '+998622261101',
    checkInPolicy: 'Check-in, check-out, and stay terms are confirmed directly by hotel management upon booking approval.',
    cancellationPolicy: 'Modification and cancellation terms are communicated with your reservation confirmation.',
    socialLinks: {
      instagram: '',
      facebook: '',
      telegram: '',
    },
  },
};

function getFacilityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('wi-fi')) return Wifi;
  if (lower.includes('breakfast')) return Coffee;
  if (lower.includes('parking')) return Car;
  if (lower.includes('air')) return Snowflake;
  if (lower.includes('room service')) return BellRing;
  return Home;
}

export default function App() {
  const [hotelData, setHotelData] = useState<PublicHotelPayload>(FALLBACK_DATA);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(FALLBACK_DATA.rooms[0].id);
  const [staffOpen, setStaffOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const loadHotelData = useCallback(async () => {
    try {
      const res = await fetch('/api/public');
      if (!res.ok) return;
      const data = (await res.json()) as PublicHotelPayload;
      setHotelData(data);
    } catch {
      // Keep fallback data seamlessly
    }
  }, []);

  useEffect(() => {
    loadHotelData();
  }, [loadHotelData]);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  function scrollToBooking(roomId?: string) {
    if (roomId) setSelectedRoomId(roomId);
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleShareSite() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hotel Uzbegim – Urgench, Uzbekistan',
          text: 'Welcome to Hotel Uzbegim at A. Bakhodirhon 182/1, Urgench, Uzbekistan.',
          url,
        });
        return;
      } catch {
        // User canceled share
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareToast('Website link copied to clipboard.');
      setTimeout(() => setShareToast(null), 3000);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF7F0] text-[#17221B]">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Header onBookClick={() => scrollToBooking()} />

        <main>
          {/* 1. HERO SECTION */}
          <section id="home" className="relative overflow-hidden bg-[#0F291E]">
            <div className="relative min-h-[78vh] w-full flex items-end">
              <ResilientImage
                src="/src/assets/images/hero_hotel_uzbegim_1795013277720.jpg"
                alt="Hotel Uzbegim courtyard and illuminated limestone arches at dusk in Urgench"
                className="absolute inset-0 h-full w-full object-cover"
                aspectClassName="h-full w-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0F291E]/95 via-[#0F291E]/55 to-[#0F291E]/25"
              />

              <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-16 pt-32 lg:px-10 lg:pb-24">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-3xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D4B26A]">
                    Urgench · Khorezm · Uzbekistan
                  </p>
                  <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Welcome to Hotel Uzbegim.
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-[#FAF7F0]/90 sm:text-lg">
                    A serene sanctuary of Khorezm architectural grace and attentive international hospitality at A. Bakhodirhon 182/1, welcoming travelers to the historic heart of Urgench.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => scrollToBooking()}
                      className="inline-flex min-h-[48px] items-center gap-2.5 rounded-sm bg-[#B38A3E] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#9A7432] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span>Book Your Stay</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <a
                      href="#rooms"
                      className="inline-flex min-h-[48px] items-center rounded-sm border border-white/35 bg-[#0F291E]/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap backdrop-blur-xs transition-colors duration-150 hover:bg-white/15"
                    >
                      Explore Rooms
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Operational Address & Telephone Strip */}
            <div className="border-t border-white/12 bg-[#0F291E] text-[#FAF7F0]/85">
              <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-6 py-5 text-xs sm:grid-cols-3 lg:px-10">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-[#D4B26A]" aria-hidden="true" />
                  <span>{hotelData.settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-[#D4B26A]" aria-hidden="true" />
                  <a
                    href={`tel:${hotelData.settings.telephone.replace(/\s+/g, '')}`}
                    className="tabular-nums hover:text-white transition-colors"
                  >
                    {hotelData.settings.telephone}
                  </a>
                </div>
                <div className="flex items-center sm:justify-end">
                  <span className="text-[#D4B26A]">Free Wi-Fi · Breakfast · Free Parking</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. ABOUT US */}
          <section id="about" className="bg-[#FAF7F0] py-20 lg:py-28">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
              <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <div className="h-full min-h-[340px] overflow-hidden border border-[#0F291E]/12 bg-[#F1EBE0]">
                    <ResilientImage
                      src="/src/assets/images/hotel_reception_lounge_clean_1795013295679.jpg"
                      alt="Hotel Uzbegim reception desk and guest lounge"
                      className="h-full w-full object-cover"
                      aspectClassName="h-full w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center lg:col-span-6 lg:pl-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
                    Our Story &amp; Hospitality
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl lg:text-5xl">
                    Khorezm Warmth, Tailored to Modern Travel
                  </h2>

                  <p className="mt-6 text-base leading-relaxed text-[#17221B]/85 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:font-medium first-letter:leading-none first-letter:text-[#0F291E]">
                    Situated along A. Bakhodirhon Street in Urgench, Hotel Uzbegim was established to offer discerning travelers and visiting families a calm, refined residence in western Uzbekistan. Our architecture honors timeless stone arches and quiet interior courtyards while delivering effortless contemporary comfort.
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-[#526058]">
                    Whether arriving in Urgench for business, family gatherings, or cultural journeys across Khorezm, guests experience unhurried service from check-in to morning breakfast.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#0F291E]/12 pt-8 sm:grid-cols-2">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#0F291E]">
                        01. Central Urgench Address
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#526058]">
                        Positioned at A. Bakhodirhon 182/1 with complimentary on-site parking for seamless regional arrivals.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#0F291E]">
                        02. Attentive Personal Service
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#526058]">
                        Direct reservation review by hotel management, dedicated room service, and family-friendly suites.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ROOMS & SUITES */}
          <RoomsSection
            rooms={hotelData.rooms}
            onCheckAvailability={(roomId) => scrollToBooking(roomId)}
          />

          {/* 4. VERIFIED FACILITIES */}
          <section id="facilities" className="border-t border-[#0F291E]/10 bg-[#FAF7F0] py-20 lg:py-28">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
                    Verified Amenities
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl lg:text-5xl">
                    Essential Comforts for Every Guest
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#526058]">
                    Every stay at Hotel Uzbegim includes our verified core hotel facilities, maintained daily by our hospitality team.
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-[#0F291E]/12 pt-8 sm:grid-cols-2">
                    {hotelData.facilities.map((facility, idx) => {
                      const IconComponent = getFacilityIcon(facility.name);
                      return (
                        <div key={facility.id} className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#0F291E]/15 bg-white text-[#0F291E]">
                            <IconComponent className="h-5 w-5 text-[#9A7432]" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-medium text-[#0F291E]">
                              0{idx + 1}. {facility.name}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-[#526058]">
                              {facility.summary}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-[4/3] w-full overflow-hidden border border-[#0F291E]/12 bg-[#F1EBE0]">
                    <ResilientImage
                      src="/src/assets/images/hotel_dining_breakfast_1795013280260.jpg"
                      alt="Morning breakfast service at Hotel Uzbegim dining room"
                      className="h-full w-full object-cover"
                      aspectClassName="h-full w-full"
                    />
                  </div>
                  <p className="mt-3 font-serif text-sm italic text-[#526058]">
                    Fig. 1 — Morning breakfast table with seasonal Khorezm fruits, freshly brewed coffee, and tea service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. BOOKING SYSTEM */}
          <BookingSection
            rooms={hotelData.rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoomId={setSelectedRoomId}
            checkInPolicy={hotelData.settings.checkInPolicy}
          />

          {/* 6. PHOTO GALLERY */}
          <GallerySection items={hotelData.gallery} />

          {/* 7. GUEST REVIEWS */}
          <ReviewsSection reviews={hotelData.reviews} rooms={hotelData.rooms} />

          {/* 8. CONTACT US & INTERACTIVE GOOGLE MAPS */}
          <ContactSection settings={hotelData.settings} />
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#0F291E]/15 bg-[#0F291E] text-[#FAF7F0]">
          <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-10">
            <div className="grid grid-cols-1 gap-10 border-b border-white/12 pb-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <span className="font-serif text-3xl font-medium tracking-tight text-white">
                  Hotel Uzbegim
                </span>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#FAF7F0]/75">
                  {hotelData.settings.address}
                </p>
                <p className="mt-1 text-sm tabular-nums text-[#D4B26A]">
                  {hotelData.settings.telephone}
                </p>
              </div>

              <div className="md:col-span-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4B26A]">
                  Explore
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-[#FAF7F0]/80">
                  <li><a href="#about" className="hover:text-white">About Us</a></li>
                  <li><a href="#rooms" className="hover:text-white">Rooms &amp; Suites</a></li>
                  <li><a href="#facilities" className="hover:text-white">Facilities</a></li>
                  <li><a href="#gallery" className="hover:text-white">Gallery</a></li>
                  <li><a href="#reviews" className="hover:text-white">Guest Reviews</a></li>
                  <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                </ul>
              </div>

              <div className="md:col-span-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4B26A]">
                  Connect &amp; Management
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {hotelData.settings.socialLinks.instagram && (
                    <a
                      href={hotelData.settings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm border border-white/20 px-3.5 py-2 text-xs font-medium text-[#FAF7F0] hover:bg-white/10"
                    >
                      Instagram
                    </a>
                  )}
                  {hotelData.settings.socialLinks.facebook && (
                    <a
                      href={hotelData.settings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm border border-white/20 px-3.5 py-2 text-xs font-medium text-[#FAF7F0] hover:bg-white/10"
                    >
                      Facebook
                    </a>
                  )}
                  {hotelData.settings.socialLinks.telegram && (
                    <a
                      href={hotelData.settings.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm border border-white/20 px-3.5 py-2 text-xs font-medium text-[#FAF7F0] hover:bg-white/10"
                    >
                      Telegram
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleShareSite}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-sm border border-white/20 px-3.5 py-2 text-xs font-medium text-[#FAF7F0] hover:bg-white/10"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Share Hotel</span>
                  </button>
                </div>

                {shareToast && (
                  <p role="status" className="mt-2 text-xs text-[#D4B26A]">
                    {shareToast}
                  </p>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setStaffOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-[#D4B26A]/45 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#D4B26A] transition-colors hover:bg-[#D4B26A]/10"
                  >
                    <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Hotel Staff Management</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 text-xs text-[#FAF7F0]/60 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; {new Date().getFullYear()} Hotel Uzbegim, Urgench, Uzbekistan. All rights reserved.</p>
              <p>A. Bakhodirhon 182/1 · +998 62 226 11 01</p>
            </div>
          </div>
        </footer>

        <StaffPortalModal
          open={staffOpen}
          onClose={() => setStaffOpen(false)}
          onDataUpdated={loadHotelData}
        />
      </div>
    </MotionConfig>
  );
}
