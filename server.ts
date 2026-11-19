import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hotel-db.json');
const STAFF_ACCESS_CODE = process.env.STAFF_ACCESS_CODE || 'UZBEGIM2026';
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.createHash('sha256').update(`uzbegim-${STAFF_ACCESS_CODE}`).digest('hex');

interface RoomRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  capacityAdults: number;
  capacityChildren: number;
  bedConfiguration: string;
  facilities: string[];
  pricePerNight: number | null;
  currency: 'USD' | 'UZS';
  available: boolean;
}

interface FacilityRecord {
  id: string;
  name: string;
  summary: string;
  verified: boolean;
}

interface GalleryRecord {
  id: string;
  title: string;
  category: 'Exterior & Courtyard' | 'Rooms & Suites' | 'Reception' | 'Dining';
  imageUrl: string;
  caption: string;
}

interface BookingRecord {
  id: string;
  referenceCode: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  status: 'pending' | 'approved' | 'declined';
  managementNote: string;
  quotedTotal: number | null;
  quotedCurrency: 'USD' | 'UZS';
  createdAt: string;
  updatedAt: string;
}

interface ReviewRecord {
  id: string;
  guestName: string;
  originCity: string;
  roomStayed: string;
  stayDate: string;
  rating: number;
  comment: string;
  reservationRef?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'replied';
  createdAt: string;
}

interface SettingsRecord {
  hotelName: string;
  address: string;
  telephone: string;
  email: string;
  whatsappApproved: boolean;
  whatsappNumber: string;
  checkInPolicy: string;
  cancellationPolicy: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    telegram: string;
  };
}

interface HotelDatabase {
  rooms: RoomRecord[];
  facilities: FacilityRecord[];
  gallery: GalleryRecord[];
  bookings: BookingRecord[];
  reviews: ReviewRecord[];
  inquiries: ContactRecord[];
  settings: SettingsRecord;
}

function createInitialDatabase(): HotelDatabase {
  return {
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
    bookings: [],
    reviews: [],
    inquiries: [],
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
}

function loadDatabase(): HotelDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as HotelDatabase;
  } catch {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDatabase(db: HotelDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

function signStaffToken(): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = String(expiresAt);
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyStaffToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

function requireStaffAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
  if (!verifyStaffToken(token)) {
    res.status(401).json({ error: 'Staff authorization required.' });
    return;
  }
  next();
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIsoDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = Date.parse(dateStr);
  return !Number.isNaN(parsed);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Public bootstrap data
  app.get('/api/public', (_req, res) => {
    const db = loadDatabase();
    res.json({
      rooms: db.rooms,
      facilities: db.facilities.filter((f) => f.verified),
      gallery: db.gallery,
      reviews: db.reviews.filter((r) => r.status === 'approved'),
      settings: db.settings,
    });
  });

  // Check room availability for selected dates
  app.get('/api/availability', (req, res) => {
    const checkIn = sanitizeText(req.query.checkIn, 20);
    const checkOut = sanitizeText(req.query.checkOut, 20);
    const adults = Math.max(1, Number(req.query.adults || 1));
    const children = Math.max(0, Number(req.query.children || 0));

    if (!isValidIsoDate(checkIn) || !isValidIsoDate(checkOut) || checkOut <= checkIn) {
      res.status(400).json({ error: 'Please select valid check-in and check-out dates.' });
      return;
    }

    const db = loadDatabase();
    const rooms = db.rooms.map((room) => {
      const fitsCapacity = adults <= room.capacityAdults && adults + children <= room.capacityAdults + room.capacityChildren;
      const conflictingApproved = db.bookings.some(
        (b) =>
          b.roomId === room.id &&
          b.status === 'approved' &&
          !(checkOut <= b.checkIn || checkIn >= b.checkOut)
      );
      return {
        roomId: room.id,
        available: room.available && fitsCapacity && !conflictingApproved,
        reason: !room.available
          ? 'Temporarily unavailable by management'
          : !fitsCapacity
            ? `Max capacity: ${room.capacityAdults} adults, ${room.capacityChildren} children`
            : conflictingApproved
              ? 'Reserved for selected dates'
              : 'Available for reservation request',
      };
    });

    res.json({ checkIn, checkOut, rooms });
  });

  // Submit booking request
  app.post('/api/bookings', (req, res) => {
    const roomId = sanitizeText(req.body?.roomId, 64);
    const checkIn = sanitizeText(req.body?.checkIn, 20);
    const checkOut = sanitizeText(req.body?.checkOut, 20);
    const adults = Number(req.body?.adults || 0);
    const children = Number(req.body?.children || 0);
    const guestName = sanitizeText(req.body?.guestName, 120);
    const guestEmail = sanitizeText(req.body?.guestEmail, 160);
    const guestPhone = sanitizeText(req.body?.guestPhone, 40);
    const specialRequests = sanitizeText(req.body?.specialRequests, 600);

    if (!roomId || !isValidIsoDate(checkIn) || !isValidIsoDate(checkOut) || checkOut <= checkIn) {
      res.status(400).json({ error: 'Valid room, check-in, and check-out dates are required.' });
      return;
    }
    if (!guestName || guestName.length < 2) {
      res.status(400).json({ error: 'Please provide your full name.' });
      return;
    }
    if (!isValidEmail(guestEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!guestPhone || guestPhone.length < 6) {
      res.status(400).json({ error: 'Please provide a valid telephone number.' });
      return;
    }

    const db = loadDatabase();
    const room = db.rooms.find((r) => r.id === roomId);
    if (!room || !room.available) {
      res.status(404).json({ error: 'Selected room is currently unavailable.' });
      return;
    }

    if (adults < 1 || adults > room.capacityAdults || adults + children > room.capacityAdults + room.capacityChildren) {
      res.status(400).json({
        error: `${room.name} accommodates up to ${room.capacityAdults} adults and ${room.capacityChildren} children.`,
      });
      return;
    }

    const nights = Math.max(
      1,
      Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / (1000 * 60 * 60 * 24))
    );
    const quotedTotal = room.pricePerNight !== null ? room.pricePerNight * nights : null;
    const refRandom = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referenceCode = `UZB-${new Date().getFullYear()}-${refRandom}`;
    const now = new Date().toISOString();

    const booking: BookingRecord = {
      id: `bk-${crypto.randomUUID()}`,
      referenceCode,
      roomId: room.id,
      roomName: room.name,
      checkIn,
      checkOut,
      adults,
      children,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      status: 'pending',
      managementNote: '',
      quotedTotal,
      quotedCurrency: room.currency,
      createdAt: now,
      updatedAt: now,
    };

    db.bookings.unshift(booking);
    saveDatabase(db);

    res.status(201).json({
      referenceCode: booking.referenceCode,
      status: booking.status,
      roomName: booking.roomName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      adults: booking.adults,
      children: booking.children,
      quotedTotal: booking.quotedTotal,
      quotedCurrency: booking.quotedCurrency,
      createdAt: booking.createdAt,
    });
  });

  // Lookup booking status by reference code & email
  app.get('/api/bookings/lookup', (req, res) => {
    const ref = sanitizeText(req.query.ref, 40).toUpperCase();
    const email = sanitizeText(req.query.email, 160).toLowerCase();

    if (!ref || !email) {
      res.status(400).json({ error: 'Both reservation reference code and email are required.' });
      return;
    }

    const db = loadDatabase();
    const booking = db.bookings.find(
      (b) => b.referenceCode.toUpperCase() === ref && b.guestEmail.toLowerCase() === email
    );

    if (!booking) {
      res.status(404).json({ error: 'No reservation request found matching that reference code and email.' });
      return;
    }

    res.json({
      referenceCode: booking.referenceCode,
      status: booking.status,
      roomName: booking.roomName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      guestName: booking.guestName,
      managementNote: booking.managementNote,
      quotedTotal: booking.quotedTotal,
      quotedCurrency: booking.quotedCurrency,
      updatedAt: booking.updatedAt,
    });
  });

  // Submit genuine guest review
  app.post('/api/reviews', (req, res) => {
    const guestName = sanitizeText(req.body?.guestName, 100);
    const originCity = sanitizeText(req.body?.originCity, 80);
    const roomStayed = sanitizeText(req.body?.roomStayed, 80);
    const stayDate = sanitizeText(req.body?.stayDate, 40);
    const reservationRef = sanitizeText(req.body?.reservationRef, 40);
    const comment = sanitizeText(req.body?.comment, 1000);
    const rating = Number(req.body?.rating || 0);

    if (!guestName || guestName.length < 2) {
      res.status(400).json({ error: 'Please enter your name.' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Please choose a rating between 1 and 5.' });
      return;
    }
    if (!comment || comment.length < 10) {
      res.status(400).json({ error: 'Please share at least 10 characters about your stay.' });
      return;
    }

    const db = loadDatabase();
    const review: ReviewRecord = {
      id: `rev-${crypto.randomUUID()}`,
      guestName,
      originCity: originCity || 'Verified Guest',
      roomStayed: roomStayed || 'Hotel Uzbegim',
      stayDate: stayDate || new Date().toISOString().slice(0, 7),
      rating,
      comment,
      reservationRef: reservationRef || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(review);
    saveDatabase(db);

    res.status(201).json({
      id: review.id,
      status: review.status,
      message: 'Thank you. Your review has been submitted for hotel verification before publication.',
    });
  });

  // Submit contact inquiry
  app.post('/api/contact', (req, res) => {
    const name = sanitizeText(req.body?.name, 100);
    const email = sanitizeText(req.body?.email, 160);
    const phone = sanitizeText(req.body?.phone, 40);
    const subject = sanitizeText(req.body?.subject, 120);
    const message = sanitizeText(req.body?.message, 1500);

    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Please provide your name.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!message || message.length < 8) {
      res.status(400).json({ error: 'Please enter your inquiry message.' });
      return;
    }

    const db = loadDatabase();
    const inquiry: ContactRecord = {
      id: `inq-${crypto.randomUUID()}`,
      name,
      email,
      phone,
      subject: subject || 'General Hotel Inquiry',
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    db.inquiries.unshift(inquiry);
    saveDatabase(db);

    res.status(201).json({
      id: inquiry.id,
      message: 'Your message has been delivered to Hotel Uzbegim reception.',
    });
  });

  // Staff login
  app.post('/api/staff/login', (req, res) => {
    const passcode = sanitizeText(req.body?.passcode, 100);
    const providedBuf = Buffer.from(passcode);
    const expectedBuf = Buffer.from(STAFF_ACCESS_CODE);

    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      res.status(401).json({ error: 'Invalid hotel staff access code.' });
      return;
    }

    const token = signStaffToken();
    res.json({ token });
  });

  // Staff dashboard data
  app.get('/api/staff/dashboard', requireStaffAuth, (_req, res) => {
    const db = loadDatabase();
    res.json(db);
  });

  // Staff update booking status (Approve / Decline)
  app.patch('/api/staff/bookings/:id', requireStaffAuth, (req, res) => {
    const bookingId = sanitizeText(req.params.id, 80);
    const status = req.body?.status;
    const managementNote = sanitizeText(req.body?.managementNote, 400);
    const quotedTotalRaw = req.body?.quotedTotal;
    const quotedCurrency = req.body?.quotedCurrency === 'UZS' ? 'UZS' : 'USD';

    if (status !== 'approved' && status !== 'declined' && status !== 'pending') {
      res.status(400).json({ error: 'Invalid booking status.' });
      return;
    }

    const db = loadDatabase();
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      res.status(404).json({ error: 'Reservation request not found.' });
      return;
    }

    booking.status = status;
    booking.managementNote = managementNote;
    if (quotedTotalRaw === null || quotedTotalRaw === '') {
      booking.quotedTotal = null;
    } else if (typeof quotedTotalRaw === 'number' && quotedTotalRaw >= 0) {
      booking.quotedTotal = quotedTotalRaw;
    }
    booking.quotedCurrency = quotedCurrency;
    booking.updatedAt = new Date().toISOString();

    saveDatabase(db);
    res.json(booking);
  });

  // Staff update room pricing & details
  app.patch('/api/staff/rooms/:id', requireStaffAuth, (req, res) => {
    const roomId = sanitizeText(req.params.id, 80);
    const db = loadDatabase();
    const room = db.rooms.find((r) => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    if (typeof req.body?.description === 'string') {
      room.description = sanitizeText(req.body.description, 500) || room.description;
    }
    if (typeof req.body?.bedConfiguration === 'string') {
      room.bedConfiguration = sanitizeText(req.body.bedConfiguration, 100) || room.bedConfiguration;
    }
    if (typeof req.body?.capacityAdults === 'number' && req.body.capacityAdults >= 1 && req.body.capacityAdults <= 10) {
      room.capacityAdults = req.body.capacityAdults;
    }
    if (typeof req.body?.capacityChildren === 'number' && req.body.capacityChildren >= 0 && req.body.capacityChildren <= 10) {
      room.capacityChildren = req.body.capacityChildren;
    }
    if (req.body?.pricePerNight === null || req.body?.pricePerNight === '') {
      room.pricePerNight = null;
    } else if (typeof req.body?.pricePerNight === 'number' && req.body.pricePerNight >= 0) {
      room.pricePerNight = req.body.pricePerNight;
    }
    if (req.body?.currency === 'USD' || req.body?.currency === 'UZS') {
      room.currency = req.body.currency;
    }
    if (typeof req.body?.available === 'boolean') {
      room.available = req.body.available;
    }

    saveDatabase(db);
    res.json(room);
  });

  // Staff moderate guest review
  app.patch('/api/staff/reviews/:id', requireStaffAuth, (req, res) => {
    const reviewId = sanitizeText(req.params.id, 80);
    const status = req.body?.status;
    if (status !== 'approved' && status !== 'declined' && status !== 'pending') {
      res.status(400).json({ error: 'Invalid review status.' });
      return;
    }
    const db = loadDatabase();
    const review = db.reviews.find((r) => r.id === reviewId);
    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    review.status = status;
    saveDatabase(db);
    res.json(review);
  });

  // Staff mark inquiry replied
  app.patch('/api/staff/inquiries/:id', requireStaffAuth, (req, res) => {
    const inquiryId = sanitizeText(req.params.id, 80);
    const status = req.body?.status;
    if (status !== 'new' && status !== 'replied') {
      res.status(400).json({ error: 'Invalid inquiry status.' });
      return;
    }
    const db = loadDatabase();
    const inquiry = db.inquiries.find((i) => i.id === inquiryId);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    inquiry.status = status;
    saveDatabase(db);
    res.json(inquiry);
  });

  // Staff update hotel settings (WhatsApp approval, policies, social links)
  app.patch('/api/staff/settings', requireStaffAuth, (req, res) => {
    const db = loadDatabase();
    if (typeof req.body?.whatsappApproved === 'boolean') {
      db.settings.whatsappApproved = req.body.whatsappApproved;
    }
    if (typeof req.body?.whatsappNumber === 'string') {
      db.settings.whatsappNumber = sanitizeText(req.body.whatsappNumber, 30);
    }
    if (typeof req.body?.email === 'string') {
      const cleaned = sanitizeText(req.body.email, 160);
      if (isValidEmail(cleaned)) {
        db.settings.email = cleaned;
      }
    }
    if (typeof req.body?.checkInPolicy === 'string') {
      db.settings.checkInPolicy = sanitizeText(req.body.checkInPolicy, 400);
    }
    if (typeof req.body?.cancellationPolicy === 'string') {
      db.settings.cancellationPolicy = sanitizeText(req.body.cancellationPolicy, 400);
    }
    if (req.body?.socialLinks && typeof req.body.socialLinks === 'object') {
      db.settings.socialLinks = {
        instagram: sanitizeText(req.body.socialLinks.instagram, 200),
        facebook: sanitizeText(req.body.socialLinks.facebook, 200),
        telegram: sanitizeText(req.body.socialLinks.telegram, 200),
      };
    }

    saveDatabase(db);
    res.json(db.settings);
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Uzbegim server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
