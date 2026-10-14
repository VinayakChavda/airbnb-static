import { Component, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Tip } from '../shared/tip.directive';

@Component({
  selector: 'app-location',
  imports: [Tip],
  template: `
@if (store.listing(); as l) {
  <section class="block full" id="location">
    <h3>Where you'll be</h3>
    <p class="muted-s">Candolim, Goa, India</p>
    <div class="map">
      <div class="map-land" [style.transform]="'scale(' + zoom() + ')'"></div>
      <div class="map-blob b1" [style.transform]="'scale(' + zoom() + ')'"></div>
      <div class="map-blob b2" [style.transform]="'scale(' + zoom() + ')'"></div>
      <div class="map-pin" (click)="ui.showToast('Exact location will be provided after booking')">
        <svg viewBox="0 0 16 16" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.3"><path d="M2 8 8 3l6 5M3.5 7v6.5h9V7M6.5 13.5V9.5h3v4"/></svg></div>
      <button class="map-search" tip="Search the map"><svg viewBox="0 0 32 32" width="12" height="12" fill="none" stroke="#222" stroke-width="3.5"><circle cx="13" cy="13" r="9"/><path d="m20 20 9 9"/></svg></button>
      <div class="map-zoom"><button (click)="zoomBy(1.25)">+</button><button (click)="zoomBy(0.8)">−</button></div>
    </div>
    <p class="muted-xs">Exact location will be provided after booking.</p>
    <h4>Neighbourhood highlights</h4>
    <p class="muted-s2">{{ open() ? l.neighbourhood.full : l.neighbourhood.short }}</p>
    <button class="show-more" (click)="open.set(!open())">{{ open() ? 'Show less' : 'Show more' }} <span>›</span></button>
  </section>
}`,
})
export class Location {
  store = inject(Store);
  ui = inject(UiService);
  zoom = signal(1);
  open = signal(false);
  zoomBy(f: number) { this.zoom.update(z => Math.min(2.2, Math.max(0.7, z * f))); }
}
