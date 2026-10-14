import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { UiService } from '../core/ui.service';
import { ChatService } from './chat.service';

interface Seg { text: string; bold: boolean; }
interface Block { list: boolean; items: Seg[][]; }

const SUGGESTIONS = [
  'Is parking free?',
  'What are the house rules?',
  'Are pets allowed?',
  'How much for 3 nights?',
  'What do guests say about it?',
  'Best beaches near Candolim?',
];

/** Tiny, safe markdown: paragraphs, "- " bullets and **bold** (rendered via Angular bindings, never innerHTML). */
function parse(text: string): Block[] {
  const inline = (s: string): Seg[] => s.split(/\*\*(.+?)\*\*/g).map((t, i) => ({ text: t, bold: i % 2 === 1 })).filter(s => s.text);
  const blocks: Block[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.list) last.items.push(inline(bullet[1]));
      else blocks.push({ list: true, items: [inline(bullet[1])] });
    } else blocks.push({ list: false, items: [inline(line.trim())] });
  }
  return blocks;
}

@Component({
  selector: 'app-chat',
  template: `
@if (!ui.tourOpen()) {
  <button class="fab" [class.open]="chat.open()" (click)="chat.toggle()" [attr.aria-label]="chat.open() ? 'Close chat' : 'Ask a question about this stay'" [attr.aria-expanded]="chat.open()">
    @if (chat.open()) {
      <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3 3 13"/></svg>
    } @else {
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10h.01M12 10h.01M15.5 10h.01" stroke-width="2.6"/></svg>
    }
  </button>
}

@if (chat.open() && !ui.tourOpen()) {
  <section class="panel" role="dialog" aria-label="Ask about this stay" animate.enter="enter-rise" animate.leave="leave-sink">
    <header>
      <span class="bot"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg></span>
      <div class="titles"><b>Ask about this stay</b><span>Answers from this listing, plus Goa travel tips</span></div>
      <button class="hbtn" (click)="chat.reset()" [disabled]="!chat.messages().length" aria-label="Start a new chat" title="New chat">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.8-4.1M13.5 2.5v3h-3"/></svg>
      </button>
      <button class="hbtn" (click)="chat.close()" aria-label="Close chat" title="Close">
        <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="#222" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3 3 13"/></svg>
      </button>
    </header>

    <div class="body" #body aria-live="polite">
      @if (!chat.messages().length) {
        <div class="welcome" animate.enter="enter-rise">
          <p><b>Hi! 👋</b> I can answer questions about this apartment — amenities, rules, price, reviews, the host — and share tips for Candolim &amp; Goa.</p>
          <div class="chips">
            @for (s of suggestions; track s) { <button (click)="ask(s)">{{ s }}</button> }
          </div>
        </div>
      }
      @for (m of chat.messages(); track $index) {
        <div class="msg" [class.user]="m.role === 'user'" [class.err]="m.error" animate.enter="enter-rise">
          @if (m.pending && !m.content) {
            <span class="dots"><i></i><i></i><i></i></span>
          } @else {
            @for (b of blocks(m.content); track $index) {
              @if (b.list) {
                <ul>@for (item of b.items; track $index) { <li>@for (s of item; track $index) { @if (s.bold) { <b>{{ s.text }}</b> } @else { {{ s.text }} } }</li> }</ul>
              } @else {
                <p>@for (s of b.items[0]; track $index) { @if (s.bold) { <b>{{ s.text }}</b> } @else { {{ s.text }} } }</p>
              }
            }
          }
          @if (m.role === 'assistant' && !m.pending && !m.error) {
            @if (m.mode === 'retrieval') { <small class="note">These are the best-matching facts from the listing page.</small> }
            @else if (sources(m).length) { <small class="src">Based on: {{ sources(m).join(' · ') }}</small> }
          }
        </div>
      }
    </div>

    <form (submit)="submit($event)">
      <textarea #input rows="1" maxlength="600" placeholder="Ask anything about this stay…" aria-label="Your question"
        [value]="draft" (input)="draft = $any($event.target).value; grow()" (keydown.enter)="enter($event)"></textarea>
      <button type="submit" class="send" [disabled]="busy() || !draft.trim()" aria-label="Send">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>
      </button>
    </form>
    <p class="foot">AI can make mistakes — confirm important details with the host.</p>
  </section>
}`,
  styles: [`
    :host{font-family:inherit}
    .fab{position:fixed;right:24px;bottom:24px;z-index:80;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;
      background:linear-gradient(135deg,#ff385c,#d70466);box-shadow:0 6px 20px rgba(215,4,102,.4);transition:transform .2s ease,box-shadow .2s ease}
    .fab:hover{transform:scale(1.06);box-shadow:0 8px 26px rgba(215,4,102,.5)}
    .panel{position:fixed;right:24px;bottom:96px;z-index:85;width:384px;max-width:calc(100vw - 32px);height:min(560px,calc(100vh - 128px));
      display:flex;flex-direction:column;background:#fff;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.24);overflow:hidden;border:1px solid #eee}
    header{display:flex;align-items:center;gap:10px;padding:14px 12px 14px 16px;border-bottom:1px solid #eee;flex:none}
    .bot{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ff385c,#d70466);display:grid;place-items:center;flex:none}
    .titles{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}
    .titles b{font-size:15px;font-weight:600}.titles span{font-size:12px;color:#6a6a6a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hbtn{width:32px;height:32px;border-radius:50%;display:grid;place-items:center}.hbtn:hover:not(:disabled){background:#f2f2f2}.hbtn:disabled{opacity:.35;cursor:default}
    .body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    .welcome p{background:#f7f7f7;padding:12px 14px;border-radius:14px;font-size:14px;line-height:1.5;margin-bottom:12px}
    .chips{display:flex;flex-wrap:wrap;gap:8px}
    .chips button{border:1px solid #ddd;border-radius:18px;padding:7px 12px;font-size:13px;background:#fff;transition:border-color .15s,background .15s}
    .chips button:hover{border-color:#222;background:#f7f7f7}
    .msg{max-width:88%;align-self:flex-start;background:#f2f2f2;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:14px;line-height:1.5;word-wrap:break-word}
    .msg.user{align-self:flex-end;background:linear-gradient(135deg,#e61e4d,#d70466);color:#fff;border-radius:16px 16px 4px 16px}
    .msg.err{background:#fdecef;color:#a3173c}
    .msg p+p,.msg p+ul,.msg ul+p{margin-top:6px}
    .msg ul{padding-left:18px}.msg li{margin:2px 0}
    .src,.note{display:block;margin-top:8px;font-size:11.5px;color:#6a6a6a;line-height:1.4}
    .note{font-style:italic}
    .dots{display:inline-flex;gap:4px;padding:4px 0}
    .dots i{width:7px;height:7px;border-radius:50%;background:#9a9a9a;animation:blink 1.2s infinite ease-in-out}
    .dots i:nth-child(2){animation-delay:.18s}.dots i:nth-child(3){animation-delay:.36s}
    @keyframes blink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
    form{display:flex;align-items:flex-end;gap:8px;padding:10px 12px 6px;border-top:1px solid #eee;flex:none}
    textarea{flex:1;resize:none;border:1px solid #ccc;border-radius:20px;padding:10px 14px;font:inherit;font-size:14px;line-height:1.4;max-height:96px;outline:none}
    textarea:focus{border-color:#222}
    .send{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#e61e4d,#d70466);display:grid;place-items:center;flex:none}
    .send:disabled{opacity:.4;cursor:default}
    .foot{font-size:11px;color:#8a8a8a;text-align:center;padding:0 12px 10px}
    @media (max-width:480px){.panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;border-radius:0}.fab.open{display:none}}
  `],
})
export class ChatWidget {
  chat = inject(ChatService);
  ui = inject(UiService);
  suggestions = SUGGESTIONS;
  draft = '';
  busy = this.chat.busy;

  private body = viewChild<ElementRef<HTMLElement>>('body');
  private input = viewChild<ElementRef<HTMLTextAreaElement>>('input');
  private cache = new Map<string, Block[]>();

  constructor() {
    // keep the newest message in view while it streams in
    effect(() => {
      this.chat.messages();
      queueMicrotask(() => { const el = this.body()?.nativeElement; if (el) el.scrollTop = el.scrollHeight; });
    });
    // focus the box when the panel opens
    effect(() => { if (this.chat.open()) setTimeout(() => this.input()?.nativeElement.focus(), 60); });
  }

  blocks(text: string): Block[] {
    let b = this.cache.get(text);
    if (!b) { b = parse(text); if (this.cache.size > 300) this.cache.clear(); this.cache.set(text, b); }
    return b;
  }
  sources(m: { sources?: { title: string }[] }): string[] {
    return [...new Set((m.sources ?? []).map(s => s.title))].slice(0, 3);
  }

  ask(text: string) { this.chat.send(text); }
  submit(e: Event) { e.preventDefault(); this.send(); }
  enter(e: Event) { if (!(e as KeyboardEvent).shiftKey) { e.preventDefault(); this.send(); } }
  grow() { const t = this.input()?.nativeElement; if (t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 96) + 'px'; } }

  private send() {
    const text = this.draft.trim();
    if (!text || this.chat.busy()) return;
    this.draft = '';
    const t = this.input()?.nativeElement; if (t) { t.value = ''; t.style.height = 'auto'; }
    this.chat.send(text);
  }
}
