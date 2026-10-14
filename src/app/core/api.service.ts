import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Availability, Booking, Listing, Quote, Review, Similar } from './models';
import { LISTING, REVIEWS, SIMILAR, SERVICE_FEE_RATE, TODAY } from './static-data';
import { addDays } from './utils';

/**
 * Static version of the API: same methods as the original HTTP service, but everything runs in the browser.
 * Listing data is bundled with the app; bookings, wishlist, coupon and messages are kept in localStorage.
 */
const KEY = 'listing-static-state';
interface State { bookings: Booking[]; bookedNights: string[]; saved: boolean; claimed: boolean; messages: unknown[]; reports: unknown[]; }

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const fail = (message: string) => throwError(() => new HttpErrorResponse({ status: 400, error: { error: message } }));

// host-blocked nights: 18-30 Nov 2026
const BLOCKED = new Set(Array.from({ length: 13 }, (_, i) => `2026-11-${String(18 + i).padStart(2, '0')}`));

@Injectable({ providedIn: 'root' })
export class ApiService {
  private state: State = this.load();

  private load(): State {
    const empty: State = { bookings: [], bookedNights: [], saved: false, claimed: false, messages: [], reports: [] };
    try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return empty; }
  }
  private save() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch { /* storage unavailable */ } }

  unavailableDates(): string[] { return [...BLOCKED, ...this.state.bookedNights].sort(); }

  private validate(start: string, end: string, guests: number): string | null {
    if (!ISO.test(start || '') || !ISO.test(end || '') || isNaN(Date.parse(start)) || isNaN(Date.parse(end))) return 'Valid start and end dates (YYYY-MM-DD) are required';
    if (start < TODAY) return "Check-in can't be in the past";
    if (end <= start) return 'Checkout must be after check-in';
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > LISTING.maxGuests) return `Guests must be between 1 and ${LISTING.maxGuests}`;
    const taken = new Set(this.unavailableDates());
    for (let d = start; d < end; d = addDays(d, 1)) if (taken.has(d)) return "Those dates aren't available";
    return null;
  }

  private price(start: string, end: string): Quote {
    const nights = nightsBetween(start, end);
    const subtotal = Math.round(LISTING.nightly * nights);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    return { nights, nightly: Math.round(LISTING.nightly), subtotal, serviceFee, total: subtotal + serviceFee } as Quote;
  }

  listing(): Observable<Listing> { return of(LISTING as Listing); }
  reviews(tag?: string): Observable<Review[]> { return of((tag ? REVIEWS.filter(r => r.tags.includes(tag)) : REVIEWS) as Review[]); }
  similar(): Observable<Similar[]> { return of(SIMILAR as Similar[]); }
  availability(): Observable<Availability> { return of({ today: TODAY, unavailable: this.unavailableDates() } as Availability); }

  quote(start: string, end: string, guests: number): Observable<Quote> {
    const err = this.validate(start, end, guests);
    return err ? fail(err) : of(this.price(start, end));
  }

  book(start: string, end: string, guests: number): Observable<Booking> {
    const err = this.validate(start, end, guests);
    if (err) return fail(err);
    const booking = {
      id: 'BK' + String(this.state.bookings.length + 1).padStart(4, '0'),
      start, end, guests: Number(guests), ...this.price(start, end), status: 'pending', createdAt: new Date().toISOString(),
    } as unknown as Booking;
    this.state.bookings.push(booking);
    for (let d = start; d < end; d = addDays(d, 1)) this.state.bookedNights.push(d);
    this.save();
    return of(booking);
  }

  wishlist() { return of({ saved: this.state.saved }); }
  setWishlist(saved: boolean) { this.state.saved = saved; this.save(); return of({ saved }); }
  coupon() { return of({ claimed: this.state.claimed }); }
  claimCoupon() { this.state.claimed = true; this.save(); return of({ claimed: true }); }

  sendMessage(text: string): Observable<unknown> {
    if (!text.trim()) return fail("Message can't be empty");
    this.state.messages.push({ text: text.trim(), createdAt: new Date().toISOString() });
    this.save();
    return of({ ok: true });
  }
  report(reason: string, details: string): Observable<unknown> {
    if (!reason.trim()) return fail('A reason is required');
    this.state.reports.push({ reason: reason.trim(), details, createdAt: new Date().toISOString() });
    this.save();
    return of({ ok: true });
  }
}
