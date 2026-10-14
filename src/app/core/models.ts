export interface TourSection { id: string; name: string; desc: string; photos: string[]; }
export interface Highlight { icon: string; title: string; text: string; }
export interface Sleeping { name: string; beds: string; img: string; }
export interface Amenity { key: string; name: string; unavailable?: boolean; }
export interface AmenityGroup { title: string; items: Amenity[]; }
export interface Category { name: string; score: string; icon: string; }
export interface Chip { name: string; count: number; color: string; icon: string; }
export interface CoHost { name: string; avatar: string | null; tint?: [string, string]; }

export interface Listing {
  title: string; subtitle: string; facts: string; nightly: number; rating: number; reviewCount: number;
  maxGuests: number; today: string; hero: string[]; tour: TourSection[]; highlights: Highlight[];
  description: { short: string; full: string; original: string };
  sleeping: Sleeping[]; amenities: Amenity[]; amenityGroups: AmenityGroup[]; amenityTotal: number;
  ratingBars: Record<string, number>; categories: Category[]; chips: Chip[];
  neighbourhood: { short: string; full: string };
  host: { name: string; avatar: string; reviews: string; rating: string; years: number; facts: string[]; response: string[]; coHosts: CoHost[] };
  thingsToKnow: { cancel: string[]; rules: string[]; safety: string[] };
}

export interface Review { name: string; meta: string; avatar: string | null; tint?: [string, string]; when: string; tags: string[]; text: string; long?: boolean; }
export interface Similar { id: number; title: string; price: string; rating: string; img: string; }
export interface Availability { today: string; unavailable: string[]; }
export interface Quote { nights: number; nightly: number; subtotal: number; serviceFee: number; total: number; }
export interface Booking extends Quote { id: string; start: string; end: string; guests: number; status: string; }

export type Modal =
  | { kind: 'amenities' } | { kind: 'reviews' } | { kind: 'report' } | { kind: 'message' }
  | { kind: 'info'; title: string; lines: string[] };
