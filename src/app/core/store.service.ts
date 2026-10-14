import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { UiService } from './ui.service';
import { addDays } from './utils';
import { Booking, Listing, Quote, Review, Similar } from './models';

const errMsg = (e: unknown, fallback: string) => (e instanceof HttpErrorResponse && e.error?.error) || fallback;

@Injectable({ providedIn: 'root' })
export class Store {
  private api = inject(ApiService);
  private ui = inject(UiService);

  listing = signal<Listing | null>(null);
  allReviews = signal<Review[]>([]);
  similar = signal<Similar[]>([]);
  unavailable = signal<ReadonlySet<string>>(new Set());
  today = signal('2026-10-13');
  loadError = signal(false);

  start = signal<string | null>('2026-10-18');
  end = signal<string | null>('2026-10-23');
  guests = signal(2);
  saved = signal(false);
  claimed = signal(false);
  quote = signal<Quote | null>(null);
  booking = signal<Booking | null>(null);

  nights = computed(() => this.quote()?.nights ?? 0);

  constructor() {
    toObservable(computed(() => ({ s: this.start(), e: this.end(), g: this.guests() })))
      .pipe(switchMap(({ s, e, g }) => (s && e ? this.api.quote(s, e, g).pipe(catchError(() => of(null))) : of(null))))
      .subscribe(q => this.quote.set(q));
  }

  load() {
    this.api.listing().subscribe({
      next: l => { this.listing.set(l); this.today.set(l.today); },
      error: () => this.loadError.set(true),
    });
    this.api.reviews().subscribe(r => this.allReviews.set(r));
    this.api.similar().subscribe(s => this.similar.set(s));
    this.api.wishlist().subscribe(w => this.saved.set(w.saved));
    this.api.coupon().subscribe(c => this.claimed.set(c.claimed));
    this.refreshAvailability();
  }

  refreshAvailability() {
    this.api.availability().subscribe(a => this.unavailable.set(new Set(a.unavailable)));
  }

  // ----- dates -----
  private rangeBlocked(a: string, b: string) {
    for (let d = a; d < b; d = addDays(d, 1)) if (this.unavailable().has(d)) return true;
    return false;
  }
  pickDate(d: string) {
    this.booking.set(null);
    const s = this.start(), e = this.end();
    if (!s || e || d <= s) { this.start.set(d); this.end.set(null); }
    else if (this.rangeBlocked(s, d)) { this.start.set(d); this.end.set(null); this.ui.showToast("Those dates aren't available"); }
    else this.end.set(d);
  }
  clearDates() { this.start.set(null); this.end.set(null); this.booking.set(null); }
  setGuests(delta: number) {
    const max = this.listing()?.maxGuests ?? 1;
    this.guests.update(g => Math.min(max, Math.max(1, g + delta)));
  }

  // ----- actions -----
  toggleSaved() {
    const next = !this.saved();
    this.saved.set(next); // optimistic
    this.api.setWishlist(next).subscribe({
      next: () => this.ui.showToast(next ? 'Saved to wishlist' : 'Removed from wishlist'),
      error: () => { this.saved.set(!next); this.ui.showToast("Couldn't update wishlist"); },
    });
  }
  claim() {
    this.api.claimCoupon().subscribe({ next: () => { this.claimed.set(true); this.ui.showToast('10% off coupon claimed'); } });
  }
  reserve() {
    const s = this.start(), e = this.end();
    if (!s || !e) { this.ui.showToast('Select your dates first'); this.ui.scrollTo('calendar'); return; }
    this.api.book(s, e, this.guests()).subscribe({
      next: b => {
        this.booking.set(b);
        this.start.set(null); this.end.set(null);
        this.refreshAvailability();
        this.ui.showToast("Reservation started — you won't be charged yet");
        this.ui.scrollTo('book', 'center');
      },
      error: err => this.ui.showToast(errMsg(err, "Couldn't create the reservation")),
    });
  }
  sendMessage(text: string) {
    this.api.sendMessage(text).subscribe({
      next: () => { this.ui.closeModal(); this.ui.showToast('Message sent to host'); },
      error: err => this.ui.showToast(errMsg(err, "Couldn't send message")),
    });
  }
  sendReport(reason: string, details: string) {
    this.api.report(reason, details).subscribe({
      next: () => { this.ui.closeModal(); this.ui.showToast('Thanks — your report was submitted'); },
      error: err => this.ui.showToast(errMsg(err, "Couldn't submit report")),
    });
  }
}
