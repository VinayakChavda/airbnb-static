import { Component, inject } from '@angular/core';
import { Store } from './core/store.service';
import { Header } from './features/header';
import { Gallery } from './features/gallery';
import { Info } from './features/info';
import { Amenities } from './features/amenities';
import { Calendar } from './features/calendar';
import { BookingCard } from './features/booking-card';
import { Reviews } from './features/reviews';
import { Location } from './features/location';
import { Host } from './features/host';
import { ThingsToKnow } from './features/things-to-know';
import { SimilarStays } from './features/similar-stays';
import { PhotoTour } from './features/photo-tour';
import { Overlays } from './features/overlays';
import { Lightbox } from './features/lightbox';
import { Reveal } from './shared/reveal.directive';
import { ChatWidget } from './chat/chat-widget';

@Component({
  selector: 'app-root',
  imports: [Header, Gallery, Info, Amenities, Calendar, BookingCard, Reviews, Location, Host, ThingsToKnow, SimilarStays, PhotoTour, Lightbox, Overlays, ChatWidget, Reveal],
  template: `
<app-header/>
<main class="wrap">
  @if (store.loadError()) {
    <p style="padding:80px 0;text-align:center">Couldn't reach the API. Make sure the backend is running on port 3000 (<code>cd backend &amp;&amp; npm start</code>).</p>
  }
  <section id="photos" reveal><app-gallery/></section>
  @if (store.listing()) {
    <div class="layout">
      <div class="col-main"><app-info reveal/><app-amenities reveal/><app-calendar reveal/></div>
      <aside class="col-side" reveal><app-booking-card/></aside>
    </div>
    <app-reviews reveal/>
    <app-location reveal/>
    <app-host reveal/>
    <app-things-to-know reveal/>
    <app-similar-stays reveal/>
  }
</main>
<app-photo-tour/>
<app-lightbox/>
<app-overlays/>
<app-chat/>`,
})
export class App {
  store = inject(Store);
  constructor() { this.store.load(); }
}
