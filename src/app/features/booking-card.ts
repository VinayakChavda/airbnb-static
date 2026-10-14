import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { longD, mdY, rupee } from '../core/utils';
import { Tip } from '../shared/tip.directive';

@Component({
  selector: 'app-booking-card',
  imports: [Tip],
  template: `
<div class="side-sticky">
  <div class="promo">
    <img class="promo-ic" src="/assets/images/ui/discount.svg" alt="">
    <span class="promo-text">Get 10% off your next stay.<br><a href="#">Terms apply</a></span>
    <button class="btn-claim" [class.done]="store.claimed()" [disabled]="store.claimed()" (click)="store.claim()">{{ store.claimed() ? 'Claimed' : 'Claim' }}</button>
  </div>
  <div class="book" id="book">
    <div class="book-price"><u>{{ price() }}</u>&ngsp;<span>{{ unit() }}</span></div>
    <div class="book-box">
      <div class="bb-dates">
        <button class="bb-cell" (click)="ui.scrollTo('calendar')"><label>CHECK-IN</label><span>{{ store.start() ? fmt(store.start()!) : 'Add date' }}</span></button>
        <button class="bb-cell" (click)="ui.scrollTo('calendar')"><label>CHECKOUT</label><span>{{ store.end() ? fmt(store.end()!) : 'Add date' }}</span></button>
      </div>
      <div class="bb-guests">
        <button class="bb-cell wide" (click)="popOpen.set(!popOpen())"><label>GUESTS</label>
          <span>{{ store.guests() }} guest{{ store.guests() > 1 ? 's' : '' }}</span>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#222" stroke-width="1.5"><path d="m3 6 5 5 5-5"/></svg></button>
        @if (popOpen()) {
          <div class="guest-pop" animate.enter="enter-rise" animate.leave="leave-sink">
            <div class="gp-row"><div><b>Adults</b><br><span class="muted-s">Age 13+</span></div>
              <div class="stepper"><button [disabled]="store.guests() <= 1" (click)="store.setGuests(-1)">−</button><b>{{ store.guests() }}</b>
                <button [disabled]="store.guests() >= max()" (click)="store.setGuests(1)">+</button></div></div>
            <p class="muted-s">This place has a maximum of {{ max() }} guests.</p>
            <button class="link-close" (click)="popOpen.set(false)">Close</button>
          </div>
        }
      </div>
    </div>
    <div class="free-cancel">Free cancellation before <b>17 October</b></div>
    <button class="btn-reserve" tip="You won't be charged yet" (click)="store.reserve()">Reserve</button>
    <p class="no-charge">You won't be charged yet</p>
    @if (store.booking(); as b) {
      <div class="price-breakdown" animate.enter="enter-rise">
        <div><b>Reservation {{ b.id }}</b><span>{{ b.status }}</span></div>
        <div><span>{{ longD(b.start) }} → {{ longD(b.end) }}</span><span>{{ b.guests }} guests</span></div>
        <div><span>{{ rupee(b.nightly) }} x {{ b.nights }} nights</span><span>{{ rupee(b.subtotal) }}</span></div>
        <div><span>Airbnb service fee</span><span>{{ rupee(b.serviceFee) }}</span></div>
        <div class="tot"><span>Total (INR)</span><span>{{ rupee(b.total) }}</span></div>
      </div>
    }
  </div>
  <a href="#" class="report" (click)="report($event)">
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#555" stroke-width="1.4"><path d="M3 15V2M3 2h9l-2 3 2 3H3"/></svg> Report this listing</a>
</div>`,
})
export class BookingCard {
  store = inject(Store);
  ui = inject(UiService);
  popOpen = signal(false);
  max = computed(() => this.store.listing()?.maxGuests ?? 1);

  price = computed(() => rupee(this.store.quote()?.subtotal ?? this.store.listing()?.nightly ?? 0));
  unit = computed(() => (this.store.nights() ? `for ${this.store.nights()} night${this.store.nights() > 1 ? 's' : ''}` : 'night'));
  fmt = mdY; longD = longD; rupee = rupee;

  report(e: Event) { e.preventDefault(); this.ui.openModal({ kind: 'report' }); }

  @HostListener('document:mousedown', ['$event'])
  outside(e: MouseEvent) {
    if (this.popOpen() && !(e.target as HTMLElement).closest('.bb-guests')) this.popOpen.set(false);
  }
}
