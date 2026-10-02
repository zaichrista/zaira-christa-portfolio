const CAL_FONTS = [
  "Italianno","Pinyon Script","Mrs Saint Delafield",
  "Monsieur La Doulaise","Herr Von Muellerhoff","Allura"
];
const COLOURS = ["#ff4d6d","#ff9f1c","#ffd23f","#3ddc97","#2ec4ff","#7b6cff","#e056fd"];
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

// ---- loader
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("gone"), 1900);
});

// ---- London clock
const clockEl = document.getElementById("clock");
function tick(){
  try{
    clockEl.textContent = "London " + new Date().toLocaleTimeString("en-GB",{timeZone:"Europe/London",hour:"2-digit",minute:"2-digit"});
  }catch(e){ clockEl.textContent = ""; }
}
tick(); setInterval(tick, 20000);

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

// ---- one letter at a time, never the same letter twice until all have had a turn
let bag = [], last = -1, timer = null;
function nextIndex(){
  if (!bag.length){
    bag = shuffled(letters.length);
    if (bag[bag.length - 1] === last){
      const k = Math.floor(Math.random() * (bag.length - 1));
      [bag[bag.length - 1], bag[k]] = [bag[k], bag[bag.length - 1]];
    }
  }
  return bag.pop();
}
function flashOne(){
  const i = nextIndex(); last = i;
  const s = letters[i];
  s.style.setProperty("--f", `"${pick(CAL_FONTS)}", cursive`);
  s.style.setProperty("--c", pick(COLOURS));
  s.classList.add("flash");
  setTimeout(() => s.classList.remove("flash"), 650);
}
const btn = document.getElementById("toggle");
let on = false;
btn.addEventListener("click", () => {
  on = !on;
  if (on){
    btn.textContent = "ok, turn it off";
    flashOne();
    if (!reduced) timer = setInterval(flashOne, 1000);
  } else {
    btn.textContent = "don't press me";
    clearInterval(timer); timer = null;
    letters.forEach(s => s.classList.remove("flash"));
  }
});

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

const ppt = document.getElementById("ppt");
const stage = document.getElementById("stage");
const thumbsEl = document.getElementById("thumbs");
const pStat = document.getElementById("pStat");
const pPrev = document.getElementById("pPrev");
const pNext = document.getElementById("pNext");
let slides = [], cur = -1, tBag = [], tName = "none yet", tmr = null, opener = null;

function nextTrans(){
  if (!tBag.length) tBag = shuffled(TRANS.length);
  return TRANS[tBag.pop()];
}
function makeSlide(i){
  const s = slides[i];
  const el = document.createElement("div");
  el.className = "slide " + s.k + (s.dark ? " dark" : "");
  el.innerHTML = s.html;
  return el;
}
function finish(){
  clearTimeout(tmr);
  const all = stage.querySelectorAll(".slide");
  all.forEach((el, k) => { if (k < all.length - 1) el.remove(); });
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
function openDeck(id, btnEl){
  const d = DECKS[id]; if (!d) return;
  slides = buildSlides(d); cur = -1; tBag = []; tName = "none yet"; opener = btnEl;
  stage.innerHTML = "";
  thumbsEl.innerHTML = "";
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "thumb" + (s.dark ? " dark" : "");
    b.innerHTML = `<span class="n">${i + 1}</span><span class="mini">${s.label}</span>`;
    b.addEventListener("click", () => go(i));
    thumbsEl.appendChild(b);
  });
  document.getElementById("pTitle").textContent = d.file;
  stage.appendChild(makeSlide(0));
  cur = 0;
  updateUI();
  ppt.classList.add("open");
  document.body.style.overflow = "hidden";
  ppt.focus();
}
function closeDeck(){
  if (!ppt.classList.contains("open")) return;
  finish();
  ppt.classList.remove("open");
  document.body.style.overflow = "";
  if (opener) opener.focus();
}

document.querySelectorAll(".file").forEach(b =>
  b.addEventListener("click", () => openDeck(b.dataset.deck, b))
);
pNext.addEventListener("click", () => go(cur + 1));
pPrev.addEventListener("click", () => go(cur - 1));
document.getElementById("pClose").addEventListener("click", closeDeck);
stage.addEventListener("click", () => go(cur + 1));
document.addEventListener("keydown", e => {
  if (!ppt.classList.contains("open")) return;
  const next = ["ArrowRight","ArrowDown","PageDown"];
  const prev = ["ArrowLeft","ArrowUp","PageUp"];
  if (e.key === "Escape"){ closeDeck(); }
  else if (next.includes(e.key)){ e.preventDefault(); go(cur + 1); }
  else if (prev.includes(e.key)){ e.preventDefault(); go(cur - 1); }
  else if (e.key === "Home"){ e.preventDefault(); go(0); }
  else if (e.key === "End"){ e.preventDefault(); go(slides.length - 1); }
});

// =====================================================
//  HOME: you are not allowed to scroll
// =====================================================
const homeEl = document.getElementById("home");
const nopeEl = document.getElementById("nope");
const NOPES = [
  "Hey. You can't go down there.",
  "I said no.",
  "There is no down. This is the whole homepage.",
  "Use the menu, like an adult.",
  "Okay, now you're just scrolling for fun."
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
    homeEl.classList.remove("shake");
    void homeEl.offsetWidth;
    homeEl.classList.add("shake");
  }
}
const onHome = () => document.body.classList.contains("home") && !ppt.classList.contains("open");
window.addEventListener("wheel", e => { if (onHome() && e.deltaY > 0) nope(); }, {passive:true});
let touchY = null;
window.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; }, {passive:true});
window.addEventListener("touchmove", e => {
  if (onHome() && touchY !== null && touchY - e.touches[0].clientY > 14){
    nope(); touchY = e.touches[0].clientY;
  }
}, {passive:true});
window.addEventListener("keydown", e => {
  if (!onHome()) return;
  if (!["ArrowDown","PageDown","End"," "].includes(e.key)) return;
  if (e.target.closest && e.target.closest("button,a,input,textarea")) return;
  e.preventDefault(); nope();
});
document.getElementById("scrollcue").addEventListener("click", nope);

// =====================================================
//  HOME: the sun (it is not a light mode switch)
// =====================================================
const sunEl = document.getElementById("sun");
const songEl = document.getElementById("song");
const ytEl = document.getElementById("yt");
function ytId(u){
  const m = (u || "").match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function openSong(){
  ytEl.innerHTML = "";
  const id = ytId(SONG_URL);
  if (id){
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
    f.allow = "autoplay; encrypted-media; picture-in-picture";
    f.title = "Not that kind of sun";
    ytEl.appendChild(f);
  } else {
    const p = document.createElement("p");
    p.className = "miss";
    p.textContent = "Add the YouTube link to SONG_URL at the top of the script, and the sun will do its thing.";
    ytEl.appendChild(p);
  }
  songEl.hidden = false;
  sunEl.classList.add("playing");
}
function closeSong(){
  ytEl.innerHTML = "";          // removing the player stops the music
  songEl.hidden = true;
  sunEl.classList.remove("playing");
}
sunEl.addEventListener("click", () => { songEl.hidden ? openSong() : closeSong(); });
document.getElementById("songX").addEventListener("click", closeSong);

// ---- simple routing
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
function show(id){
  closeDeck();
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
  fixStretch();
}
document.querySelectorAll("[data-go]").forEach(el =>
  el.addEventListener("click", e => { e.preventDefault(); show(el.dataset.go); })
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
