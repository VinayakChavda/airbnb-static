import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '../core/store.service';
import { MONTHS, isoOf, longD } from '../core/utils';

interface Cell { day: number; iso: string; cls: string; disabled: boolean; }
interface Month { title: string; blanks: number[]; cells: Cell[]; }

@Component({
  selector: 'app-calendar',
  template: `
<section class="block" id="calendar">
  <h3>{{ heading() }}</h3>
  <p class="muted-s">{{ subheading() }}</p>
  <div class="cal">
    <button class="cal-nav l" [disabled]="offset() === 0" (click)="offset.set(offset() - 1)">‹</button>
    <button class="cal-nav r" (click)="offset.set(offset() + 1)">›</button>
    @for (m of months(); track m.title) {
      <div class="cal-month" animate.enter="enter-rise">
        <h5>{{ m.title }}</h5>
        <div class="cal-grid">
          @for (d of dow; track $index) { <div class="dow">{{ d }}</div> }
          @for (b of m.blanks; track b) { <div></div> }
          @for (c of m.cells; track c.iso) {
            <div [class]="c.cls" (click)="pick(c)"><span>{{ c.day }}</span></div>
          }
        </div>
      </div>
    }
  </div>
  <div class="cal-foot">
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" stroke-width="1.2"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M4 6h1M7 6h1M10 6h1"/></svg>
    <a href="#" (click)="clear($event)">Clear dates</a>
  </div>
</section>`,
})
export class Calendar {
  store = inject(Store);
  dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  offset = signal(0); // months after the current month

  heading = computed(() => {
    const n = this.store.nights();
    if (n) return `${n} night${n > 1 ? 's' : ''} in Candolim`;
    return this.store.start() ? 'Select checkout date' : 'Select check-in date';
  });
  subheading = computed(() => {
    const s = this.store.start(), e = this.store.end();
    return s && e ? `${longD(s)} - ${longD(e)}` : 'Add your travel dates for exact pricing';
  });

  months = computed<Month[]>(() => {
    const [ty, tm] = this.store.today().split('-').map(Number);
    return [0, 1].map(i => this.build(new Date(ty, tm - 1 + this.offset() + i, 1)));
  });

  private build(base: Date): Month {
    const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    const { today, start: s, end: e } = { today: this.store.today(), start: this.store.start(), end: this.store.end() };
    const off = this.store.unavailable();
    const cells: Cell[] = [];
    for (let d = 1; d <= days; d++) {
      const iso = isoOf(y, m, d);
      const past = iso < today, blocked = off.has(iso);
      let cls = 'day';
      if (past) cls += ' past'; else if (blocked) cls += ' off';
      if (iso === s) cls += ' sel start' + (!e ? ' end' : '');
      if (iso === e) cls += ' sel end';
      if (s && e && iso > s && iso < e) cls += ' mid';
      cells.push({ day: d, iso, cls, disabled: past || blocked });
    }
    return { title: `${MONTHS[m]} ${y}`, blanks: Array.from({ length: first }, (_, i) => i), cells };
  }

  pick(c: Cell) { if (!c.disabled) this.store.pickDate(c.iso); }
  clear(e: Event) { e.preventDefault(); this.store.clearDates(); }
}
