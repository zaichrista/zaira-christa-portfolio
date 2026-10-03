const pick = a => a[Math.floor(Math.random()*a.length)];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function shuffled(n){
  const a = Array.from({length:n}, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- stretched headings: the transform doesn't move the layout, so add the missing height back
function fixStretch(){
  document.querySelectorAll(".stretch").forEach(el => {
    const k = parseFloat(getComputedStyle(el).getPropertyValue("--k")) || 1.4;
    el.style.marginBottom = (el.offsetHeight * (k - 1)) + "px";
  });
}
window.addEventListener("resize", fixStretch);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fixStretch);
if ("ResizeObserver" in window){
  const ro = new ResizeObserver(fixStretch);
  document.querySelectorAll(".stretch").forEach(el => ro.observe(el));
}

// ---- hero name: Times New Roman, stretched. Each letter is its own box.
const hero = document.getElementById("hero");
const letters = [];
["Zaira","Christa"].forEach(w => {
  const word = document.createElement("div");
  word.className = "word";
  [...w].forEach(ch => {
    const s = document.createElement("span");
    s.className = "l";
    s.dataset.ch = ch;
    s.setAttribute("aria-hidden","true");
    const t = document.createElement("span");
    t.className = "t"; t.textContent = ch;
    s.appendChild(t);
    word.appendChild(s); letters.push(s);
  });
  hero.appendChild(word);
});
// ---- squish me: drag a letter to stretch or squish it. It stays that way, even after the visitor leaves.
const SY0 = 1.7, SQUISH_KEY = "zc-squish";
const squishNote = document.querySelector(".squish");
let squished = false;
const squish = letters.map(() => ({sx:1, sy:SY0}));
try {
  const saved = JSON.parse(localStorage.getItem(SQUISH_KEY));
  if (Array.isArray(saved) && saved.length === letters.length){
    saved.forEach((v, i) => { if (v && isFinite(v.sx) && isFinite(v.sy)) squish[i] = {sx:+v.sx, sy:+v.sy}; });
  }
} catch(e) {}
const isSquished = () => squish.some(v => v.sx !== 1 || v.sy !== SY0);
function saveSquish(){
  squished = isSquished();
  try {
    if (squished) localStorage.setItem(SQUISH_KEY, JSON.stringify(squish));
    else localStorage.removeItem(SQUISH_KEY);
  } catch(e) {}
}
function applySquish(i){
  const t = letters[i].querySelector(".t");
  t.style.setProperty("--sx", squish[i].sx);
  t.style.setProperty("--sy", squish[i].sy);
}
letters.forEach((l, i) => {
  let drag = null;
  applySquish(i);
  l.addEventListener("pointerdown", e => {
    drag = {x:e.clientX, y:e.clientY, sx:squish[i].sx, sy:squish[i].sy};
    l.setPointerCapture(e.pointerId);
    l.classList.add("grabbed");
    squished = true;                 // they found it: no more shimmying
    e.preventDefault();
  });
  l.addEventListener("pointermove", e => {
    if (!drag) return;
    squish[i].sx = Math.min(3.5, Math.max(.25, drag.sx + (e.clientX - drag.x) / 110));
    squish[i].sy = Math.min(4, Math.max(.2, drag.sy + (drag.y - e.clientY) / 70));
    applySquish(i);
  });
  const end = () => { if (!drag) return; drag = null; l.classList.remove("grabbed"); saveSquish(); };
  l.addEventListener("pointerup", end);
  l.addEventListener("pointercancel", end);
  l.addEventListener("dblclick", () => { squish[i] = {sx:1, sy:SY0}; applySquish(i); saveSquish(); });
});
document.getElementById("resetSquish").addEventListener("click", () => {
  letters.forEach((l, i) => { squish[i] = {sx:1, sy:SY0}; applySquish(i); });
  saveSquish();
});
// if nobody has squished anything a moment after the page opens, the note shimmies, until they do
squished = isSquished();
function shimmy(){
  if (squished || !document.body.classList.contains("home")) return;
  squishNote.classList.remove("shimmy");
  void squishNote.offsetWidth;
  squishNote.classList.add("shimmy");
}
if (!reduced && !squished){
  setTimeout(() => { shimmy(); setInterval(shimmy, 4500); }, 1300);
}

// =====================================================
//  WORK: the presentations
// =====================================================
const DECKS = {
  logos:{
    file:"Logos_FINAL_v7_ACTUAL_FINAL.pptx", title:"Logos", sub:"and, by extension, posters",
    agenda:["Logos","Posters","Why kerning matters (it does)"],
    pages:[
      {t:"Logos", b:["A mark that looks simple","Took a week, as is traditional","The grid was involved"]},
      {t:"Posters", b:["Loud, on purpose","Hierarchy, but with volume","Framed, and not once regretted"]},
      {t:"Kerning", b:["Space between letters is a decision","Nobody notices, which is the point","I notice"]}
    ],
    take:["Simple is the hard part","Kerning is a love language","Everything else is a rectangle"]
  },
  fashion:{
    file:"Fashion_Design_copy_copy_2.pptx", title:"Fashion Design", sub:"a label, two runway shows, and many pins",
    agenda:["The label","Two runway shows","Hems (a cautionary tale)"],
    pages:[
      {t:"The label", b:["My name, on the inside of things","Cut, draped, argued with","Worn by people with taste"]},
      {t:"Two runway shows", b:["Two shows, zero fainting","The lighting was a character","Backstage is a contact sport"]},
      {t:"Hems", b:["Never rush a hem","Pins are a hazard with dignity","Lessons were learned, mostly by me"]}
    ],
    take:["Fabric has opinions","Fit is a form of respect","Hems are forever"]
  },
  strategy:{
    file:"Creative_Strategy_v12_USE_THIS_ONE.pptx", title:"Creative Strategy", sub:"taste, with footnotes",
    agenda:["Brand strategy","A hospitality concept","The financial plan (yes, really)"],
    pages:[
      {t:"Brand strategy", b:["Who it is, and who it is for","Why anyone should care","Taste, with footnotes"]},
      {t:"A hospitality concept", b:["A restaurant, as a feeling","Concept, room, menu, mood","Invented from nothing"]},
      {t:"The financial plan", b:["Yes, really","Spreadsheets, but romantic","Confidential until someone hires me"]}
    ],
    take:["Strategy is taste with evidence","A brand is a promise with a typeface","The spreadsheet is also a love letter"]
  },
  research:{
    file:"Research_(please_read).pptx", title:"Research", sub:"theory, but make it useful",
    agenda:["Fashion, nightlife and the body","Theory you can actually use","Why this is also a business skill"],
    pages:[
      {t:"Fashion, nightlife, the body", b:["Where dress, sound and memory meet","Fieldwork, mostly after midnight","Footnotes, mostly after that"]},
      {t:"Theory you can use", b:["Concepts that do a job","Analysis, not decoration","If it cannot be applied, it is poetry"]},
      {t:"A business skill, secretly", b:["Culture is a market with feelings","Insight costs less than guessing","Hire the person who did the reading"]}
    ],
    take:["Culture explains the customer","Theory is a tool","Footnotes are a flex"]
  },
  websites:{
    file:"Websites_FINAL_I_MEAN_IT.pptx", title:"Websites", sub:"attempt five (this one)",
    agenda:["The ones before this one","This one","Why I stopped at five"],
    pages:[
      {t:"Attempts one to four", b:["Four websites, none of them me","Fine, but not me","Retired with honours"]},
      {t:"Attempt five", b:["You are standing in it","Stretched Times New Roman, on purpose","Nothing in nature is a rectangle"]},
      {t:"Why I stopped", b:["It finally sounds like me","It looks like I did not try","I tried so hard"]}
    ],
    take:["Fifth time lucky","Typography is personality","Final. I mean it."]
  }
};

const TRANS = [
  {c:"t-dissolve", n:"Dissolve"},
  {c:"t-spin",     n:"Newsflash"},
  {c:"t-vortex",   n:"Vortex"},
  {c:"t-wipe",     n:"Wipe"},
  {c:"t-iris",     n:"Iris"},
  {c:"t-fly",      n:"Fly In (Bouncy)"},
  {c:"t-zoom",     n:"Zoom (Unnecessary)"},
  {c:"t-flip",     n:"Flip"},
  {c:"t-diamond",  n:"Diamond"},
  {c:"t-split",    n:"Split"},
  {c:"t-blinds",   n:"Blinds"}
];

function buildSlides(d){
  const out = [];
  out.push({label:d.title, dark:true, k:"title",
    html:`<h2>${d.title}</h2><p class="sub">${d.sub}</p><p class="by">A presentation by Zaira Christa</p>`});
  out.push({label:"Agenda", k:"agenda",
    html:`<h3>Agenda</h3><ul>${d.agenda.map(a => `<li>${a}</li>`).join("")}</ul>`});
  d.pages.forEach(p => out.push({label:p.t, k:"content",
    html:`<h3>${p.t}</h3><div class="grid"><div class="ph">[ Insert image here ]</div><ul>${p.b.map(x => `<li>${x}</li>`).join("")}</ul></div>`}));
  out.push({label:"Key takeaways", k:"take",
    html:`<h3>Key takeaways</h3><ol>${d.take.map(x => `<li>${x}</li>`).join("")}</ol>`});
  out.push({label:"Thank you!", dark:true, k:"thanks",
    html:`<h2>Thank you!</h2><p class="sub">Any questions?</p><p class="by">(Please hire me.)</p>`});
  out.forEach((s, i) => {
    s.html += `<div class="ft"><span>Zaira Christa &middot; Confidential (not really)</span><span>${i + 1}</span></div>`;
  });
  return out;
}

// =====================================================
//  WINDOWS: movable, resizable, stackable
// =====================================================
const headerEl = document.querySelector("header");
let zTop = 20;
function raise(el){ el.style.zIndex = ++zTop; }
function clampWin(el){
  const w = el.offsetWidth;
  const x = Math.min(Math.max(el.offsetLeft, 120 - w), innerWidth - 120);
  const y = Math.min(Math.max(el.offsetTop, headerEl.offsetHeight), innerHeight - 44);
  el.style.left = x + "px"; el.style.top = y + "px";
}
function makeWindow(el){
  const bar = el.querySelector(".tbar");
  el.addEventListener("pointerdown", () => raise(el), true);
  bar.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    const ox = e.clientX - el.offsetLeft, oy = e.clientY - el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    const move = ev => { el.style.left = (ev.clientX - ox) + "px"; el.style.top = (ev.clientY - oy) + "px"; clampWin(el); };
    const up = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    e.preventDefault();
  });
}
// closing a window: it just disappears. The dock's Finder icon brings the Finder back.
const sadEl = document.getElementById("sad");
let sadT1 = null, sadT2 = null;
function sadHide(){ clearTimeout(sadT1); clearTimeout(sadT2); sadEl.classList.remove("on"); }
function sadStart(){   // the little guilt trip after you close something
  sadHide();
  sadEl.textContent = "you don't want to see my work?";
  sadEl.classList.add("on");
  sadT1 = setTimeout(() => sadEl.classList.remove("on"), 4000);
}
function restoreWin(el){
  sadHide();
  el.classList.remove("closed");
  raise(el);
  el.focus();
}
window.addEventListener("resize", () =>
  document.querySelectorAll(".win").forEach(w => { if (w.offsetWidth) clampWin(w); })
);

// ---- the Finder window
const finderEl = document.getElementById("finder");
makeWindow(finderEl);
finderEl.querySelector(".wclose").addEventListener("click", () => { finderEl.classList.add("closed"); sadStart(); });
let finderPlaced = false;
function placeFinder(){
  if (finderPlaced) return;
  finderPlaced = true;
  const hh = headerEl.offsetHeight;
  const w = Math.min(1100, innerWidth - 40), h = Math.min(620, innerHeight - hh - 160);
  finderEl.style.width = w + "px";
  finderEl.style.height = Math.max(240, h) + "px";
  finderEl.style.left = (innerWidth - w) / 2 + "px";
  finderEl.style.top = (hh + 12) + "px";
}

// ---- the "presentations": each file opens its own window, and all five can be open at once
const openDecks = {};
let cascade = 0;
function openDeck(id, btnEl){
  const d = DECKS[id]; if (!d) return;
  if (openDecks[id]){ restoreWin(openDecks[id].el); return; }
  const ri = recent.indexOf(id);
  if (ri >= 0) recent.splice(ri, 1);
  recent.unshift(id);
  if (loc === "recents") showLoc("recents");

  const slides = buildSlides(d);
  let cur = -1, tBag = [], tName = "none yet", tmr = null;

  const el = document.createElement("div");
  el.className = "win ppt"; el.tabIndex = -1;
  el.setAttribute("role","dialog"); el.setAttribute("aria-label", d.file);
  el.innerHTML = `
    <div class="tbar"><div class="dots"><button type="button" class="pclose" aria-label="Close presentation"></button><i></i><i></i></div><div class="ttl"></div></div>
    <div class="tools"><button class="btn pprev" type="button">&larr; Back</button><button class="btn pnext" type="button">Next &rarr;</button><span class="stat"></span></div>
    <div class="pbody"><div class="thumbs"></div><div class="pasteboard"><div class="slidebox"></div></div></div>`;
  const $ = s => el.querySelector(s);
  const stage = $(".slidebox"), thumbsEl = $(".thumbs"), pStat = $(".stat"), pPrev = $(".pprev"), pNext = $(".pnext");
  $(".ttl").textContent = d.file;

  function nextTrans(){
    if (!tBag.length) tBag = shuffled(TRANS.length);
    return TRANS[tBag.pop()];
  }
  function makeSlide(i){
    const s = slides[i];
    const sl = document.createElement("div");
    sl.className = "slide " + s.k + (s.dark ? " dark" : "");
    sl.innerHTML = s.html;
    return sl;
  }
  function finish(){
    clearTimeout(tmr);
    const all = stage.querySelectorAll(".slide");
    all.forEach((sl, k) => { if (k < all.length - 1) sl.remove(); });
    const keep = stage.lastElementChild;
    if (keep){
      keep.classList.remove("in");
      TRANS.forEach(t => keep.classList.remove(t.c));
    }
  }
  function updateUI(){
    thumbsEl.querySelectorAll(".thumb").forEach((t, k) => t.classList.toggle("cur", k === cur));
    pStat.textContent = "Slide " + (cur + 1) + " of " + slides.length + " · Transition: " + tName;
    pPrev.disabled = cur <= 0;
    pNext.disabled = cur >= slides.length - 1;
  }
  function go(i){
    if (i < 0 || i >= slides.length || i === cur) return;
    finish();
    const incoming = makeSlide(i);
    incoming.classList.add("in");
    if (reduced){
      tName = "Cut";
    } else {
      const t = nextTrans();
      tName = t.n;
      incoming.classList.add(t.c);
    }
    stage.appendChild(incoming);
    cur = i;
    updateUI();
    tmr = setTimeout(finish, 850);
  }
  function close(){
    finish();
    el.remove();
    delete openDecks[id];
    if (btnEl && document.body.classList.contains("work")) btnEl.focus();
  }

  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "thumb" + (s.dark ? " dark" : "");
    b.innerHTML = `<span class="n">${i + 1}</span><span class="mini">${s.label}</span>`;
    b.addEventListener("click", () => go(i));
    thumbsEl.appendChild(b);
  });
  pNext.addEventListener("click", () => go(cur + 1));
  pPrev.addEventListener("click", () => go(cur - 1));
  $(".pclose").addEventListener("click", () => { close(); sadStart(); });
  stage.addEventListener("click", () => go(cur + 1));
  el.addEventListener("keydown", e => {
    if (e.key === "Escape"){ close(); sadStart(); }
    else if (["ArrowRight","ArrowDown","PageDown"].includes(e.key)){ e.preventDefault(); go(cur + 1); }
    else if (["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){ e.preventDefault(); go(cur - 1); }
    else if (e.key === "Home"){ e.preventDefault(); go(0); }
    else if (e.key === "End"){ e.preventDefault(); go(slides.length - 1); }
  });

  // cascade the windows so five of them don't land exactly on top of each other
  const hh = headerEl.offsetHeight, n = cascade++ % 6;
  const w = Math.min(960, innerWidth - 60), h = Math.max(260, Math.min(600, innerHeight - hh - 180));
  el.style.width = w + "px"; el.style.height = h + "px";
  el.style.left = Math.max(10, Math.min((innerWidth - w) / 2 + (n - 2) * 34, innerWidth - w - 10)) + "px";
  el.style.top = (hh + 10 + n * 30) + "px";

  document.body.appendChild(el);
  raise(el); makeWindow(el);
  stage.appendChild(makeSlide(0));
  cur = 0;
  updateUI();
  openDecks[id] = {el, close};
  el.focus();
}
function closeAllDecks(){ Object.values(openDecks).forEach(o => o.close()); }

// ---- the Finder behaves like Finder: click to select, double-click (or Enter) to open, arrow keys to move,
// the sidebar switches folder, and the sidebar stays put while the files scroll.
const fileEls = [...document.querySelectorAll(".file")];
const filesEl = document.getElementById("files");
const emptyEl = document.getElementById("filesEmpty");
const fstatEl = document.getElementById("fstat");
const finderTitle = finderEl.querySelector(".ttl");
const touchOnly = window.matchMedia("(hover:none)");
const recent = [];                 // deck ids, most recently opened first
const trashed = [];                // binned sticky notes: {el, label, colour}
let loc = "work";
const LOCS = {
  work:      {title:"Work",      note:"", stat:n => n + " items, all of them rectangles"},
  recents:   {title:"Recents",   note:"Nothing opened yet. Open something, I dare you.", stat:n => n + (n === 1 ? " item" : " items")},
  desktop:   {title:"Desktop",   note:"Nothing here. The mess is elsewhere.", stat:() => "0 items"},
  downloads: {title:"Downloads", note:"I said do not open.", stat:() => "0 items"},
  trash:     {title:"Trash",     note:"The Trash is empty.", stat:n => n + (n === 1 ? " item" : " items") + (n ? " (double-click to put back)" : "")}
};
const allFiles = () => [...filesEl.querySelectorAll(".file")];
const visibleFiles = () => allFiles().filter(f => !f.hidden);
function selectFile(f){
  allFiles().forEach(x => x.classList.toggle("sel", x === f));
  if (f) f.focus({preventScroll:false});
}
// open = a deck opens its presentation window; a trashed note goes back where it was
function openFile(b){ if (b._note) putBack(b._note); else openDeck(b.dataset.deck, b); }
function wireFile(b){
  // a mouse needs a double-click to open; a touch screen has no hover or double-click, so a tap opens
  b.addEventListener("click", e => {
    selectFile(b);
    if (e.detail === 0 || touchOnly.matches) openFile(b);   // detail 0 = Enter or Space
  });
  b.addEventListener("dblclick", () => openFile(b));
}
function showLoc(name){
  loc = name;
  filesEl.querySelectorAll(".file.note").forEach(n => n.remove());
  const ids = name === "work" ? fileEls.map(f => f.dataset.deck) : name === "recents" ? recent : [];
  fileEls.forEach(f => {
    const i = ids.indexOf(f.dataset.deck);
    f.hidden = i < 0;
    f.style.order = i < 0 ? "" : i;
  });
  if (name === "trash") trashed.forEach(t => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "file note"; b._note = t;
    const ico = document.createElement("span"); ico.className = "ico note-ico"; ico.style.background = t.colour;
    const nm = document.createElement("span"); nm.className = "name"; nm.textContent = t.label;
    b.append(ico, nm);
    wireFile(b);
    filesEl.appendChild(b);
  });
  const count = name === "trash" ? trashed.length : ids.length;
  selectFile(null);
  emptyEl.hidden = count > 0;
  emptyEl.textContent = LOCS[name].note;
  finderTitle.textContent = LOCS[name].title;
  fstatEl.textContent = LOCS[name].stat(count);
  filesEl.scrollTop = 0;
  finderEl.querySelectorAll(".side button").forEach(b => b.classList.toggle("on", b.dataset.loc === name));
}
finderEl.querySelectorAll(".side button").forEach(b => b.addEventListener("click", () => showLoc(b.dataset.loc)));

fileEls.forEach(wireFile);
filesEl.addEventListener("click", e => { if (e.target === filesEl || e.target === emptyEl) selectFile(null); });
filesEl.addEventListener("keydown", e => {
  const list = visibleFiles(), i = list.indexOf(document.activeElement);
  if (!list.length || !e.key.startsWith("Arrow")) return;
  const cols = list.filter(f => f.offsetTop === list[0].offsetTop).length || 1;
  const step = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-cols, ArrowDown:cols}[e.key];
  e.preventDefault();
  const next = i < 0 ? 0 : Math.min(list.length - 1, Math.max(0, i + step));
  selectFile(list[next]);
});

// =====================================================
//  NO SCROLLING, ANYWHERE
// =====================================================
const nopeEl = document.getElementById("nope");
const NOPES = [
  "Hey. You can't go down there.",
  "I said no.",
  "There is no down. This is the whole website.",
  "Use the menu, like an adult.",
  "Okay, now you're just scrolling for fun."
];
const SHAKE = [
  {transform:"translateX(0)"},
  {transform:"translateX(-4px)", offset:.1}, {transform:"translateX(7px)", offset:.2},
  {transform:"translateX(-11px)", offset:.3}, {transform:"translateX(11px)", offset:.4},
  {transform:"translateX(-11px)", offset:.5}, {transform:"translateX(11px)", offset:.6},
  {transform:"translateX(-11px)", offset:.7}, {transform:"translateX(7px)", offset:.8},
  {transform:"translateX(-4px)", offset:.9}, {transform:"translateX(0)"}
];
let nopeN = 0, nopeT = 0, nopeHide = null;
function nope(){
  const now = Date.now();
  if (now - nopeT < 900) return;
  nopeT = now;
  const msg = nopeN < NOPES.length ? NOPES[nopeN] : NOPES[NOPES.length - 1 - Math.floor(Math.random() * 2)];
  nopeN++;
  nopeEl.textContent = msg;
  nopeEl.classList.add("on");
  clearTimeout(nopeHide);
  nopeHide = setTimeout(() => nopeEl.classList.remove("on"), 1900);
  if (!reduced){
    // the Web Animations API leaves the pages' own CSS animations alone
    [document.querySelector(".page.active"), ...document.querySelectorAll(".win")]
      .forEach(t => t && t.animate(SHAKE, {duration:450}));
  }
}
const canNope = () => !document.body.classList.contains("substack") && !pageScrolls();
// one shake per scroll gesture, and only once the gesture is properly big.
// A gesture ends when the wheel has been quiet for a moment, which also swallows trackpad momentum.
const BIG_WHEEL = 800, BIG_TOUCH = 160;
let wheelSum = 0, wheelDone = false, wheelIdle = null;
window.addEventListener("wheel", e => {
  if (!canNope() || (e.target.closest && e.target.closest(".thumbs,.fbody,.sbody,textarea"))) return;
  clearTimeout(wheelIdle);
  wheelIdle = setTimeout(() => { wheelSum = 0; wheelDone = false; }, 400);
  if (e.deltaY <= 0 || wheelDone) return;
  wheelSum += e.deltaY;
  if (wheelSum >= BIG_WHEEL){ wheelDone = true; nope(); }
}, {passive:true});
let touchY = null, touchDone = false;
window.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; touchDone = false; }, {passive:true});
window.addEventListener("touchmove", e => {
  if (e.target.closest && e.target.closest(".l")) return;   // squishing a letter is not scrolling
  if (canNope() && !touchDone && touchY !== null && touchY - e.touches[0].clientY > BIG_TOUCH){
    touchDone = true; nope();
  }
}, {passive:true});
window.addEventListener("keydown", e => {
  if (!canNope()) return;
  if (!["ArrowDown","PageDown","End"," "].includes(e.key)) return;
  if (e.target.closest && e.target.closest("button,a,input,textarea,[contenteditable],.win")) return;
  e.preventDefault(); if (!e.repeat) nope();
});
document.getElementById("scrollcue").addEventListener("click", nope);

// =====================================================
//  HOME: the sun (it is not a light mode switch)
// =====================================================
const sunEl = document.getElementById("sun");
const songEl = document.getElementById("song");
const ytEl = document.getElementById("yt");
// Spotify's iFrame API lets us press play for the visitor. It is only loaded once cookies are
// accepted (see privacy.html), so Spotify never hears from a visitor who rejects cookies.
let spApi = null, spCtrl = null, spLoading = false;
window.onSpotifyIframeApiReady = api => {
  spApi = api;
  if (!songEl.hidden && !spCtrl) mountSpotify();   // the sun was clicked while the API was still loading
};
function loadSpotifyApi(){
  if (spLoading || !spotifyId(SONG_URL)) return;
  spLoading = true;
  const sc = document.createElement("script");
  sc.src = "https://open.spotify.com/embed/iframe-api/v1"; sc.async = true;
  sc.onerror = () => { if (!songEl.hidden && !spCtrl) plainSpotify(); };
  document.head.appendChild(sc);
}
function plainSpotify(){
  const f = document.createElement("iframe");
  f.src = "https://open.spotify.com/embed/track/" + spotifyId(SONG_URL);
  f.className = "spotify";
  f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  f.referrerPolicy = "strict-origin-when-cross-origin";
  f.title = "Not that kind of sun";
  ytEl.innerHTML = "";
  ytEl.appendChild(f);
}
function mountSpotify(){
  const slot = document.createElement("div");
  ytEl.innerHTML = "";
  ytEl.appendChild(slot);
  spApi.createController(slot, {uri:"spotify:track:" + spotifyId(SONG_URL), width:"100%", height:152}, ctrl => {
    if (songEl.hidden){ try { ctrl.destroy(); } catch(e) {} return; }   // closed before it finished loading
    spCtrl = ctrl;
    ctrl.addListener("ready", () => ctrl.play());
  });
}
function spotifyId(u){
  const m = (u || "").match(/spotify\.com\/(?:embed\/)?track\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}
function ytId(u){
  const m = (u || "").match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function openSong(){
  ytEl.innerHTML = "";
  const sp = spotifyId(SONG_URL), id = ytId(SONG_URL);
  if (sp){
    songEl.hidden = false;   // shown first, so the click that opened it still counts when the player mounts
    if (spApi) mountSpotify();
    else {
      loadSpotifyApi();
      // if Spotify's script is blocked or slow, still show a plain player so the sun always leads somewhere
      setTimeout(() => { if (!songEl.hidden && !spCtrl && !ytEl.firstChild) plainSpotify(); }, 3000);
    }
  } else if (id){
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
    f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.title = "Not that kind of sun";
    ytEl.appendChild(f);
  } else {
    const p = document.createElement("p");
    p.className = "miss";
    p.textContent = "Add a Spotify or YouTube link to SONG_URL in js/config.js, and the sun will do its thing.";
    ytEl.appendChild(p);
  }
  songEl.hidden = false;
  sunEl.classList.add("playing");
}
function closeSong(){
  try { if (spCtrl) spCtrl.destroy(); } catch(e) {}
  spCtrl = null;
  ytEl.innerHTML = "";          // removing the player stops the music
  songEl.hidden = true;
  sunEl.classList.remove("playing");
}
// The song only plays once the visitor has accepted cookies; until then the sun just asks.
let consent = null, songWanted = false;
sunEl.addEventListener("click", () => {
  if (!songEl.hidden) return closeSong();
  if (consent === "yes") return openSong();
  songWanted = true;
  showCookie();
});
document.getElementById("songX").addEventListener("click", closeSong);

// =====================================================
//  ABOUT and CONTACT: always fit the window, never scroll
// =====================================================
// About and Contact shrink to fit, but never below MIN_TEXT_PX: past that the text is kept readable and the page scrolls.
// On a phone-width screen they don't shrink at all.
const MIN_TEXT_PX = 11;   // smallest body text size the fit is allowed to produce; lower it to scroll less, raise it for bigger text
const phoneMQ = window.matchMedia("(max-width:560px)");
const pageScrolls = () => {
  const p = document.querySelector(".page.active");
  return !!p && /^(about|contact)$/.test(p.id) && p.scrollHeight > p.clientHeight + 1;
};
function fitPage(page){
  if (!page || !page.classList.contains("active")) return;
  const fit = page.querySelector(".fit");
  if (!fit) return;
  if (phoneMQ.matches){ fit.style.width = ""; fit.style.transform = ""; return; }
  const cs = getComputedStyle(page);
  const availW = page.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const availH = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const heightAt = k => {
    fit.style.width = (availW / k) + "px";
    fit.style.transform = "scale(" + k + ")";
    fixStretch();
    return fit.offsetHeight * k;
  };
  const body = page.querySelector(".prose, .royal");
  const fs = body ? parseFloat(getComputedStyle(body).fontSize) : 16;
  let lo = Math.min(.9, MIN_TEXT_PX / fs), hi = 1;   // shrink until the body text would drop below MIN_TEXT_PX
  if (heightAt(1) <= availH) return;
  for (let i = 0; i < 9; i++){
    const mid = (lo + hi) / 2;
    if (heightAt(mid) <= availH) lo = mid; else hi = mid;
  }
  heightAt(lo);
}
const fitActive = () => fitPage(document.querySelector(".page.active"));
window.addEventListener("resize", fitActive);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitActive);

// =====================================================
//  WORK: sticky notes. Drag them by the tape, type on them, bin them, make more.
// =====================================================
const STICKY_COLOURS = ["#f2e57e","#ffb3c7","#a8e6cf","#9fd8ff","#ffc98b","#d7b8ff"];
const MAX_STICKIES = 30;
let stickyZ = 400;
const dockBin = document.getElementById("dockBin");
function overBin(x, y){
  const r = dockBin.getBoundingClientRect(), m = 14;
  return x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m;
}
// binned notes are kept (not destroyed): they turn up in the Finder's Trash, where they can be put back
function binIt(el){
  const text = el.querySelector(".stext").textContent.trim();
  trashed.push({el, label: text ? (text.length > 28 ? text.slice(0, 28) + "…" : text) : "Empty note", colour: el.style.background || getComputedStyle(el).backgroundColor});
  dockBin.classList.add("full");
  if (loc === "trash") showLoc("trash");
  const an = el.animate({opacity:[1,0]}, {duration:200});
  an.onfinish = () => { if (trashed.some(t => t.el === el)) el.remove(); };   // not if it was already put back
}
function putBack(t){
  const i = trashed.indexOf(t);
  if (i < 0) return;
  trashed.splice(i, 1);
  document.body.appendChild(t.el);
  if (stickyZ < 480) t.el.style.zIndex = ++stickyZ;
  dockBin.classList.toggle("full", trashed.length > 0);
  showLoc("trash");
}
function wireSticky(el){
  const grip = el.querySelector(".grip");
  let drag = null, sx = 0, sy = 0;
  grip.addEventListener("pointerdown", e => {
    if (e.target.closest(".bin")) return;
    drag = {x:e.clientX - sx, y:e.clientY - sy};
    grip.setPointerCapture(e.pointerId);
    el.classList.add("lifted");
    if (stickyZ < 480) el.style.zIndex = ++stickyZ;
    e.preventDefault();
  });
  grip.addEventListener("pointermove", e => {
    if (!drag) return;
    sx = e.clientX - drag.x; sy = e.clientY - drag.y;
    el.style.setProperty("--dx", sx + "px");
    el.style.setProperty("--dy", sy + "px");
    dockBin.classList.toggle("over", overBin(e.clientX, e.clientY));
  });
  const drop = e => {
    const hit = drag && e.type === "pointerup" && overBin(e.clientX, e.clientY);
    drag = null; el.classList.remove("lifted"); dockBin.classList.remove("over");
    if (hit) binIt(el);
  };
  grip.addEventListener("pointerup", drop);
  grip.addEventListener("pointercancel", drop);
  el.querySelector(".bin").addEventListener("click", () => binIt(el));
}
wireSticky(document.getElementById("sticky"));

document.getElementById("dkFinder").addEventListener("click", () => restoreWin(finderEl));
document.getElementById("dkPpt").addEventListener("click", () => {
  const next = Object.keys(DECKS).find(i => !openDecks[i]);
  if (next) openDeck(next, null);
  else Object.values(openDecks).forEach(o => restoreWin(o.el));
});
document.getElementById("addSticky").addEventListener("click", () => {
  if (document.querySelectorAll(".sticky").length >= MAX_STICKIES) return;
  const el = document.createElement("div");
  el.className = "sticky extra";
  el.innerHTML = '<div class="grip" title="Drag me"><button class="bin" type="button" aria-label="Bin this note">&times;</button></div>' +
    '<div class="stext" contenteditable="true" spellcheck="false" data-ph="write something" aria-label="Sticky note, editable"></div>';
  el.style.background = pick(STICKY_COLOURS);
  el.style.setProperty("--r", (Math.random() * 12 - 6).toFixed(1) + "deg");
  const hh = headerEl.offsetHeight;
  el.style.left = Math.round(innerWidth * (.08 + Math.random() * .6)) + "px";
  el.style.top = Math.round(hh + 20 + Math.random() * Math.max(40, innerHeight - hh - 260)) + "px";
  el.style.right = "auto";
  if (stickyZ < 480) el.style.zIndex = ++stickyZ;
  document.body.appendChild(el);
  wireSticky(el);
  el.querySelector(".stext").focus();
});

// the "psych." joke: flashes over whatever page you were on while Substack opens in its new tab
const psychEl = document.getElementById("substack");
let psychT = null;
function psych(){
  psychEl.classList.add("over");
  clearTimeout(psychT);
  psychT = setTimeout(() => psychEl.classList.remove("over"), 1500);
}
psychEl.addEventListener("click", () => { psychEl.classList.remove("over"); clearTimeout(psychT); });

// ---- about: stat bars fill in, and the character sheet window
const statsEl = document.getElementById("stats");
const sheetEl = document.getElementById("sheet");
makeWindow(sheetEl);
sheetEl.querySelector(".wclose").addEventListener("click", () => sheetEl.classList.add("closed"));
let sheetPlaced = false, sheetSized = false;
document.getElementById("openSheet").addEventListener("click", () => {
  if (!sheetPlaced){
    sheetPlaced = true;
    const w = Math.min(480, innerWidth * .92);
    sheetEl.style.left = Math.max(10, innerWidth - w - 40) + "px";
    sheetEl.style.top = (headerEl.offsetHeight + 12) + "px";
  }
  restoreWin(sheetEl);
  if (!sheetSized){
    // tall enough to show the whole Abilities tab at first (as far as the window allows), then it is the visitor's to resize
    sheetSized = true;
    sheetEl.style.height = "auto";
    const room = innerHeight - sheetEl.offsetTop - 14;
    sheetEl.style.height = Math.min(sheetEl.offsetHeight, room) + "px";
  }
});
sheetEl.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  sheetEl.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("on", x === b));
  sheetEl.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.id === "tab-" + b.dataset.tab));
}));

// ---- simple routing
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
function show(id){
  if (id !== "work"){ closeAllDecks(); sadHide(); }
  if (id !== "home") closeSong();
  document.body.className = id;
  navLinks.forEach(a => a.classList.toggle("cur", a.dataset.go === id));
  if (id === "substack"){
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById("substack").classList.add("active");
    window.scrollTo(0,0);
    setTimeout(() => { window.location.href = SUBSTACK_URL; }, 450);
    return;
  }
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  window.scrollTo(0,0);
  try { history.replaceState(null,"","#"+id); } catch(e) {}
  if (id === "work") placeFinder();
  statsEl.classList.remove("in");
  if (id === "about") setTimeout(() => { if (document.body.classList.contains("about")) statsEl.classList.add("in"); }, 120);
  fixStretch();
  fitActive();
}
document.querySelectorAll("[data-go]").forEach(el =>
  el.addEventListener("click", e => {
    e.preventDefault();
    // Substack opens in a new tab; this site stays exactly where it was
    if (el.dataset.go === "substack"){ window.open(SUBSTACK_URL, "_blank", "noopener"); psych(); return; }
    show(el.dataset.go);
  })
);
const start = location.hash.replace("#","");
if (["about","work","contact"].includes(start)) show(start);
fixStretch();

// coming back from Substack with the back button should land on Home, not on "psych."
window.addEventListener("pageshow", e => {
  if (e.persisted && document.getElementById("substack").classList.contains("active")) show("home");
});

// ---- contact
document.getElementById("emailLink").href = "mailto:" + EMAIL;
document.getElementById("emailLink").textContent = EMAIL;
document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const n = document.getElementById("name").value;
  const m = document.getElementById("msg").value;
  window.location.href = "mailto:" + EMAIL +
    "?subject=" + encodeURIComponent("Regards, Your Royal Highness") +
    "&body=" + encodeURIComponent("Your Royal Highness,\n\n" + m + "\n\nYours faithfully,\n" + n);
});

// ---- the cookie: asks the first time the site is opened, a moment after the page opens.
// The only thing that can set cookies is the Spotify player behind the sun, so that is what Accept and Reject control.
const cookieEl = document.getElementById("cookie");
try { localStorage.removeItem("zc-cookie"); } catch(e) {}   // the old pop-up's key; it recorded no real choice
try { consent = localStorage.getItem("zc-consent"); } catch(e) {}
if (consent !== "yes" && consent !== "no") consent = null;
if (consent === null) setTimeout(() => { if (consent === null) showCookie(); }, 1400);
// Once cookies are accepted, Spotify's player script is loaded ahead of time. That way the click on the sun can start
// the song straight away: browsers only allow sound to start from a click, and waiting for the script would lose it.
if (consent === "yes") loadSpotifyApi();
function showCookie(){ cookieEl.hidden = false; }
cookieEl.querySelectorAll("[data-ck]").forEach(b => b.addEventListener("click", () => {
  consent = b.dataset.ck;
  cookieEl.hidden = true;
  try { localStorage.setItem("zc-consent", consent); } catch(e) {}
  if (consent === "yes") loadSpotifyApi();
  if (consent === "yes" && songWanted){ songWanted = false; openSong(); }
  else if (consent === "no"){ songWanted = false; closeSong(); }
}));
document.getElementById("cookieSettings").addEventListener("click", showCookie);

// the dock's Bin opens the Finder at the Trash
dockBin.addEventListener("click", () => { restoreWin(finderEl); showLoc("trash"); });
