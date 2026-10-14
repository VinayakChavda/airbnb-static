import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-info',
  imports: [Icon],
  template: `
@if (store.listing(); as l) {
  <div class="overview">
    <h2>{{ l.subtitle }}</h2>
    <p class="muted-s">{{ l.facts }}</p>
  </div>
  <div class="gf-card">
    <div class="gf-badge"><img class="laurel" src="/assets/images/ui/laurel-left.png" alt=""><span>Guest<br>favourite</span><img class="laurel" src="/assets/images/ui/laurel-right.png" alt=""></div>
    <p class="gf-text">One of the most loved homes on Airbnb, according to guests</p>
    <div class="gf-score"><b>{{ l.rating }}</b><span class="stars" aria-label="5 stars"></span></div>
    <div class="gf-count"><b>{{ l.reviewCount }}</b><span>Reviews</span></div>
  </div>
  <div class="host-row"><img [src]="l.host.avatar" alt=""><div><b>Hosted by {{ l.host.name }}</b><br><span class="muted-s">{{ l.host.years }} years hosting</span></div></div>
  <div class="highlights">
    @for (h of l.highlights; track h.title) {
      <div class="hl"><app-icon [name]="h.icon" [size]="26"/><div><b>{{ h.title }}</b><p>{{ h.text }}</p></div></div>
    }
  </div>
  <div class="translated">Some info has been automatically translated. <a href="#" (click)="toggleOriginal($event)">{{ showOriginal() ? 'Show translation' : 'Show original' }}</a></div>
  <p class="desc" [class.clamp]="!expanded() && !showOriginal()">{{ text() }}</p>
  <button class="show-more" (click)="expanded.set(!expanded()); showOriginal.set(false)">{{ expanded() ? 'Show less' : 'Show more' }} <span>›</span></button>

  <section class="block"><h3>Where you'll sleep</h3>
    <div class="sleep">
      @for (s of l.sleeping; track s.name) {
        <figure><img [src]="s.img" [alt]="s.name"><b>{{ s.name }}</b><span class="muted-s">{{ s.beds }}</span></figure>
      }
    </div>
  </section>
}`,
})
export class Info {
  store = inject(Store);
  expanded = signal(false);
  showOriginal = signal(false);
  text = computed(() => {
    const d = this.store.listing()?.description;
    if (!d) return '';
    return this.showOriginal() ? d.original : this.expanded() ? d.full : d.short;
  });
  toggleOriginal(e: Event) { e.preventDefault(); this.showOriginal.update(v => !v); }
}
