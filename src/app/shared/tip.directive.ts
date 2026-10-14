import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { UiService } from '../core/ui.service';

@Directive({ selector: '[tip]' })
export class Tip {
  tip = input.required<string>();
  private el = inject(ElementRef<HTMLElement>);
  private ui = inject(UiService);

  @HostListener('mouseenter') show() {
    const r = this.el.nativeElement.getBoundingClientRect();
    this.ui.tip.set({ text: this.tip(), x: r.left + r.width / 2, y: r.top });
  }
  @HostListener('mouseleave') @HostListener('click') hide() { this.ui.tip.set(null); }
}
