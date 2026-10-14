import { Directive, ElementRef, OnDestroy, OnInit, inject, signal } from '@angular/core';

/** Fades + slides an element into place the first time it scrolls into view. */
@Directive({
  selector: '[reveal]',
  host: { class: 'reveal', '[class.in]': 'shown()' },
})
export class Reveal implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  shown = signal(false);
  private io?: IntersectionObserver;

  ngOnInit() {
    if (typeof IntersectionObserver === 'undefined') { this.shown.set(true); return; }
    this.io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { this.shown.set(true); this.io?.disconnect(); }
    }, { threshold: 0.04, rootMargin: '0px 0px -6% 0px' });
    this.io.observe(this.el.nativeElement);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}
