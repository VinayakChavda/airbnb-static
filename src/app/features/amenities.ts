import { Component, inject } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-amenities',
  imports: [Icon],
  template: `
@if (store.listing(); as l) {
  <section class="block" id="amenities">
    <h3>What this place offers</h3>
    <div class="amen-grid">
      @for (a of l.amenities; track a.name) {
        <div class="amen" [class.off]="a.unavailable"><app-icon [name]="a.key" [strike]="!!a.unavailable" [color]="a.unavailable ? '#6a6a6a' : '#222'"/><span>{{ a.name }}</span></div>
      }
    </div>
    <button class="btn-outline" (click)="ui.openModal({ kind: 'amenities' })">Show all {{ l.amenityTotal }} amenities</button>
  </section>
}`,
})
export class Amenities {
  store = inject(Store);
  ui = inject(UiService);
}
