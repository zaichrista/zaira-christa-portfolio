import { h } from './dom.js';

const SITE_NAME = 'Zaira Christa';

// Which layout family each slide type uses (see css/deck.css).
const FAMILY = {
  question: 'statement', insight: 'statement', interpretation: 'statement',
  world: 'split', reference: 'split', observation: 'split', strategy: 'split', implication: 'split',
  client: 'split', direction: 'split', 'system-structure': 'split', 'system-components': 'split',
  fieldwork: 'led', expression: 'led', obsession: 'led', 'language-references': 'led',
  'language-material': 'led', body: 'led', making: 'led', lineup: 'led', runway: 'led',
  experience: 'led', problem: 'led',
  tension: 'bleed', hero: 'bleed',
  idea: 'idea', outcome: 'outcome',
};
// Pictures that must be shown whole, not cropped.
const CONTAIN = new Set(['lineup', 'experience', 'strategy', 'system-structure', 'system-components', 'problem']);

const tbs = (ctx) => (ctx.isDev ? h('span', { class: 'tbs' }, 'To be supplied') : null);
const folio = (text) => h('span', { class: 'folio', 'aria-hidden': 'true' }, text);

function placeholder(image, ctx, missing) {
  const brief = image.brief || image.alt || '';
  return h('figure', { class: 'fig ph', role: 'img', 'aria-label': `Placeholder. ${brief}` },
    h('span', { class: 'ph-tag' }, missing ? 'Image file not found' : 'Image needed'),
    h('p', { class: 'ph-brief' }, brief),
    ctx.isDev ? h('p', { class: 'ph-src' }, image.src) : null);
}

function figure(image, ctx, { contain, drift } = {}) {
  if (!image) return null;
  let fig;
  if (image.status === 'have') {
    const img = h('img', {
      src: new URL(image.src, ctx.root).href, alt: image.alt || '', decoding: 'async', loading: 'lazy',
    });
    fig = h('figure', { class: 'fig' }, img);
    // A file that fails to load becomes a marked placeholder, never a broken image.
    img.addEventListener('error', () => fig.replaceWith(decorate(placeholder(image, ctx, true))), { once: true });
  } else {
    fig = placeholder(image, ctx, false);
  }
  return decorate(fig);

  function decorate(el) {
    if (contain) el.classList.add('contain');
    if (drift) el.classList.add('drift');
    return el;
  }
}

function frameOf(cls, ...kids) {
  return h('div', { class: `frame ${cls || ''}`.trim() }, ...kids);
}

function reveal(nodes) {
  let i = 0;
  for (const n of nodes) {
    if (!n) continue;
    n.setAttribute('data-r', '');
    n.style.setProperty('--i', i++);
  }
  return nodes;
}

function section(entry, ctx, family, type, label, ...kids) {
  return h('section', {
    class: `slide kind-${entry.kind} fam-${family}${type ? ' t-' + type : ''}`,
    'data-id': entry.id,
    role: 'group',
    'aria-roledescription': 'slide',
    'aria-label': label,
  }, ...kids);
}

function cover(entry, ctx) {
  const { deck } = ctx;
  const copy = h('div', { class: 'copy' }, ...reveal([
    h('h1', { class: 'cover-title' }, deck.title),
    deck.practiceStatement ? h('p', { class: 'cover-statement' }, deck.practiceStatement) : null,
  ]));
  return section(entry, ctx, 'cover', null, 'Cover', frameOf('', copy), folio(SITE_NAME));
}

function work(entry, ctx) {
  const { deck } = ctx;
  const tiles = deck.projects.map((p, i) => h('a', { class: 'tile', href: `#${p.id}` },
    h('span', { class: 'tile-n', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
    h('span', { class: 'tile-name' }, p.name),
    p.oneLineOutcome ? h('span', { class: 'tile-out' }, p.oneLineOutcome) : tbs(ctx)));
  const grid = h('div', { class: 'work-grid', style: `--n:${tiles.length}` }, ...tiles);
  const copy = h('div', { class: 'copy' }, ...reveal([h('h2', { class: 'work-label' }, 'Selected work'), grid]));
  return section(entry, ctx, 'work', null, 'Selected work', frameOf('', copy), folio(deck.title));
}

function titleCard(entry, ctx) {
  const p = entry.project;
  const copy = h('div', { class: 'copy' }, ...reveal([
    h('h2', { class: 'pt-name' }, p.name),
    p.subtitle ? h('p', { class: 'pt-sub' }, p.subtitle) : null,
    h('p', { class: 'pt-disc' }, p.disciplines),
    h('p', { class: 'pt-context' }, p.context),
  ]));
  return section(entry, ctx, 'titlecard', null, `${p.name}, title`, frameOf('', copy), folio(ctx.deck.title));
}

function closing(entry, ctx) {
  const f = (ctx.deck.closing && ctx.deck.closing.fields) || {};
  const rows = [['Bio', f.bio], ['Looking for', f.lookingFor], ['Contact', f.contact]];
  const items = [];
  for (const [label, value] of rows) {
    if (!value && !ctx.isDev) continue;
    let content;
    if (!value) content = tbs(ctx);
    else if (typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value)) content = h('a', { href: `mailto:${value}` }, value);
    else content = value;
    items.push(h('div', { class: 'cl-row' }, h('dt', null, label), h('dd', null, content)));
  }
  if (f.siteLink) {
    items.push(h('div', { class: 'cl-row' }, h('dt', null, 'Site'),
      h('dd', null, h('a', { href: f.siteLink }, f.siteLink.replace(/^https?:\/\//, '')))));
  }
  const copy = h('div', { class: 'copy' }, ...reveal([h('dl', { class: 'cl' }, ...items)]));
  return section(entry, ctx, 'closing', null, 'Closing', frameOf('', copy), folio(SITE_NAME));
}

function slide(entry, ctx) {
  const s = entry.slide, p = entry.project;
  const family = FAMILY[s.type] || 'split';
  if (!FAMILY[s.type]) console.warn('Unknown slide type, using split layout:', s.type);

  const media = figure(s.image, ctx, {
    contain: CONTAIN.has(s.type),
    drift: family === 'bleed' || ['expression', 'fieldwork', 'runway', 'obsession', 'making', 'body'].includes(s.type),
  });
  const mediaWrap = media ? h('div', { class: 'media' }, media) : null;

  const bits = reveal([
    s.title ? h('h2', { class: 'title' }, s.title) : null,
    s.text ? h('p', { class: 'text' }, s.text) : null,
    s.bullets && s.bullets.length ? h('ul', { class: 'bullets' }, s.bullets.map((b) => h('li', null, b))) : null,
    s.quote ? h('p', { class: 'quote' }, s.quote) : null,
    s.type === 'experience' && p.url
      ? h('a', { class: 'url', href: p.url, target: '_blank', rel: 'noopener' }, p.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))
      : null,
    s.link ? h('a', { class: 'applied', href: `../${s.link.deck}/#${s.link.project}` }, 'see how it was applied') : null,
  ]).filter(Boolean);
  const copy = bits.length ? h('div', { class: 'copy' }, ...bits) : null;

  const cls = [];
  if (!media) cls.push('no-media');
  if (s.type === 'idea' && !s.title) cls.push('no-title');
  if (entry.pi % 2 === 1 || s.n % 2 === 1) cls.push('flip');
  const el = section(entry, ctx, family, s.type, `${p.name}, slide ${s.n + 1}`,
    frameOf(cls.join(' '), mediaWrap, copy), folio(p.name), s.status === 'needs-input' ? tbs(ctx) : null);
  return el;
}

export function renderEntry(entry, ctx) {
  switch (entry.kind) {
    case 'cover': return cover(entry, ctx);
    case 'work': return work(entry, ctx);
    case 'title': return titleCard(entry, ctx);
    case 'closing': return closing(entry, ctx);
    default: return slide(entry, ctx);
  }
}

export function labelFor(entry, i, total) {
  const where = `${i + 1} of ${total}`;
  if (entry.kind === 'cover') return `Cover, ${where}`;
  if (entry.kind === 'work') return `Selected work, ${where}`;
  if (entry.kind === 'closing') return `Closing, ${where}`;
  return `${entry.project.name}, ${where}`;
}
