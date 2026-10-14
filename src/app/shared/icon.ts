import { Component, computed, input } from '@angular/core';

const ICONS: Record<string, string> = {
  // listing / highlights
  outdoor: 'M3 20h18M6 20V10l6-6 6 6v10M10 20v-5h4v5',
  cool: 'M12 2v20M4 6l16 12M20 6 4 18',
  door: 'M6 3h12v18H6zM14 12h.1',
  clean: 'M9 3h5v4H9zM8 7h7l1 4v10H7V11zM17 5l1-1M18 8h2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  key: 'M10 10a4 4 0 1 0 0 .1M13 13l7 7M17 17l2-2',
  msg: 'M4 4h16v12H10l-4 4v-4H4z',
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16',
  tag: 'M3 12 12 3h9v9l-9 9zM16 8h.1',
  generic: 'M5 5h14v14H5z',
  // bathroom
  hair: 'M3 9a4 4 0 0 1 4-4h8a3 3 0 0 1 0 6H7a4 4 0 0 1-4-2zM9 11l-1 8h3l1-8',
  cleanprod: 'M8 3h5v3H8zM7 6h7v4H7zM6 10h9v11H6zM10 14h2',
  shampoo: 'M10 3h4v3h-4zM8 6h8v15H8zM8 11h8M8 15h8',
  hotwater: 'M3 12h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM8 4c0 2 2 2 2 4M12 4c0 2 2 2 2 4M16 4c0 2 2 2 2 4',
  showergel: 'M4 9h7v12H4zM6 6h3v3M15 7h.1M18 10h.1M16 13h.1',
  tub: 'M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0',
  // bedroom & laundry
  washer: 'M4 3h16v18H4zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8 12h8',
  hangers: 'M12 6a2 2 0 1 1 2 2l-2 1.5L3 18h18l-9-8.5',
  bedlinen: 'M5 3h10l4 4v14H5zM5 17h14',
  blinds: 'M3 4h18v12H3zM12 16v4',
  iron: 'M3 15h13a5 5 0 0 0 5-5V8h-9a9 9 0 0 0-9 7zM6 19v.1M10 19v.1M14 19v.1',
  storage: 'M5 3h14v17H5zM12 3v17M9 11v2M15 11v2M7 20v2M17 20v2',
  cot: 'M3 6h18M3 18h18M5 6v12M8 6v12M11 6v12M14 6v12M17 6v12M20 6v12',
  // entertainment / climate
  tv: 'M3 6h18v12H3zM8 21h8',
  ac: 'M12 2v20M3.5 7l17 10M3.5 17l17-10M9 4l3 2 3-2M9 20l3-2 3 2',
  fan: 'M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM12 10C9 7 10 3 12 3s3 4 0 7zM14 12c4-1 7 1 6 3s-5 1-6-3zM10 14c-1 4-5 5-6 3s2-5 6-3z',
  // safety
  camera: 'M3 7h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  co: 'M4 4h16v16H4zM8 9h.1M12 9h.1M16 9h.1M8 15h8',
  smoke: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 12a3 3 0 0 1 6 0M12 8v1',
  // internet
  wifi: 'M3 9a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0M9 17a4 4 0 0 1 6 0M12 20.5v.1',
  desk: 'M3 10h18v3H3zM5 13v7M19 13v7M8 10V6h3v4M15 10V4',
  // kitchen
  kitchen: 'M6 3v8a2 2 0 0 0 2 2v8M10 3v6M14 3c-2 2-2 8 0 9v9M18 3v18',
  fridge: 'M6 2h12v20H6zM6 10h12M9 5v2M9 13v3',
  microwave: 'M3 5h18v14H3zM7 9h7v6H7zM17 9h.1M17 13h.1',
  crockery: 'M5 3v7M8 3v7M5 7h3M6.5 10v11M14 21V3c-3 1-4 5-4 9h4',
  kettle: 'M7 8h10l1 12H6zM17 11h3v4h-3M9 8V5h6v3',
  coffee: 'M5 3h14v5H5zM7 8v13h10V8M9 14h6',
  wine: 'M8 3h8c0 6-1 9-4 9S8 9 8 3zM12 12v8M8 21h8',
  toaster: 'M4 9h16v10H4zM7 9V6h10v3',
  blender: 'M7 3h10l-1.5 12h-7zM9 15v4h6v-4M9 21h6',
  cooker: 'M4 3h16v18H4zM8 8h.1M16 8h.1M8 14h.1M16 14h.1',
  // outdoor / facilities
  patio: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11v10M8 21h8',
  dining: 'M12 3a8 7 0 0 0-8 7h16a8 7 0 0 0-8-7zM12 10v11M7 21v-4M17 21v-4',
  parking: 'M4 14l2-6h12l2 6v5H4zM4 14h16M7 17h.1M17 17h.1',
  pool: 'M2 17c2 0 2 1.5 4 1.5S8 17 10 17s2 1.5 4 1.5S16 17 18 17s2 1.5 4 1.5M8 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0M8 8h6',
  gym: 'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12',
  // services
  pet: 'M7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 15c-3 0-5 3-3 5 1 1 5 1 6 0 2-2 0-5-3-5z',
  cleaning: 'M9 3h5v4H9zM8 7h7l1 4v10H7V11zM17 5l1-1M18 8h2',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
};

@Component({
  selector: 'app-icon',
  template: `<svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()" fill="none" [attr.stroke]="color()" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path [attr.d]="path()"/>
    @if (strike()) { <path d="M3 3l18 18" stroke-width="1.5"/> }
  </svg>`,
  host: { style: 'display:inline-flex;flex:none' },
})
export class Icon {
  name = input('generic');
  size = input(24);
  strike = input(false);
  color = input('#222');
  path = computed(() => ICONS[this.name()] ?? ICONS['generic']);
}
