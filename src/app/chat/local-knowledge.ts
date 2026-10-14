// Browser-only replacement for the Qdrant + embeddings + Gemini pipeline.
// The page is split into text chunks (same as backend/src/chat/knowledge.js) and questions are matched
// with a TF-IDF keyword search. No server, no API key.
import { LISTING, REVIEWS, SIMILAR, SERVICE_FEE_RATE, TODAY } from '../core/static-data';

export interface Chunk { id: string; title: string; text: string; }
export interface Hit extends Chunk { score: number; }

const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const list = (a: string[]) => a.join(', ');

function buildChunks(): Chunk[] {
  const l = LISTING, c: Chunk[] = [];
  const add = (id: string, title: string, text: string) => c.push({ id, title, text: text.replace(/\s+/g, ' ').trim() });
  const fee = Math.round(SERVICE_FEE_RATE * 100);
  const five = l.nightly * 5, fee5 = Math.round(five * SERVICE_FEE_RATE);

  add('overview', 'Overview',
    `Listing: "${l.title}". ${l.subtitle}. Location: Candolim, Goa, India. ${l.facts.replace(/ · /g, ', ')}. ` +
    `Guest rating ${l.rating} out of 5 from ${l.reviewCount} reviews, and it is a Guest favourite (one of the most loved homes on Airbnb according to guests). Hosted by ${l.host.name}.`);
  add('pricing', 'Price and fees',
    `The price is about ${rupee(l.nightly)} per night. For the sample 5-night stay (18 to 23 October 2026) the stay price is ${rupee(five)}. ` +
    `Airbnb adds a service fee of ${fee}%, so the 5-night total with fee is about ${rupee(five + fee5)}. ` +
    `Total for any stay = nights x ${rupee(l.nightly)} plus a ${fee}% service fee. Maximum ${l.maxGuests} guests. ` +
    `There is an offer: get 10% off your next stay (use the Claim button; terms apply). You are not charged when you press Reserve.`);
  add('cancellation', 'Cancellation, check-in and checkout',
    `Cancellation policy: ${l.thingsToKnow.cancel.join(' ')} Check-in is ${l.thingsToKnow.rules[0].replace('Check-in ', '')} and checkout is ${l.thingsToKnow.rules[1].replace('Checkout ', '')}. ` +
    `Self check-in: you can check in with the building staff. Free cancellation before 17 October.`);
  add('description', 'Description', l.description.full);
  add('sleeping', 'Where you\'ll sleep',
    l.sleeping.map((s: any) => `${s.name}: ${s.beds}.`).join(' ') + ` Total: 1 bedroom, 1 bed, 1 bathroom, up to ${l.maxGuests} guests.`);
  add('highlights', 'Highlights', l.highlights.map((h: any) => `${h.title}: ${h.text}`).join(' '));

  for (const g of l.amenityGroups) {
    const ok = g.items.filter((i: any) => !i.unavailable).map((i: any) => i.name);
    const no = g.items.filter((i: any) => i.unavailable).map((i: any) => i.name);
    add(`amenities-${g.title}`, `Amenities: ${g.title}`,
      `Amenities in the "${g.title}" category: ${list(ok)}.` + (no.length ? ` Not available / not reported: ${list(no)}.` : ''));
  }
  add('amenities-summary', 'Amenities: overview',
    `The listing advertises ${l.amenityTotal} amenities. Popular ones: ${list(l.amenities.filter((a: any) => !a.unavailable).map((a: any) => a.name))}. ` +
    `Carbon monoxide alarm and smoke alarm are shown as NOT available. The home has a private jacuzzi (hot tub), pool, gym, free parking, wifi, dedicated workspace and pets are allowed.`);

  add('house-rules', 'House rules', `House rules: ${list(l.thingsToKnow.rules)}. Pets allowed.`);
  add('safety', 'Safety and property', `Safety and property: ${list(l.thingsToKnow.safety)}.`);
  add('host', 'Host',
    `Host: ${l.host.name}. ${l.host.reviews} reviews, host rating ${l.host.rating} out of 5, ${l.host.years} years hosting. ` +
    `${list(l.host.response)}. ${list(l.host.facts)}. Guests can contact the host with the "Message host" button.`);
  add('cohosts', 'Co-hosts', `Co-hosts: ${list(l.host.coHosts.map((h: any) => h.name))}.`);
  add('ratings', 'Ratings breakdown',
    `Overall rating ${l.rating} from ${l.reviewCount} reviews. Category scores: ${list(l.categories.map((x: any) => `${x.name} ${x.score}`))}. ` +
    `Review topics guests mention: ${list(l.chips.map((x: any) => `${x.name} (${x.count})`))}.`);

  for (const r of REVIEWS.slice(0, 6)) {
    add(`review-${r.name}`, `Review by ${r.name}`,
      `Guest review by ${r.name} (${r.meta}, ${r.when}), 5 stars${r.tags.length ? `, mentions: ${list(r.tags)}` : ''}: "${r.text}"`);
  }

  add('location', 'Location and neighbourhood',
    `Location: Candolim, Goa, India (Amor de Goa building). ${l.neighbourhood.full} The exact address is provided after booking.`);
  for (const t of l.tour) add(`room-${t.id}`, `Photo tour: ${t.name}`, `${t.name}${t.desc ? `: ${t.desc}` : ''}.`);
  for (const s of SIMILAR) add(`nearby-${s.id}`, `Nearby stay: ${s.title}`, `Another stay nearby: "${s.title}" at ${s.price} (for the sample stay), rated ${s.rating}.`);

  add('how-to', 'How to use this page',
    `Pick check-in and checkout dates in the calendar (or in the booking card), choose guests (max ${l.maxGuests}) and press Reserve; you are not charged yet. ` +
    `Press Save (heart) to add it to your wishlist. "Show all photos" opens the photo tour with every room. "Message host" contacts the host. "Report this listing" reports a problem.`);
  return c;
}

/** Live availability summary (changes whenever someone books). */
export function describeAvailability(unavailable: Iterable<string>): string {
  const days = [...unavailable].filter(d => d >= TODAY).sort();
  const ranges: { start: string; end: string }[] = [];
  for (const d of days) {
    const last = ranges[ranges.length - 1];
    const next = last && new Date(Date.parse(last.end + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10);
    if (last && next === d) last.end = d; else ranges.push({ start: d, end: d });
  }
  const fmt = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return ranges.length
    ? `Dates that are NOT available (booked or blocked by the host): ${ranges.map(r => (r.start === r.end ? fmt(r.start) : `${fmt(r.start)} to ${fmt(r.end)}`)).join('; ')}. All other dates from ${fmt(TODAY)} onward are open.`
    : `Every date from ${fmt(TODAY)} onward is currently available.`;
}

// ---- search ----
const STOP = new Set('a an and are as at be but by can do does for from has have how i in is it its me my of on or our so that the their there this to us was we what when where which who will with you your if any about tell'.split(' '));
// a few everyday words mapped to the words used in the listing text
const SYNONYMS: Record<string, string[]> = {
  dog: ['pet'], dogs: ['pet'], cat: ['pet'], puppy: ['pet'], pets: ['pet'],
  jacuzzi: ['hot', 'tub'], bathtub: ['tub'], swim: ['pool'], swimming: ['pool'],
  cost: ['price'], costs: ['price'], cheap: ['price'], expensive: ['price'], pay: ['price', 'fee'], fees: ['fee'],
  car: ['parking'], park: ['parking'], wifi: ['internet'], internet: ['wifi'],
  refund: ['cancellation'], cancel: ['cancellation'], arrival: ['check-in'], arrive: ['check-in'], leave: ['checkout'],
  beach: ['location', 'neighbourhood'], beaches: ['location', 'neighbourhood'], near: ['location', 'neighbourhood'], area: ['location'], address: ['location'],
  clean: ['cleanliness'], dirty: ['cleanliness'], reviews: ['review'], rated: ['rating'], stars: ['rating'],
  hosts: ['host'], owner: ['host'], contact: ['host', 'message'],
  smoking: ['rules'], party: ['rules'], parties: ['rules'], noise: ['rules'], rule: ['rules'],
  bed: ['sleeping', 'bedroom'], beds: ['sleeping', 'bedroom'], sleep: ['sleeping'], sleeps: ['sleeping', 'guests'], people: ['guests'], capacity: ['guests'],
  kitchen: ['cooking'], cook: ['cooking', 'kitchen'], ac: ['air', 'conditioning'], aircon: ['air', 'conditioning'],
  safe: ['safety'], safety: ['smoke', 'alarm'], fire: ['smoke', 'alarm'],
  photos: ['photo', 'tour'], pictures: ['photo', 'tour'], rooms: ['room', 'photo'],
};
const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w);
const tokens = (s: string) => (s.toLowerCase().match(/[a-z0-9₹-]+/g) ?? []).filter(w => !STOP.has(w));
const expand = (s: string) => tokens(s).flatMap(w => [w, ...(SYNONYMS[w] ?? [])]).map(stem);

const CHUNKS = buildChunks();
const DOCS = CHUNKS.map(ch => ({ ch, title: new Set(expand(ch.title)), tf: count(expand(ch.text)), len: 0 }));
DOCS.forEach(d => (d.len = [...d.tf.values()].reduce((a, b) => a + b, 0)));
const AVG = DOCS.reduce((a, d) => a + d.len, 0) / DOCS.length;
const DF = new Map<string, number>();
DOCS.forEach(d => new Set([...d.tf.keys(), ...d.title]).forEach(t => DF.set(t, (DF.get(t) ?? 0) + 1)));

function count(ws: string[]) { const m = new Map<string, number>(); ws.forEach(w => m.set(w, (m.get(w) ?? 0) + 1)); return m; }

/** BM25-style keyword search with a boost for words that appear in the chunk title. */
export function search(query: string, k = 6): Hit[] {
  const q = [...new Set(expand(query))];
  if (!q.length) return [];
  const hits = DOCS.map(d => {
    let score = 0;
    for (const t of q) {
      const f = d.tf.get(t) ?? 0;
      const idf = Math.log(1 + (DOCS.length - (DF.get(t) ?? 0) + 0.5) / ((DF.get(t) ?? 0) + 0.5));
      if (f) score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.len / AVG))));
      if (d.title.has(t)) score += idf * 1.5;
    }
    return { ...d.ch, score };
  }).filter(h => h.score > 0);
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, k);
}
