// =====================================================
//  WORK II: click a project to open it as a window that stays open
// =====================================================
// Windows live in the right-hand area. Drag the title bar to move, drag any edge or corner to resize, + to fill the area, red dot to close.
// Four at a time: opening a fifth closes the one opened first. The role and problem lines sit under the "how I think" list and follow the window in front.
// "site" projects show the live website, scaled like the Work page. "scroll" projects show a scrolling window of images.
// Drop images in assets/work2/<id>/1.jpg, 2.jpg, ... and they appear; until then each slot shows a dashed placeholder.
// The role, problem and approach lines are edited here.
(function(){
  const right = document.getElementById("w2right");
  const page = document.getElementById("work2");
  const info = document.getElementById("w2info");
  if (!right || !page || !info) return;

  const IMAGES = 4;       // slots per scrolling window
  const MAX_OPEN = 4;     // a fifth window closes the first one opened
  const MIN_W = 260, MIN_H = 190;
  const PROJECTS = [
    {id:"reach", kind:"site", at:[.04,.05], title:"Reach_Riverside.html", stat:"zaichrista.github.io/Reach-Riverside-site",
     url:"https://zaichrista.github.io/Reach-Riverside-site/",
     role:"Web design and brand translation.",
     problem:"How do you make a riverside restaurant feel as distinctive online as it does in person?",
     approach:"Dark navy and cream with gold, day and night imagery split, booking one tap away."},
    {id:"mandaloun", kind:"site", at:[.96,.95], title:"Mandaloun_Westfield.html", stat:"zaichrista.github.io/Mandaloun-Westfield",
     url:"https://zaichrista.github.io/Mandaloun-Westfield/", deskW:1850,
     role:"Web design and brand translation.",
     problem:"How do you make cooking made to be shared feel shared before anyone arrives?",
     approach:"Deep teal on light grounds, generous whitespace, booking and phone always visible."},
    {id:"gala", kind:"scroll", at:[.55,.1], title:"Oxford_Fashion_Gala",
     role:"[Role to come.]", problem:"[Problem to come.]", approach:"[What I did about it.]"},
    {id:"ff22", kind:"scroll", at:[.95,.05], portrait:true, title:"Zaira_Christa_FF22",
     role:"[Role to come.]", problem:"[Problem to come.]", approach:"[What I did about it.]"},
    {id:"ss23", kind:"scroll", at:[.08,.5], portrait:true, images:12, title:"Zaira_Christa_SS23",
     role:"[Role to come.]", problem:"[Problem to come.]", approach:"[What I did about it.]"},
    {id:"bekaa", kind:"scroll", at:[.1,.92], small:true, title:"Bekaa",
     role:"Creative strategy, brand world, hospitality concept.",
     problem:"A neighbourhood of visitors and residents who share a postcode and rarely a room. The brief: make a bar that gives them one.",
     approach:"A room that accumulates. Every night leaves something behind."},
    {id:"void", kind:"scroll", at:[.9,.6], small:true, title:"VOID",
     role:"Creative strategy, brand world, art direction.",
     problem:"Long distance, close contact unavailable, and a body reduced to a scent memory. VOID is made for that gap.",
     approach:"Perfumes named after presence, not nature."}
  ];

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const phone = window.matchMedia("(max-width:800px)");
  const items = [...document.querySelectorAll(".w2item")];
  const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const open = [];        // entries in the order they were opened
  let front = null, zTop = 1, slot = 0;

  right.classList.add("w2space");
  const IDLE = [
    "Click something. The rectangles are intentional.",
    "Nothing open. Unlike my kerning, which was chosen very carefully.",
    "Pick a project. I did all of it on purpose.",
    "Currently showing: nothing. A bold choice, and an easy one to fix."
  ];
  let idleN = Math.floor(Math.random() * IDLE.length);
  const idle = el("p", "w2idle");
  right.appendChild(idle);

  function line(label, text){
    const p = el("p"); p.append(el("b", "", label), text); return p;
  }

  // the website, drawn at a desktop width and scaled to the window (phones get the site's own phone layout)
  function mountSite(p, view){
    const f = document.createElement("iframe");
    f.src = p.url; f.title = p.title;
    view.appendChild(f);
    const fit = () => {
      if (!view.clientWidth) return;
      const deskW = view.clientWidth > 700 ? (p.deskW || 1600) : view.clientWidth;   // a wider desktop width makes the site look smaller
      const k = view.clientWidth / deskW;
      f.style.width = deskW + "px";
      f.style.setProperty("--k", k);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(view);
    fit();
    return ro;
  }

  function mountImages(p, view){
    for (let i = 1; i <= (p.images || IMAGES); i++){
      const fig = el("figure");
      const src = "assets/work2/" + p.id + "/" + i + ".jpg";
      const img = new Image();
      img.alt = p.title.replace(/_/g, " ") + ", image " + i;
      img.loading = "lazy";
      img.onerror = () => { fig.replaceChildren(el("div", "w2ph", "Image " + i + " goes here: " + src)); };
      img.src = src;
      fig.appendChild(img);
      view.appendChild(fig);
    }
  }

  // ---- placing, moving and sizing ----
  function place(entry){
    const W = right.clientWidth, H = right.clientHeight, p = entry.p;
    let w, h;
    if (p.portrait){ h = H * .82; w = Math.min(W * .45, (h - 90) * .75); }
    else if (p.small){ w = W * .42; h = Math.min(H * .5, w * .625 + 90); }
    else if (p.kind === "site"){ w = W * .7; h = Math.min(H * .82, w * .625 + 90); }
    else { w = W * .6; h = H * .68; }
    w = clamp(w, MIN_W, W); h = clamp(h, MIN_H, H);
    const [fx, fy] = p.at || [0, 0];   // where in the free space it opens: 0 is left or top, 1 is right or bottom
    Object.assign(entry.win.style, {
      width: w + "px", height: h + "px",
      left: Math.max(0, (W - w) * fx) + "px", top: Math.max(0, (H - h) * fy) + "px"
    });
  }

  function keepInside(win){
    const W = right.clientWidth, H = right.clientHeight;
    const w = Math.min(win.offsetWidth, W), h = Math.min(win.offsetHeight, H);
    win.style.width = w + "px"; win.style.height = h + "px";
    win.style.left = clamp(win.offsetLeft, 0, W - w) + "px";
    win.style.top = clamp(win.offsetTop, 0, H - h) + "px";
  }

  function startDrag(e, entry){
    const win = entry.win, bar = e.currentTarget;
    if (phone.matches || win.classList.contains("max") || e.target.closest("button")) return;
    const ox = e.clientX - win.offsetLeft, oy = e.clientY - win.offsetTop;
    bar.setPointerCapture(e.pointerId);
    right.classList.add("busy");
    const move = ev => {
      win.style.left = clamp(ev.clientX - ox, 0, right.clientWidth - win.offsetWidth) + "px";
      win.style.top = clamp(ev.clientY - oy, 0, right.clientHeight - win.offsetHeight) + "px";
    };
    const done = () => {
      right.classList.remove("busy");
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", done);
      bar.removeEventListener("pointercancel", done);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", done);
    bar.addEventListener("pointercancel", done);
  }

  function startResize(e, win, dir){
    if (phone.matches || win.classList.contains("max")) return;
    e.preventDefault();
    const h = e.currentTarget, W = right.clientWidth, H = right.clientHeight;
    const r = {l: win.offsetLeft, t: win.offsetTop, w: win.offsetWidth, h: win.offsetHeight};
    const sx = e.clientX, sy = e.clientY;
    h.setPointerCapture(e.pointerId);
    right.classList.add("busy");
    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let l = r.l, t = r.t, w = r.w, ht = r.h;
      if (dir.includes("e")) w = clamp(r.w + dx, MIN_W, W - r.l);
      if (dir.includes("s")) ht = clamp(r.h + dy, MIN_H, H - r.t);
      if (dir.includes("w")){ l = clamp(r.l + dx, 0, r.l + r.w - MIN_W); w = r.l + r.w - l; }
      if (dir.includes("n")){ t = clamp(r.t + dy, 0, r.t + r.h - MIN_H); ht = r.t + r.h - t; }
      Object.assign(win.style, {left: l + "px", top: t + "px", width: w + "px", height: ht + "px"});
    };
    const done = () => {
      right.classList.remove("busy");
      h.removeEventListener("pointermove", move);
      h.removeEventListener("pointerup", done);
      h.removeEventListener("pointercancel", done);
    };
    h.addEventListener("pointermove", move);
    h.addEventListener("pointerup", done);
    h.addEventListener("pointercancel", done);
  }

  // ---- building a window ----
  function build(p){
    const win = el("div", "w2win" + (p.portrait ? " portrait" : "") + (p.kind === "site" ? " site" : ""));
    win.setAttribute("role", "group");
    win.setAttribute("aria-label", p.title.replace(/_/g, " "));
    const bar = el("div", "tbar");
    const dots = el("div", "dots");
    const close = el("button", "wclose"); close.type = "button"; close.setAttribute("aria-label", "Close window");
    const max = el("button", "wmax"); max.type = "button"; max.setAttribute("aria-label", "Maximise window");
    const mid = el("i"); mid.setAttribute("aria-hidden", "true");
    dots.append(close, mid, max);
    bar.append(dots, el("div", "ttl", p.title));
    const tools = el("div", "tools");
    const view = el("div", "w2view");
    if (p.kind === "site"){
      const a = el("a", "btn", "Open in new tab");
      a.href = p.url; a.target = "_blank"; a.rel = "noopener";
      tools.append(el("span", "stat", p.stat), a);
    } else {
      tools.append(el("span", "stat", "Scroll to see more"));
      view.classList.add("w2scroll");
      view.tabIndex = 0;
      view.setAttribute("role", "region");
      view.setAttribute("aria-label", p.title.replace(/_/g, " ") + " images");
    }
    win.append(bar, tools, view);
    const entry = {p, win, view, z: 0, slot: 0, ro: null};
    ["n","s","e","w","ne","nw","se","sw"].forEach(d => {
      const h = el("span", "w2rz w2rz-" + d);
      h.addEventListener("pointerdown", e => startResize(e, win, d));
      win.appendChild(h);
    });
    close.addEventListener("click", () => closeEntry(entry));
    max.addEventListener("click", () => {
      const on = win.classList.toggle("max");
      max.setAttribute("aria-label", on ? "Restore window" : "Maximise window");
      focus(entry);
    });
    bar.addEventListener("dblclick", e => { if (!e.target.closest("button")) max.click(); });
    bar.addEventListener("pointerdown", e => startDrag(e, entry));
    win.addEventListener("pointerdown", () => focus(entry), true);
    return entry;
  }

  // ---- which window is in front, and what the list and the writing say ----
  function render(){
    const wasEmpty = idle.classList.contains("on");
    const empty = !open.length;
    if (empty && !wasEmpty) idle.textContent = IDLE[idleN++ % IDLE.length];   // a different line each time it empties
    idle.classList.toggle("on", empty);
    open.forEach(en => en.win.classList.toggle("front", en === front));
    info.replaceChildren();
    if (front){
      const p = front.p;
      info.append(line("Role", p.role), line("Problem", p.problem), line("What I did", p.approach));
    }
    items.forEach(b => {
      const en = open.find(x => x.p.id === b.dataset.id);
      b.classList.toggle("on", !!en && en === front);
      b.classList.toggle("pinned", !!en);
      b.setAttribute("aria-pressed", en ? "true" : "false");
    });
  }

  function focus(entry){
    if (front !== entry){
      front = entry;
      entry.z = ++zTop;
      entry.win.style.zIndex = entry.z;
      render();
    }
  }

  function closeEntry(entry){
    const i = open.indexOf(entry);
    if (i < 0) return;
    open.splice(i, 1);
    if (entry.ro) entry.ro.disconnect();
    entry.win.remove();
    if (front === entry) front = open.reduce((a, b) => (!a || b.z > a.z ? b : a), null);
    render();
  }

  function openProject(id){
    const have = open.find(x => x.p.id === id);
    if (have){
      focus(have);
      if (phone.matches) have.win.scrollIntoView({behavior:"smooth", block:"nearest"});
      return;
    }
    if (open.length >= MAX_OPEN) closeEntry(open[0]);   // the one opened first
    const entry = build(byId[id]);
    entry.slot = slot++;
    right.appendChild(entry.win);
    open.push(entry);
    place(entry);
    if (entry.p.kind === "site") entry.ro = mountSite(entry.p, entry.view); else mountImages(entry.p, entry.view);
    entry.z = ++zTop; entry.win.style.zIndex = entry.z;
    front = entry;
    render();
    if (phone.matches) entry.win.scrollIntoView({behavior:"smooth", block:"nearest"});
  }

  items.forEach(b => b.addEventListener("click", () => openProject(b.dataset.id)));

  // keep every window inside the area when the browser is resized
  new ResizeObserver(() => { if (!phone.matches && right.clientWidth) open.forEach(en => keepInside(en.win)); }).observe(right);

  // leaving the page closes everything, so coming back starts from the empty workspace
  new MutationObserver(() => {
    if (page.classList.contains("active")) return;
    open.slice().forEach(closeEntry);
  }).observe(page, {attributes:true, attributeFilter:["class"]});

  render();
})();
