import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Tip } from '../shared/tip.directive';

interface Pic { src: string; big: boolean; }

/** pattern: big, small, small, big, small, small … ; a lone trailing small becomes big */
function layout(list: string[]): Pic[] {
  const out: Pic[] = [];
  let i = 0;
  while (i < list.length) {
    out.push({ src: list[i++], big: true });
    const rest = list.length - i;
    if (rest >= 2) { out.push({ src: list[i++], big: false }, { src: list[i++], big: false }); }
    else if (rest === 1) out.push({ src: list[i++], big: true });
  }
  return out;
}

@Component({
  selector: 'app-photo-tour',
  imports: [Tip],
  template: `
@if (ui.tourOpen() && store.listing(); as l) {
  <div class="tour" [class.closing]="ui.tourClosing()">
    <div class="tour-bar">
      <button class="tb-btn" aria-label="Back" (click)="ui.closeTour()"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.8"><path d="M10 2 4 8l6 6"/></svg></button>
      <b>Photo tour</b>
      <div class="tb-right">
        <button class="tb-btn" tip="Share options"><svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="#222" stroke-width="1.5"><path d="M8 10V1.5M4.5 5 8 1.5 11.5 5M2.5 8v6h11V8"/></svg></button>
        <button class="tb-btn" aria-label="Save" (click)="store.toggleSaved()"><svg class="heart" [class.pop]="store.saved()" viewBox="0 0 16 16" width="16" height="16" stroke-width="1.5" [attr.fill]="store.saved() ? '#ff385c' : 'none'" [attr.stroke]="store.saved() ? '#ff385c' : '#222'"><path d="M8 14S1.5 10 1.5 5.5A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 6.5 1.5C14.5 10 8 14 8 14z"/></svg></button>
      </div>
    </div>
    <div class="tour-body" #body (scroll)="onScroll()">
      <div class="tour-wrap">
        <div class="tour-thumbs">
          @for (s of l.tour; track s.id) {
            <div class="tt" [class.active]="active() === s.id" (click)="jump(s.id)"><img [src]="s.photos[0]" alt="">{{ s.name }}</div>
          }
        </div>
        @for (s of l.tour; track s.id) {
          <div class="tour-sec" [id]="'ts-' + s.id">
            <div class="ts-title"><div class="ts-sticky"><h3>{{ s.name }}</h3>@if (s.desc) { <p>{{ s.desc }}</p> }</div></div>
            <div class="tp">
              @for (p of pics(s.photos); track $index) {
                <img [class]="p.big ? 'big' : 'sm'" [src]="p.src" alt="" (click)="ui.lightbox.set(indexOf(p.src))">
              }
            </div>
          </div>
        }
      </div>
    </div>
  </div>
}`,
})
export class PhotoTour {
  store = inject(Store);
  ui = inject(UiService);
  private body = viewChild<ElementRef<HTMLElement>>('body');
  active = signal<string | null>(null);

  flat = computed(() => this.store.listing()?.tour.flatMap(s => s.photos) ?? []);

  constructor() {
    effect(() => {
      if (!this.ui.tourOpen()) return;
      const target = this.ui.tourTarget();
      // wait for the overlay to render, then jump to the clicked photo's section
      setTimeout(() => {
        const body = this.body()?.nativeElement;
        if (!body) return;
        body.style.scrollBehavior = 'auto';
        body.scrollTop = 0;
        const sec = target && this.store.listing()?.tour.find(s => s.photos.includes(target));
        if (sec) body.scrollTop = this.secTop(sec.id);
        body.style.scrollBehavior = '';
      });
    });
  }

  pics = layout;
  indexOf(src: string) { return this.flat().indexOf(src); }

  private secTop(id: string) { return (document.getElementById('ts-' + id)?.offsetTop ?? 0) - 8; }
  jump(id: string) { this.body()?.nativeElement.scrollTo({ top: this.secTop(id), behavior: 'smooth' }); }
  onScroll() {
    const body = this.body()?.nativeElement;
    if (!body) return;
    let cur: string | null = null;
    for (const s of this.store.listing()!.tour) if ((document.getElementById('ts-' + s.id)?.offsetTop ?? 0) <= body.scrollTop + 120) cur = s.id;
    this.active.set(cur);
  }
}
