import { isDev, notesEnabled } from './env.js';
import { buildSequence } from './model.js';
import { renderEntry } from './render.js';
import { createStage } from './stage.js';

const host = document.getElementById('deck');
// Inside the site's presentation window the window supplies the way out.
if (window.self !== window.top) host.classList.add('embedded');

async function boot() {
  const root = new URL(host.dataset.root, location.href);
  const res = await fetch(new URL(`content/${host.dataset.deck}.json`, root));
  if (!res.ok) throw new Error(`Could not load the deck (${res.status}).`);
  const deck = await res.json();
  const ctx = { root, deck, isDev, notesEnabled };
  const seq = buildSequence(deck);
  const slides = seq.map((entry) => renderEntry(entry, ctx));
  createStage({ host, seq, slides, ctx });
}

boot().catch((err) => {
  console.error(err);
  const local = location.protocol === 'file:';
  host.textContent = local
    ? 'This deck cannot load from a file. Open the site with Live Server instead.'
    : 'The deck could not be loaded. Please try again.';
  host.classList.add('deck-error');
});
