import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { TODAY } from '../core/static-data';
import { MONTHS, isoOf, longD } from '../core/utils';
import { describeAvailability, search } from './local-knowledge';

export interface ChatSource { title: string; score: number; }
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  error?: boolean;
  sources?: ChatSource[];
  mode?: 'llm' | 'retrieval';
}

type ServerEvent =
  | { type: 'sources'; sources: ChatSource[] }
  | { type: 'delta'; text: string }
  | { type: 'done'; mode: 'llm' | 'retrieval' }
  | { type: 'error'; message: string };

const STORAGE_KEY = 'listing-chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);
  open = signal(false);
  busy = signal(false);
  messages = signal<ChatMessage[]>(this.restore());

  private abort?: AbortController;

  toggle() { this.open.update(v => !v); }
  close() { this.open.set(false); }

  reset() {
    this.abort?.abort();
    this.busy.set(false);
    this.messages.set([]);
    this.persist();
  }

  async send(text: string) {
    text = text.trim();
    if (!text || this.busy()) return;

    const history = [...this.messages(), { role: 'user', content: text } as ChatMessage];
    this.messages.set([...history, { role: 'assistant', content: '', pending: true }]);
    this.busy.set(true);
    this.abort = new AbortController();

    try {
      const signal = this.abort.signal;
      const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
      await pause(350); // brief "typing" delay
      if (signal.aborted) return;

      // short follow-ups ("and the pool?") are searched together with the previous question
      const previousUser = history.slice(0, -1).reverse().find(m => m.role === 'user')?.content;
      const query = text.length < 25 && previousUser ? `${previousUser} ${text}` : text;
      const found = search(query, 6);
      this.apply({ type: 'sources', sources: found.slice(0, 3).map(f => ({ title: f.title, score: Number(f.score.toFixed(3)) })) });

      let reply: string;
      if (/^(hi|hello|hey|hola|namaste)\b/i.test(text) && text.length < 20) {
        reply = 'Hi! 👋 I can answer questions about this stay: price, amenities, house rules, reviews, location and availability. What would you like to know?';
      } else if (/availab|vacan|\bbook(ed|ing)?\b|\bdates?\b|free on/i.test(text)) {
        const unavailable = this.api.unavailableDates();
        const asked = this.askedDate(text);
        const specific = asked
          ? (asked < TODAY ? `${longD(asked)} is in the past.` : unavailable.includes(asked) ? `Sorry, ${longD(asked)} is **not available**.` : `Good news - ${longD(asked)} is **available**.`) + '\n'
          : '';
        reply = `${specific}- **Availability:** ${describeAvailability(unavailable)}\n- Pick your dates in the calendar to see the exact price.`;
      } else if (!found.length) {
        reply = "I couldn't find anything about that on this page. Try \"Message host\" for details.";
      } else {
        const body = found.slice(0, 3).map(f => `- **${f.title}:** ${f.text.length > 260 ? f.text.slice(0, 257) + '…' : f.text}`).join('\n');
        reply = `Here's what the listing says:\n${body}`;
      }

      // reveal the text a few words at a time so it feels like streaming
      const parts = reply.match(/\S+\s*/g) ?? [reply];
      for (let i = 0; i < parts.length; i += 3) {
        if (signal.aborted) return;
        this.apply({ type: 'delta', text: parts.slice(i, i + 3).join('') });
        await pause(30);
      }
      this.apply({ type: 'done', mode: 'retrieval' });
      this.patchLast({ pending: false });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      this.patchLast(last => ({
        pending: false, error: true,
        content: last.content || (e as Error).message || 'Sorry, something went wrong. Please try again.',
      }));
    } finally {
      this.busy.set(false);
      this.persist();
    }
  }

  /** Finds a date like "25th of November" / "nov 25" in the question (2026 assumed). */
  private askedDate(text: string): string | null {
    const months = MONTHS.map(m => m.slice(0, 3).toLowerCase());
    const t = text.toLowerCase();
    const m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?([a-z]{3})[a-z]*/) ?? t.match(/([a-z]{3})[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?/);
    if (!m) return null;
    const [day, mon] = /^\d/.test(m[1]) ? [Number(m[1]), m[2]] : [Number(m[2]), m[1]];
    const mi = months.indexOf(mon);
    return mi < 0 || day < 1 || day > 31 ? null : isoOf(2026, mi, day);
  }

  private apply(e: ServerEvent) {
    switch (e.type) {
      case 'sources': this.patchLast({ sources: e.sources }); break;
      case 'delta': this.patchLast(last => ({ content: last.content + e.text })); break;
      case 'done': this.patchLast({ pending: false, mode: e.mode }); break;
      case 'error': this.patchLast({ pending: false, error: true, content: e.message }); break;
    }
  }

  private patchLast(patch: Partial<ChatMessage> | ((last: ChatMessage) => Partial<ChatMessage>)) {
    this.messages.update(list => {
      const copy = [...list];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = { ...last, ...(typeof patch === 'function' ? patch(last) : patch) };
      return copy;
    });
  }

  private persist() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages().filter(m => !m.pending))); } catch { /* storage unavailable */ }
  }
  private restore(): ChatMessage[] {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
  }
}
