export interface Room {
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

export interface Facility {
  id: string;
  name: string;
  summary: string;
  verified: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Exterior & Courtyard' | 'Rooms & Suites' | 'Reception' | 'Dining';
  imageUrl: string;
  caption: string;
}

export type BookingStatus = 'pending' | 'approved' | 'declined';

export interface BookingRequest {
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
  status: BookingStatus;
  managementNote: string;
  quotedTotal: number | null;
  quotedCurrency: 'USD' | 'UZS';
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'declined';

export interface GuestReview {
  id: string;
  guestName: string;
  originCity: string;
  roomStayed: string;
  stayDate: string;
  rating: number;
  comment: string;
  reservationRef?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'replied';
  createdAt: string;
}

export interface HotelSettings {
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

export interface PublicHotelPayload {
  rooms: Room[];
  facilities: Facility[];
  gallery: GalleryItem[];
  reviews: GuestReview[];
  settings: HotelSettings;
}
