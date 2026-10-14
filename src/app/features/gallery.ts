import { Component, inject } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Tip } from '../shared/tip.directive';

@Component({
  selector: 'app-gallery',
  imports: [Tip],
  template: `
@if (store.listing(); as l) {
  <div class="title-row">
    <h1>{{ l.title }}</h1>
    <div class="title-actions">
      <button class="link-btn" tip="Share options">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10V1.5M4.5 5 8 1.5 11.5 5M2.5 8v6h11V8"/></svg> Share</button>
      <button class="link-btn" [class.saved]="store.saved()" (click)="store.toggleSaved()">
        <svg class="heart" [class.pop]="store.saved()" viewBox="0 0 16 16" width="15" height="15" stroke-width="1.5" [attr.fill]="store.saved() ? '#ff385c' : 'none'" [attr.stroke]="store.saved() ? '#ff385c' : 'currentColor'"><path d="M8 14S1.5 10 1.5 5.5A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 6.5 1.5C14.5 10 8 14 8 14z"/></svg>
        <span>{{ store.saved() ? 'Saved' : 'Save' }}</span></button>
    </div>
  </div>
  <div class="gallery" id="gallery">
    @for (src of l.hero; track src; let i = $index) {
      <img [class]="'g' + i" [src]="src" [alt]="'Photo ' + (i + 1)" (click)="ui.openTour(src)">
    }
    <button class="show-all" (click)="ui.openTour()">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="#222"><circle cx="3" cy="3" r="1.3"/><circle cx="8" cy="3" r="1.3"/><circle cx="13" cy="3" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/><circle cx="3" cy="13" r="1.3"/><circle cx="8" cy="13" r="1.3"/><circle cx="13" cy="13" r="1.3"/></svg> Show all photos</button>
  </div>
}`,
})
export class Gallery {
  store = inject(Store);
  ui = inject(UiService);
}
