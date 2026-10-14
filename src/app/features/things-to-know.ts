import { Component, inject } from '@angular/core';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-things-to-know',
  imports: [Icon],
  template: `
@if (store.listing(); as l) {
  <section class="block full">
    <h3>Things to know</h3>
    <div class="ttk">
      @for (g of groups(); track g.title) {
        <div>
          <app-icon [name]="g.icon"/>
          <h4>{{ g.title }}</h4>
          @for (line of g.lines; track line) { <p>{{ line }}</p> }
          <a href="#" (click)="learn($event, g.title, g.lines)">Learn more</a>
        </div>
      }
    </div>
  </section>
}`,
})
export class ThingsToKnow {
  store = inject(Store);
  private ui = inject(UiService);
  groups() {
    const t = this.store.listing()!.thingsToKnow;
    return [
      { title: 'Cancellation policy', icon: 'outdoor', lines: t.cancel },
      { title: 'House rules', icon: 'cool', lines: t.rules },
      { title: 'Safety & property', icon: 'co', lines: t.safety },
    ];
  }
  learn(e: Event, title: string, lines: string[]) { e.preventDefault(); this.ui.openModal({ kind: 'info', title, lines }); }
}
