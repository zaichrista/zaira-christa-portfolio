import { h } from './dom.js';
import { labelFor } from './render.js';

export function createStage({ host, seq, slides, ctx }) {
  const total = seq.length;
  let cur = -1;

  const stage = h('div', { class: 'stage' }, ...slides);
  const status = h('p', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
  const counter = h('span', { class: 'counter' });
  const fill = h('span', { class: 'fill' });
  const ticks = seq.map((e, i) => (e.kind === 'title' ? h('span', { class: 'tick', style: `left:${(i / (total - 1)) * 100}%` }) : null));
  const progress = h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Progress through the deck', 'aria-valuemin': '1', 'aria-valuemax': String(total) }, fill, ...ticks);

  const btn = (label, text, onclick, extra) => h('button', { type: 'button', class: 'btn', 'aria-label': label, title: label, onclick, ...extra }, text);
  const prev = btn('Previous slide', '←', () => step(-1));
  const next = btn('Next slide', '→', () => step(1));

  const notesBody = h('div', { class: 'notes-body' });
  const notesHead = h('p', { class: 'notes-head' });
  const notes = h('aside', { class: 'notes', hidden: true, 'aria-label': 'Speaker notes' }, notesHead, notesBody);
  let notesBtn = null;
  if (ctx.notesEnabled) {
    notesBtn = btn('Speaker notes (N)', 'Notes', toggleNotes, { 'aria-pressed': 'false', class: 'btn btn-text' });
  }
  const fsBtn = document.fullscreenEnabled
    ? btn('Full screen (F)', 'Full screen', toggleFullscreen, { class: 'btn btn-text btn-fs' })
    : null;

  const chrome = h('div', { class: 'chrome' },
    h('a', { class: 'chrome-home', href: ctx.root.href }, 'Zaira Christa'),
    h('div', { class: 'chrome-nav' }, prev, counter, next),
    progress,
    h('div', { class: 'chrome-tools' }, notesBtn, fsBtn));

  host.replaceChildren(h('div', { class: 'stage-wrap' }, stage, notes), chrome, status);

  function indexOfId(id) { return seq.findIndex((e) => e.id === id); }

  function go(i, { writeHash = true } = {}) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur) return;
    cur = i;
    slides.forEach((el, k) => {
      const on = k === i;
      el.classList.toggle('is-current', on);
      if (on) { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
      else { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
    });
    const e = seq[i];
    counter.textContent = `${i + 1} / ${total}`;
    fill.style.transform = `scaleX(${total > 1 ? i / (total - 1) : 1})`;
    progress.setAttribute('aria-valuenow', String(i + 1));
    progress.setAttribute('aria-valuetext', labelFor(e, i, total));
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    status.textContent = labelFor(e, i, total);
    const where = e.project ? e.project.name : e.kind === 'work' ? 'Selected work' : e.kind === 'closing' ? 'Closing' : null;
    document.title = [where, ctx.deck.title, 'Zaira Christa'].filter(Boolean).join(' | ');
    notesHead.textContent = labelFor(e, i, total);
    notesBody.textContent = e.notes || 'No notes for this slide.';
    if (writeHash) history.replaceState(null, '', `${location.pathname}${location.search}#${e.id}`);
  }
  function step(d) { go(cur + d); }

  function toggleNotes() {
    if (!ctx.notesEnabled) return;
    const show = notes.hidden;
    notes.hidden = !show;
    if (notesBtn) notesBtn.setAttribute('aria-pressed', String(show));
  }
  function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else host.requestFullscreen().catch(() => {});
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const tag = ev.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    switch (ev.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': step(1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': step(-1); break;
      case ' ': if (tag === 'BUTTON' || tag === 'A') return; step(ev.shiftKey ? -1 : 1); break;
      case 'Home': go(0); break;
      case 'End': go(total - 1); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': if (!notes.hidden) toggleNotes(); else return; break;
      default: return;
    }
    ev.preventDefault();
  });

  // Swipe: touch and pen only, mostly sideways.
  let sx = 0, sy = 0, tracking = false;
  stage.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse') return;
    tracking = true; sx = ev.clientX; sy = ev.clientY;
  });
  stage.addEventListener('pointerup', (ev) => {
    if (!tracking) return;
    tracking = false;
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { tracking = false; });

  window.addEventListener('hashchange', () => {
    const i = indexOfId(decodeURIComponent(location.hash.slice(1)));
    if (i >= 0) go(i, { writeHash: false });
  });

  // Print every slide, with every picture loaded.
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });

  const start = indexOfId(decodeURIComponent(location.hash.slice(1)));
  go(start >= 0 ? start : 0, { writeHash: start >= 0 });
}
