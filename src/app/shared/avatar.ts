import { Component, computed, input } from '@angular/core';

/** Profile picture; falls back to a coloured circle with the first letter when there is no photo. */
@Component({
  selector: 'app-avatar',
  template: `
@if (src(); as s) {
  <img class="av" [src]="s" alt="" [style.width.px]="size()" [style.height.px]="size()">
} @else {
  <span class="av letter" [style.width.px]="size()" [style.height.px]="size()" [style.background]="bg()" [style.color]="fg()" [style.font-size.px]="size() * 0.42">{{ initial() }}</span>
}`,
  host: { style: 'display:inline-flex;flex:none' },
})
export class Avatar {
  src = input<string | null | undefined>(null);
  name = input('');
  tint = input<[string, string] | undefined>(undefined);
  size = input(40);
  initial = computed(() => (this.name().trim()[0] ?? '?').toUpperCase());
  bg = computed(() => this.tint()?.[0] ?? '#eee');
  fg = computed(() => this.tint()?.[1] ?? '#555');
}
