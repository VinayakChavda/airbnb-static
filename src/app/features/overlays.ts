import { Component, HostListener, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { Icon } from '../shared/icon';
import { ReviewCard } from './review-card';

@Component({
  selector: 'app-overlays',
  imports: [FormsModule, Icon, ReviewCard],
  template: `
@if (ui.modal(); as m) {
  <div class="modal-back" animate.enter="enter-fade" animate.leave="leave-fade" (mousedown)="backdrop($event)">
    <div class="modal" [class.wide]="m.kind === 'reviews'" [class.am]="m.kind === 'amenities'" role="dialog">
      <button class="modal-x" aria-label="Close" (click)="ui.closeModal()">✕</button>
      @switch (m.kind) {
        @case ('amenities') {
          <div class="am-modal"><h2>What this place offers</h2>
            @for (g of store.listing()?.amenityGroups; track g.title) {
              <h4>{{ g.title }}</h4>
              <div class="am-list">
                @for (a of g.items; track a.name) {
                  <div class="amen" [class.off]="a.unavailable"><app-icon [name]="a.key" [size]="32" [strike]="!!a.unavailable" [color]="a.unavailable ? '#6a6a6a' : '#222'"/><span>{{ a.name }}</span></div>
                }
              </div>
            }
          </div>
        }
        @case ('reviews') {
          <div class="rv-modal modal-body-pad"><h3>★ {{ store.listing()?.rating }} · {{ store.listing()?.reviewCount }} reviews</h3>
            <div class="rv-grid">@for (r of store.allReviews(); track $index) { <app-review-card [review]="r"/> }</div></div>
        }
        @case ('report') {
          <div class="modal-body-pad"><h3>Report this listing</h3>
            <div class="form-row">
              <select [(ngModel)]="reason">
                <option>It's inaccurate or incorrect</option><option>It's not a real home</option><option>It's a scam</option><option>It's offensive</option>
              </select>
              <textarea rows="4" placeholder="Tell us more (optional)" [(ngModel)]="details"></textarea>
              <button class="btn-reserve" (click)="store.sendReport(reason, details)">Submit report</button>
            </div></div>
        }
        @case ('message') {
          <div class="modal-body-pad"><h3>Message {{ store.listing()?.host?.name }}</h3>
            <div class="form-row">
              <textarea rows="5" placeholder="Hi! I'm interested in staying at your place…" [(ngModel)]="message"></textarea>
              <button class="btn-reserve" [disabled]="!message.trim()" (click)="store.sendMessage(message)">Send message</button>
            </div></div>
        }
        @case ('info') {
          @if (info(); as i) {
            <div class="modal-body-pad"><h3>{{ i.title }}</h3>@for (line of i.lines; track line) { <p style="margin-bottom:12px;line-height:1.6">{{ line }}</p> }</div>
          }
        }
      }
    </div>
  </div>
}

@if (ui.toast(); as t) { @for (x of [t]; track x.id) { <div class="toast" animate.enter="toast-in" animate.leave="toast-out">{{ x.text }}</div> } }
@if (ui.tip(); as t) { <div class="tip" animate.enter="enter-fade" animate.leave="leave-fade" [style.left.px]="t.x" [style.top.px]="t.y - 38">{{ t.text }}</div> }`,
})
export class Overlays {
  store = inject(Store);
  ui = inject(UiService);
  reason = "It's inaccurate or incorrect";
  details = '';
  message = '';

  info = computed(() => { const m = this.ui.modal(); return m?.kind === 'info' ? m : null; });

  backdrop(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-back')) this.ui.closeModal(); }

  @HostListener('document:keydown', ['$event'])
  key(e: KeyboardEvent) {
    if (e.key !== 'Escape') return;
    // close the top-most layer first: lightbox -> modal -> photo tour
    if (this.ui.lightbox() !== null) this.ui.lightbox.set(null);
    else if (this.ui.modal()) this.ui.closeModal();
    else if (this.ui.tourOpen()) this.ui.closeTour();
  }
}