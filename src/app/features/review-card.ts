import { Component, input, signal } from '@angular/core';
import { Review } from '../core/models';
import { Avatar } from '../shared/avatar';

@Component({
  selector: 'app-review-card',
  imports: [Avatar],
  template: `
<div class="rv" animate.enter="enter-rise">
  <div class="rv-head"><app-avatar [src]="review().avatar" [name]="review().name" [tint]="review().tint" [size]="40"/><div><b>{{ review().name }}</b><span>{{ review().meta }}</span></div></div>
  <div class="rv-meta"><span class="stars" aria-label="5 stars"></span>· {{ review().when }}</div>
  <p class="rv-text" [class.clamp]="review().long && !open()">{{ review().text }}</p>
  @if (review().long) {
    <button class="rv-more" (click)="open.set(!open())">{{ open() ? 'Show less' : 'Show more' }}</button>
  }
</div>`,
})
export class ReviewCard {
  review = input.required<Review>();
  open = signal(false);
}
