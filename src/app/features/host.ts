import { Component, inject } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Avatar } from '../shared/avatar';

@Component({
  selector: 'app-host',
  imports: [Avatar],
  template: `
@if (store.listing(); as l) {
  <section class="block full host-sec">
    <h3>Meet your host</h3>
    <div class="host-grid">
      <div>
        <div class="host-card">
          <div class="hc-left">
            <div class="hc-av"><img [src]="l.host.avatar" alt=""><span class="badge">✔</span></div>
            <h4>{{ l.host.name }}</h4><p class="muted-xs">Host</p>
          </div>
          <div class="hc-stats">
            <div><b>{{ l.host.reviews }}</b><span>Reviews</span></div><hr>
            <div><b>{{ l.host.rating }}★</b><span>Rating</span></div><hr>
            <div><b>{{ l.host.years }}</b><span>Years hosting</span></div>
          </div>
        </div>
        <ul class="host-facts">
          @for (f of l.host.facts; track f; let i = $index) { <li>{{ i ? '🎓' : '📍' }} &nbsp;{{ f }}</li> }
        </ul>
      </div>
      <div>
        <h4 class="mb">Co-Hosts</h4>
        <div class="cohosts">
          @for (c of l.host.coHosts; track c.name) { <div class="co"><app-avatar [src]="c.avatar" [name]="c.name" [tint]="c.tint" [size]="28"/>{{ c.name }}</div> }
        </div>
        <h4 class="mb top">Host details</h4>
        <p class="muted-s2">@for (r of l.host.response; track r) { {{ r }}<br> }</p>
        <button class="btn-gray" (click)="ui.openModal({ kind: 'message' })">Message host</button>
        <p class="pay-note"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#777" stroke-width="1.2"><path d="M8 1.5 2.5 3.5v4c0 3.5 2.3 6 5.5 7 3.2-1 5.5-3.5 5.5-7v-4z"/></svg> To help protect your payment, always use Airbnb to send money and communicate with hosts.</p>
      </div>
    </div>
  </section>
}`,
})
export class Host {
  store = inject(Store);
  ui = inject(UiService);
}
