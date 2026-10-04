const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
// resize from any edge or corner. Dragging a top or left edge moves the window as well as sizing it.
function addResizers(el){
  ["n","s","e","w","ne","nw","se","sw"].forEach(d => {
    const h = document.createElement("i");
    h.className = "rz rz-" + d;
    h.setAttribute("aria-hidden","true");
    h.addEventListener("pointerdown", e => {
      const cs = getComputedStyle(el);
      const minW = parseFloat(cs.minWidth) || 300, minH = parseFloat(cs.minHeight) || 200;
      const top0 = headerEl.offsetHeight;
      const r = {x:e.clientX, y:e.clientY, l:el.offsetLeft, t:el.offsetTop, w:el.offsetWidth, h:el.offsetHeight};
      h.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - r.x, dy = ev.clientY - r.y;
        let l = r.l, t = r.t, w = r.w, ht = r.h;
        if (d.includes("e")) w = Math.max(minW, r.w + dx);
        if (d.includes("s")) ht = Math.max(minH, r.h + dy);
        if (d.includes("w")){ w = Math.max(minW, r.w - dx); l = r.l + r.w - w; }
        if (d.includes("n")){ ht = Math.max(minH, r.h - dy); t = r.t + r.h - ht; }
        if (l < 0){ w += l; l = 0; }
        if (t < top0){ ht -= top0 - t; t = top0; }
        el.style.left = l + "px"; el.style.top = t + "px";
        el.style.width = w + "px"; el.style.height = ht + "px";
      };
      const up = () => {
        h.removeEventListener("pointermove", move);
        h.removeEventListener("pointerup", up);
        h.removeEventListener("pointercancel", up);
      };
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerup", up);
      h.addEventListener("pointercancel", up);
      e.preventDefault();
    });
    el.appendChild(h);
  });
}
// the green button (and a double-click on the title bar) fills the browser window; again to put it back
function fitMax(el){
  const hh = headerEl.offsetHeight;
  el.style.left = "0px"; el.style.top = hh + "px";
  el.style.width = innerWidth + "px"; el.style.height = (innerHeight - hh) + "px";
}
function toggleMax(el){
  if (el.classList.contains("max")){
    const p = el._prev || {};
    el.classList.remove("max");
    el.style.left = p.l || ""; el.style.top = p.t || ""; el.style.width = p.w || ""; el.style.height = p.h || "";
  } else {
    el._prev = {l:el.style.left, t:el.style.top, w:el.style.width, h:el.style.height};
    el.classList.add("max");
    fitMax(el);
  }
  raise(el);
}
function makeWindow(el){
  addResizers(el);
  const bar = el.querySelector(".tbar");
  const dot = el.querySelector(".dots > :nth-child(3)");
  if (dot){
    const g = document.createElement("button");
    g.type = "button"; g.className = "wmax"; g.setAttribute("aria-label", "Maximise window");
    dot.replaceWith(g);
    g.addEventListener("click", () => toggleMax(el));
  }
  bar.addEventListener("dblclick", e => { if (!e.target.closest("button")) toggleMax(el); });
  el.addEventListener("pointerdown", () => raise(el), true);
  bar.addEventListener("pointerdown", e => {
    if (e.target.closest("button") || el.classList.contains("max")) return;
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
function restoreWin(el){
  el.classList.remove("closed");
  raise(el);
  el.focus();
}
window.addEventListener("resize", () =>
  document.querySelectorAll(".win").forEach(w => {
    if (!w.offsetWidth) return;
    if (w.classList.contains("max")) fitMax(w); else clampWin(w);
  })
);

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
  if (!canNope() || (e.target.closest && e.target.closest(".sbody,.w2scroll,textarea"))) return;
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
  return !!p && /^(about|contact|work2)$/.test(p.id) && p.scrollHeight > p.clientHeight + 1;
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
sheetEl.addEventListener("keydown", e => { if (e.key === "Escape") sheetEl.classList.add("closed"); });
let sheetPlaced = false, sheetSized = false;
function openSheet(){
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
}
document.getElementById("openSheet").addEventListener("click", openSheet);
sheetEl.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  sheetEl.querySelectorAll(".tabs button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b ? "true" : "false"); });
  sheetEl.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.id === "tab-" + b.dataset.tab));
}));

// ---- simple routing
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
// how: "push" adds a history entry (so Back works), "replace" swaps the current one, "none" is for Back/Forward itself
const TITLES = {home:"Zaira Christa", about:"About | Zaira Christa", work2:"Work | Zaira Christa", contact:"Contact | Zaira Christa"};
const themeMeta = document.querySelector('meta[name="theme-color"]');
const THEME = {home:"#121211", about:"#f2efe9", work2:"#121211", contact:"#f2efe9"};
function show(id, how = "push"){
  const same = document.body.className === id;
  if (TITLES[id]) document.title = TITLES[id];
  if (themeMeta && THEME[id]) themeMeta.content = THEME[id];
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
  try {
    const hash = "#" + (id === "work2" ? "work" : id);   // the new Work page is called #work in the address bar
    if (how === "push" && !same) history.pushState(null,"",hash);
    else if (how === "replace" || (how === "push" && same)) history.replaceState(null,"",hash);
  } catch(e) {}
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
// #work opens the Work page (the "work2" section). Its address was #work2 before, so that still works too.
// (The old desktop-style Work page lives in the old-work-page folder, outside the site.)
const ALIAS = {work:"work2"};
const hashPage = () => { const h = location.hash.replace("#",""); return ALIAS[h] || h; };
const start = hashPage();
if (["about","work2","contact"].includes(start)) show(start, "replace");
// the browser's Back and Forward arrows move between pages
window.addEventListener("popstate", () => {
  const id = hashPage();
  show(["about","work2","contact"].includes(id) ? id : "home", "none");
});
fixStretch();

// coming back from Substack with the back button should land on Home, not on "psych."
window.addEventListener("pageshow", e => {
  if (e.persisted && document.getElementById("substack").classList.contains("active")) show("home", "replace");
});

// ---- contact
const emailBtn = document.getElementById("emailCopy");
const copyHint = document.getElementById("copyHint");
emailBtn.textContent = EMAIL;
let copyTimer;
emailBtn.addEventListener("click", async () => {
  let ok = false;
  try { await navigator.clipboard.writeText(EMAIL); ok = true; }
  catch(e){
    const t = document.createElement("textarea");   // older browsers / non-secure pages
    t.value = EMAIL; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(t); t.select();
    try { ok = document.execCommand("copy"); } catch(_) {}
    t.remove();
  }
  copyHint.textContent = ok ? "Copied" : "Press Ctrl+C";
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyHint.textContent = ""; }, 1800);
});
document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const n = document.getElementById("name").value;
  const from = document.getElementById("email").value;
  const m = document.getElementById("msg").value;
  window.location.href = "mailto:" + EMAIL +
    "?subject=" + encodeURIComponent("Hire Zaira: message from " + n) +
    "&body=" + encodeURIComponent(m + "\n\n" + n + "\n" + from);
});

// ---- the cookie: asks only when something needs it (the sun, or "Cookie settings"), never over the opening.
// The only thing that can set cookies is the Spotify player behind the sun, so that is what Accept and Reject control.
const cookieEl = document.getElementById("cookie");
try { localStorage.removeItem("zc-cookie"); } catch(e) {}   // the old pop-up's key; it recorded no real choice
try { consent = localStorage.getItem("zc-consent"); } catch(e) {}
if (consent !== "yes" && consent !== "no") consent = null;
// Once cookies are accepted, Spotify's player script is loaded ahead of time. That way the click on the sun can start
// the song straight away: browsers only allow sound to start from a click, and waiting for the script would lose it.
if (consent === "yes") loadSpotifyApi();
function showCookie(){
  cookieEl.hidden = false;
  const first = cookieEl.querySelector("button"); if (first) first.focus();
}
cookieEl.querySelectorAll("[data-ck]").forEach(b => b.addEventListener("click", () => {
  consent = b.dataset.ck;
  cookieEl.hidden = true;
  try { localStorage.setItem("zc-consent", consent); } catch(e) {}
  if (consent === "yes") loadSpotifyApi();
  if (consent === "yes" && songWanted){ songWanted = false; openSong(); }
  else if (consent === "no"){ songWanted = false; closeSong(); }
}));
document.getElementById("cookieSettings").addEventListener("click", showCookie);
cookieEl.addEventListener("keydown", e => { if (e.key === "Escape"){ cookieEl.hidden = true; songWanted = false; } });
