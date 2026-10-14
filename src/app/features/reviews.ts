import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Icon } from '../shared/icon';
import { ReviewCard } from './review-card';

@Component({
  selector: 'app-reviews',
  imports: [Icon, ReviewCard],
  template: `
@if (store.listing(); as l) {
  <section class="block full" id="reviews">
    <div class="rv-hero">
      <div class="rv-score"><img class="laurel big" src="/assets/images/ui/laurel-left.png" alt=""><b>{{ l.rating }}</b><img class="laurel big" src="/assets/images/ui/laurel-right.png" alt=""></div>
      <h3>Guest favourite</h3>
      <p>This home is a guest favourite based on ratings, reviews and reliability</p>
      <a href="#" (click)="how($event)">How reviews work</a>
    </div>
    <div class="rv-stats">
      <div>Overall rating
        <div class="bars">
          @for (n of [5, 4, 3, 2, 1]; track n) {
            <div class="bar">{{ n }}<i><em [style.width.%]="l.ratingBars[n]"></em></i></div>
          }
        </div>
      </div>
      @for (c of l.categories; track c.name) {
        <div>{{ c.name }}<b>{{ c.score }}</b><app-icon [name]="c.icon" [size]="26"/></div>
      }
    </div>
    <div class="chips-wrap">
      @if (!atStart()) { <button class="chip-arrow l" (click)="scroll(-360)">‹</button> }
      <div class="chips" #chipsEl (scroll)="onChipScroll()">
        @for (c of l.chips; track c.name) {
          <button class="chip" [class.on]="tag() === c.name" (click)="toggle(c.name)"><img class="chip-ic" [src]="c.icon" alt="">{{ c.name }} {{ c.count }}</button>
        }
      </div>
      @if (!atEnd()) { <button class="chip-arrow r" (click)="scroll(360)">›</button> }
    </div>
    <div class="rv-grid">
      @for (r of shown(); track r.name) { <app-review-card [review]="r"/> }
      @empty { <p class="rv-empty">No reviews mention “{{ tag() }}” yet.</p> }
    </div>
    <button class="btn-outline" (click)="ui.openModal({ kind: 'reviews' })">Show all {{ l.reviewCount }} reviews</button>
  </section>
}`,
})
export class Reviews {
  store = inject(Store);
  ui = inject(UiService);
  private api = inject(ApiService);

  tag = signal<string | null>(null);
  // reviews matching the selected topic chip are fetched from the API
  private filtered = toSignal(toObservable(this.tag).pipe(switchMap(t => this.api.reviews(t ?? undefined))), { initialValue: [] });
  shown = computed(() => this.filtered().slice(0, 6));

  private chipsEl = viewChild<ElementRef<HTMLElement>>('chipsEl');
  atStart = signal(true);
  atEnd = signal(false);

  toggle(name: string) { this.tag.set(this.tag() === name ? null : name); }
  scroll(by: number) { this.chipsEl()?.nativeElement.scrollBy({ left: by }); }
  onChipScroll() {
    const el = this.chipsEl()?.nativeElement;
    if (!el) return;
    this.atStart.set(el.scrollLeft < 10);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);
  }
  how(e: Event) {
    e.preventDefault();
    this.ui.openModal({ kind: 'info', title: 'How reviews work', lines: ['Guest reviews are only collected after a stay is completed. Overall ratings and category scores are averaged from every review, and homes with consistently high ratings, reviews and reliability earn the Guest favourite badge.'] });
  }
}
