import { Injectable, signal } from '@angular/core';
import { Modal } from './models';

@Injectable({ providedIn: 'root' })
export class UiService {
  toast = signal<{ text: string; id: number } | null>(null);
  modal = signal<Modal | null>(null);
  tip = signal<{ text: string; x: number; y: number } | null>(null);
  lightbox = signal<number | null>(null); // index into the flattened tour photos
  tourOpen = signal(false);
  tourClosing = signal(false);
  tourTarget = signal<string | null>(null);

  private toastTimer?: ReturnType<typeof setTimeout>;
  private toastId = 0;

  showToast(text: string) {
    this.toast.set({ text, id: ++this.toastId });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2200);
  }
  openModal(m: Modal) { this.modal.set(m); }
  closeModal() { this.modal.set(null); }

  openTour(src: string | null = null) {
    this.tourTarget.set(src);
    this.tourClosing.set(false);
    this.tourOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
  closeTour() {
    this.lightbox.set(null);
    this.tourClosing.set(true);
    setTimeout(() => {
      this.tourOpen.set(false);
      this.tourClosing.set(false);
      document.body.style.overflow = '';
    }, 240);
  }
  scrollTo(id: string, block: ScrollLogicalPosition = 'start') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block });
  }
}
