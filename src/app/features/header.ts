import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { rupee } from '../core/utils';
import { Tip } from '../shared/tip.directive';

@Component({
  selector: 'app-header',
  imports: [Tip],
  template: `
<header class="header"><div class="wrap header-in">
  <a class="logo" href="#" aria-label="Airbnb home">
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#ff385c" stroke-width="2.2"><path d="M16 1c2 0 3.5 1.2 4.5 3.2l8 16.3c1.6 3.5-.6 7.5-4.6 7.5-2.2 0-4.2-1.2-5.6-3.2-.8-1.1-1.5-1.6-2.3-1.6s-1.5.5-2.3 1.6C10.3 26.8 8.3 28 6.1 28c-4 0-6.2-4-4.6-7.5l8-16.3C10.5 2.2 14 1 16 1z" transform="translate(0 1)"/><circle cx="16" cy="19" r="3.6"/></svg>
    <span>airbnb</span>
  </a>
  <div class="searchbar">
    <img src="/assets/images/ui/searchbar-house.png" alt="" class="sb-house">
    <button>Anywhere</button><i></i><button>Anytime</button><i></i><button class="muted">Add guests</button>
    <span class="sb-go"><svg viewBox="0 0 32 32" width="12" height="12" fill="none" stroke="#fff" stroke-width="5"><circle cx="13" cy="13" r="9"/><path d="m20 20 9 9"/></svg></span>
  </div>
  <div class="header-right">
    <a href="#" class="host-link">Become a host</a>
    <button class="icon-btn" tip="Language and currency"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c-2.5 2.5-2.5 10.5 0 13M8 1.5c2.5 2.5 2.5 10.5 0 13"/></svg></button>
    <button class="icon-btn" tip="Menu"><svg viewBox="0 0 16 16" width="16" height="16" stroke="#222" stroke-width="1.6"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
  </div>
</div></header>

<div class="subnav" [class.show]="show()">
  <div class="wrap subnav-in">
    <nav>
      @for (s of secs; track s.id) {
        <a [href]="'#' + s.id" [class.active]="show() && current() === s.id" (click)="go($event, s.id)">{{ s.label }}</a>
      }
    </nav>
    <div class="subnav-price">
      <div><b>{{ price() }}</b>&ngsp;<span>{{ unit() }}</span>
        <div class="sn-rate">★ {{ store.listing()?.rating }} · {{ store.listing()?.reviewCount }} reviews</div></div>
      <button class="btn-reserve sm" (click)="store.reserve()">Reserve</button>
    </div>
  </div>
</div>`,
})
export class Header {
  store = inject(Store);
  private ui = inject(UiService);

  secs = [{ id: 'photos', label: 'Photos' }, { id: 'amenities', label: 'Amenities' }, { id: 'reviews', label: 'Reviews' }, { id: 'location', label: 'Location' }];
  show = signal(false);
  current = signal('photos');

  price = computed(() => rupee(this.store.quote()?.subtotal ?? this.store.listing()?.nightly ?? 0));
  unit = computed(() => (this.store.nights() ? `for ${this.store.nights()} night${this.store.nights() > 1 ? 's' : ''}` : 'night'));

  go(e: Event, id: string) { e.preventDefault(); this.ui.scrollTo(id); }

  @HostListener('window:scroll')
  onScroll() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    this.show.set(gallery.getBoundingClientRect().bottom < 0);
    let cur = 'photos';
    for (const s of this.secs) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= 120) cur = s.id;
    }
    this.current.set(cur);
  }
}
