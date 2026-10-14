import { Component, HostListener, computed, inject } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';

/** Full-screen white photo viewer opened from the photo tour. */
@Component({
  selector: 'app-lightbox',
  template: `
@if (current(); as c) {
  <div class="lbx" animate.enter="enter-fade" animate.leave="leave-fade">
    <div class="lbx-bar">
      <button class="lbx-icon" aria-label="Back to photo tour" (click)="ui.lightbox.set(null)">
        <svg viewBox="0 0 16 16" width="18" height="18" fill="#222"><circle cx="3" cy="3" r="1.3"/><circle cx="8" cy="3" r="1.3"/><circle cx="13" cy="3" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/><circle cx="3" cy="13" r="1.3"/><circle cx="8" cy="13" r="1.3"/><circle cx="13" cy="13" r="1.3"/></svg>
      </button>
      <b class="lbx-count">{{ c.index + 1 }} of {{ total() }}</b>
      <button class="lbx-icon" aria-label="Close" (click)="ui.closeTour()">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3 3 13"/></svg>
      </button>
    </div>
    <div class="lbx-stage">
      <button class="lbx-nav l" aria-label="Previous photo" (click)="step(-1)"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 4 8l6 6"/></svg></button>
      @for (p of [c]; track p.index) {
        <figure animate.enter="enter-photo">
          <h3>{{ p.section }}</h3>
          <img [src]="p.src" [alt]="p.section">
        </figure>
      }
      <button class="lbx-nav r" aria-label="Next photo" (click)="step(1)"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 2 6 6-6 6"/></svg></button>
    </div>
  </div>
}`,
})
export class Lightbox {
  private store = inject(Store);
  ui = inject(UiService);

  private flat = computed(() => (this.store.listing()?.tour ?? []).flatMap(s => s.photos.map(src => ({ src, section: s.name }))));
  total = computed(() => this.flat().length);
  current = computed(() => {
    const i = this.ui.lightbox();
    const p = i === null ? undefined : this.flat()[i];
    return p && { ...p, index: i! };
  });

  step(d: number) {
    const n = this.total(), i = this.ui.lightbox();
    if (i !== null && n) this.ui.lightbox.set((i + d + n) % n);
  }

  @HostListener('document:keydown', ['$event'])
  key(e: KeyboardEvent) {
    if (this.ui.lightbox() === null) return;
    if (e.key === 'ArrowLeft') this.step(-1);
    else if (e.key === 'ArrowRight') this.step(1);
  }
}
