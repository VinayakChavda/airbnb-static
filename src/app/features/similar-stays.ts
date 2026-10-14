import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';

const VISIBLE = 5;

/** Horizontal carousel: the arrows slide the whole row of cards to the left / right. */
@Component({
  selector: 'app-similar-stays',
  template: `
<section class="block full">
  <div class="more-head"><h3>More stays nearby</h3>
    <div class="pager"><span>{{ page() + 1 }} / {{ pages() }}</span>
      <button aria-label="Previous" [disabled]="page() === 0" (click)="page.set(page() - 1)">‹</button>
      <button aria-label="Next" [disabled]="page() >= pages() - 1" (click)="page.set(page() + 1)">›</button></div></div>
  <div class="sim-view">
    <div class="sim-track" [style.--k]="shift()">
      @for (s of store.similar(); track s.id) {
        <div class="sim-c"><img [src]="s.img" [alt]="s.title"><b>{{ s.title }}</b><span>{{ s.price }} · ★ {{ s.rating }}</span></div>
      }
    </div>
  </div>
</section>`,
})
export class SimilarStays {
  store = inject(Store);
  page = signal(0);
  pages = computed(() => Math.max(1, Math.ceil(this.store.similar().length / VISIBLE)));
  /** number of cards the row is shifted by; the last page is clamped so the final card ends flush right */
  shift = computed(() => Math.min(this.page() * VISIBLE, Math.max(0, this.store.similar().length - VISIBLE)));
}
