(() => {
  const C = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- Bind text from config ---------- */
  $$("[data-bind]").forEach(el => { const v = C[el.dataset.bind]; if (v != null) el.textContent = v; });
  $$("[data-bind-html]").forEach(el => { const v = C[el.dataset.bindHtml]; if (v != null) el.innerHTML = v; });
  $("[data-bind=doa]").innerHTML = C.doa;
  document.title = C.title;

  /* ---------- Couples ---------- */
  const shortHTML = C.couples.map(c =>
    `<p class="c-couple"><span class="split">${esc(c.a)}</span> <i class="amp">&amp;</i> <span class="split">${esc(c.b)}</span></p>`).join("");
  $$(".couples-short").forEach(el => el.innerHTML = shortHTML);
  $(".couples-full").innerHTML = C.couples.map(c =>
    `<div class="couple"><p class="deco">${esc(c.full[0])}</p><p class="deco amp">&amp;</p><p class="deco">${esc(c.full[1])}</p></div>`
  ).join('<div class="divider"></div>');
  if (!C.programme.length) $("#timeline").closest("section").remove();
  if (!C.hashtag) $(".hashtag").remove();

  /* ---------- Motion helpers ---------- */
  // wrap each letter so it can rise + blur in on its own
  function split(el) {
    if (el.dataset.split) return 0;
    el.dataset.split = 1;
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    let n = 0;
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { const s = document.createElement("span"); s.className = "ch sp"; s.innerHTML = "&nbsp;"; s.style.setProperty("--i", n++); s.setAttribute("aria-hidden", "true"); el.appendChild(s); continue; }
      const w = document.createElement("span");
      w.style.whiteSpace = "nowrap"; w.setAttribute("aria-hidden", "true");
      for (const ch of word) { const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; s.style.setProperty("--i", n++); w.appendChild(s); }
      el.appendChild(w);
    }
    return n;
  }
  // choreograph a title block: title → couples (letters, overlapping) → date → button
  function choreo(root, start) {
    let t = start;
    const title = $(".c-title", root);
    split(title); title.style.setProperty("--base", t + "s"); t += 0.35;
    $$(".c-couple", root).forEach(line => {
      const [a, b] = $$(".split", line), amp = $(".amp", line);
      const na = split(a); a.style.setProperty("--base", t + "s");
      amp.style.setProperty("--base", (t + na * 0.042 + 0.05) + "s");
      split(b); b.style.setProperty("--base", (t + na * 0.042 + 0.2) + "s");
      t += 0.42; // next line starts before this one lands
    });
    const date = $(".c-date", root);
    date.classList.add("fx"); date.style.setProperty("--base", (t + 0.35) + "s");
    const btn = $("#openBtn", root);
    if (btn) btn.style.setProperty("--base", (t + 0.9) + "s");
  }
  choreo($("#cover"), 0.4);    // plays on page load
  choreo($(".hero"), 0.55);    // plays after BUKA

  // section children: each element enters on its own, overlapping
  $$(".sec.reveal").forEach(sec => {
    const items = [];
    [...sec.children].forEach(el => {
      if (el.matches(".couples-full, .countdown, .stats")) items.push(...el.children);
      else if (el.matches(".wishes-wrap")) items.push(el);
      else if (el.matches(".timeline")) items.push(...el.children);
      else if (el.matches(".cta-row")) items.push(...el.children);
      else items.push(el);
    });
    items.forEach((el, i) => {
      const d = (i * 0.11) + "s";
      if (el.matches(".h")) { split(el); el.style.setProperty("--base", d); } // headings spell themselves in
      else { el.classList.add("rv"); el.style.setProperty("--d", d); }
    });
  });

  // Guest name via ?to=Nama
  const to = new URLSearchParams(location.search).get("to");
  if (to) $("#guestName").textContent = to;

  /* ---------- Background: arched hallway ---------- */
  (function drawHall() {
    const svg = $(".hall");
    const cx = 200, vpY = 400;
    const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    let defs = `<defs>${grad("sky", "#f7f7f6", "#ffffff")}${grad("floor", "#f2f2f1", "#e4e4e2")}
      <radialGradient id="glow" cx=".5" cy=".46" r=".5"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
    let out = defs + `<rect width="400" height="860" fill="#e9e9e7"/>`;
    // side walls fading toward vanishing point
    out += `<path d="M-60 -60 L${cx} ${vpY - 8} L-60 920Z" fill="#e4e4e2"/><path d="M460 -60 L${cx} ${vpY - 8} L460 920Z" fill="#efefed"/>`;
    // floor
    out += `<path d="M-260 860 L${cx - 4} ${vpY + 6} L${cx + 4} ${vpY + 6} L660 860Z" fill="url(#floor)"/>`;
    const arch = (L, R, bottom, spring, apex) => {
      const w = R - L, h = spring - apex;
      return `M${L} ${bottom} L${L} ${spring} C${L} ${spring - h * .55} ${cx - w * .14} ${apex + h * .12} ${cx} ${apex} C${cx + w * .14} ${apex + h * .12} ${R} ${spring - h * .55} ${R} ${spring} L${R} ${bottom}`;
    };
    const layers = 12;
    for (let i = layers - 1; i >= 0; i--) {
      const t = i / (layers - 1);
      const s = Math.pow(1 - t * 0.95, 1.7) + 0.03;
      const w = 300 * s, bottom = vpY + 470 * s, spring = vpY - 110 * s, apex = vpY - 320 * s;
      const th = 34 * s; // ring thickness
      const L = cx - w / 2, R = cx + w / 2;
      const inner = arch(L, R, bottom, spring, apex);
      const outer = arch(L - th, R + th, bottom, spring - th * .3, apex - th * 1.2);
      const shade = Math.round(240 + t * 14);
      out += `<path fill-rule="evenodd" fill="rgb(${shade},${shade},${shade - 1})" d="${outer}Z ${inner}Z"/>`;
      out += `<path d="${inner}" fill="none" stroke="rgba(0,0,0,${(0.07 - t * 0.06).toFixed(3)})" stroke-width="${(5 * s).toFixed(2)}"/>`;
      out += `<path d="${outer}" fill="none" stroke="rgba(0,0,0,${(0.05 - t * 0.045).toFixed(3)})" stroke-width="${(2 * s).toFixed(2)}"/>`;
      // pillar base shadow on floor
      out += `<ellipse cx="${L - th / 2}" cy="${bottom}" rx="${th}" ry="${3 * s}" fill="rgba(0,0,0,.05)"/><ellipse cx="${R + th / 2}" cy="${bottom}" rx="${th}" ry="${3 * s}" fill="rgba(0,0,0,.05)"/>`;
    }
    out += `<ellipse cx="200" cy="420" rx="160" ry="260" fill="url(#glow)" opacity=".7"/>`;
    // far door
    out += `<path d="M194 412 V398 C194 392 200 389 200 389 C200 389 206 392 206 398 V412Z" fill="#fff"/>`;
    svg.innerHTML = out;
  })();

  /* ---------- Background: paper waves + baby's breath ---------- */
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function floret(x, y, r, rnd) {
    let g = "";
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + rnd();
      g += `<circle cx="${(x + Math.cos(a) * r * .55).toFixed(1)}" cy="${(y + Math.sin(a) * r * .55).toFixed(1)}" r="${(r * .55).toFixed(1)}" fill="#fdfdfd" stroke="#a9b8bf" stroke-width=".35"/>`;
    }
    g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * .32).toFixed(1)}" fill="#8fa0a6"/>`;
    return g;
  }
  function cluster(points, seed, density) {
    const rnd = rng(seed);
    let stems = "", flowers = "";
    points.forEach(([px, py, spread]) => {
      for (let n = 0; n < density; n++) {
        const bx = px + (rnd() - .5) * spread, by = py + (rnd() - .5) * spread;
        const sprigs = 7 + Math.floor(rnd() * 7);
        for (let j = 0; j < sprigs; j++) {
          const a = rnd() * Math.PI * 2, len = 3 + rnd() * 13;
          const fx = bx + Math.cos(a) * len, fy = by + Math.sin(a) * len;
          stems += `M${bx.toFixed(1)} ${by.toFixed(1)} Q${((bx + fx) / 2 + (rnd() - .5) * 6).toFixed(1)} ${((by + fy) / 2).toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}`;
          flowers += floret(fx, fy, 2.2 + rnd() * 2.2, rnd);
        }
      }
    });
    return `<path d="${stems}" stroke="#7d8d86" stroke-width=".4" fill="none" opacity=".6"/>${flowers}`;
  }
  const shadow = `<filter id="ps" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="-3" dy="4" stdDeviation="5" flood-opacity=".14"/></filter>`;
  $(".fl-tr").innerHTML = `<svg viewBox="0 0 300 450" preserveAspectRatio="xMaxYMin slice"><defs>${shadow}</defs>
    ${cluster([[95, 10, 40], [125, 55, 46], [160, 110, 44], [190, 170, 46], [205, 230, 44], [220, 290, 40], [240, 340, 30]], 7, 3)}
    <path filter="url(#ps)" fill="#f6f6f5" d="M150 -10 C170 40 230 50 245 110 C258 165 228 210 250 265 C266 305 300 320 310 340 L320 -10Z"/>
    <path filter="url(#ps)" fill="#fbfbfa" d="M210 -10 C220 40 270 60 268 120 C266 170 250 210 285 260 L320 270 L320 -10Z"/>
  </svg>`;
  $(".fl-bl").innerHTML = `<svg viewBox="0 0 400 380" preserveAspectRatio="xMinYMax slice"><defs>${shadow}</defs>
    ${cluster([[20, 40, 40], [45, 100, 46], [90, 160, 46], [140, 220, 46], [190, 270, 44], [240, 310, 40], [290, 345, 34]], 21, 3)}
    <path filter="url(#ps)" fill="#f6f6f5" d="M-10 80 C30 120 20 190 70 240 C120 290 170 290 220 330 C250 352 270 372 280 400 L-10 400Z"/>
    <path filter="url(#ps)" fill="#fbfbfa" d="M-10 200 C30 240 50 300 110 330 C150 350 170 370 175 400 L-10 400Z"/>
  </svg>`;
  // optional: assets/bg.jpg replaces drawn hallway
  const bgImg = new Image();
  bgImg.onload = () => { $(".bg-photo").style.backgroundImage = "url(assets/bg.jpg)"; $(".hall").style.display = "none"; };
  bgImg.src = "assets/bg.jpg";
  const ph = new Image();
  ph.onload = () => { const p = $(".photo"); p.style.backgroundImage = "url(assets/photo.jpg)"; p.classList.add("has-img"); };
  ph.src = "assets/photo.jpg";

  // cover shares the background look
  $("#cover").style.background = "transparent";

  /* ---------- Bokeh ---------- */
  const bok = $("#bokeh"), r = rng(99);
  for (let i = 0; i < 16; i++) {
    const d = document.createElement("i");
    const s = 4 + r() * 14;
    Object.assign(d.style, { width: s + "px", height: s + "px", left: r() * 100 + "%", top: 60 + r() * 60 + "%", animationDuration: 14 + r() * 18 + "s", animationDelay: -r() * 30 + "s" });
    bok.appendChild(d);
  }

  /* ---------- Open cover + music ---------- */
  const audio = $("#bgm");
  audio.src = C.song;
  const musicBtn = $("#musicBtn");
  const setPlaying = p => musicBtn.classList.toggle("playing", p);
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  const toggleMusic = () => audio.paused ? audio.play().catch(() => {}) : audio.pause();

  // Play as soon as the page opens. Most phones block sound until the first
  // touch, so if that happens start on the guest's first tap / key press.
  let userPaused = false;
  audio.addEventListener("pause", () => { if (audio.currentTime > 0) userPaused = true; });
  const kick = e => {
    if (e.target.closest && e.target.closest("#musicBtn")) return; // music button handles itself
    if (!userPaused && audio.paused) audio.play().catch(() => {});
    if (!audio.paused) ["pointerdown", "touchend", "keydown", "click"].forEach(e => removeEventListener(e, kick, true));
  };
  audio.play().catch(() => {});
  ["pointerdown", "touchend", "keydown", "click"].forEach(e => addEventListener(e, kick, true));

  // cover names animate in as soon as the page loads
  void $("#cover").offsetWidth; // commit the hidden start state first
  setTimeout(() => $("#cover").classList.add("play"), 30);

  $("#openBtn").addEventListener("click", () => {
    $("#cover").classList.add("open");
    document.body.classList.remove("locked");
    document.body.classList.add("opened");
    $(".hero").classList.add("play");
    window.scrollTo(0, 0);
    audio.play().catch(() => {});
  });

  window.addEventListener("scroll", () => document.body.classList.toggle("scrolled", scrollY > innerHeight * .5), { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); e.target.dispatchEvent(new Event("revealed")); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Swatches + timeline ---------- */
  if ($("#timeline")) $("#timeline").innerHTML =C.programme.map(([t, d]) => `<li><b>${esc(t)}</b>${esc(d)}</li>`).join("");

  /* ---------- Countdown ---------- */
  const target = new Date(C.start).getTime();
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, target - Date.now()) / 1000;
    const d = Math.floor(diff / 86400); diff -= d * 86400;
    const h = Math.floor(diff / 3600); diff -= h * 3600;
    const m = Math.floor(diff / 60), s = Math.floor(diff - m * 60);
    [["#cd-d", d], ["#cd-h", h], ["#cd-m", m], ["#cd-s", s]].forEach(([id, v]) => {
      const el = $(id), txt = pad(v);
      if (el.textContent === txt) return;
      el.textContent = txt;
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Wishes + stats ---------- */
  // numbers count up (ease-out) once their section is on screen
  function countTo(el, to) {
    el.dataset.to = to;
    const sec = el.closest(".sec");
    const run = () => {
      const from = +el.textContent || 0, t0 = performance.now(), dur = 1800;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (sec.classList.contains("in")) run();
    else { el.textContent = 0; sec.addEventListener("revealed", run, { once: true }); }
  }
  function renderWishes() {
    const mine = store.get("rsvps", []);
    const list = [...mine.filter(x => x.wish).map(x => [x.wish, x.name]).reverse(), ...C.seedWishes];
    const html = list.map(([w, n]) => `<div class="w"><p>“${esc(w)}”</p><b>${esc(n)}</b></div>`).join("");
    const box = $("#wishes");
    const scroll = list.length > 3;
    box.classList.toggle("static", !scroll);
    box.parentElement.classList.toggle("short", !scroll);
    box.innerHTML = list.length ? (scroll ? html + html : html) : `<p class="empty">Jadilah yang pertama menulis ucapan 🤍</p>`;
    box.style.animationDuration = Math.max(20, list.length * 5) + "s";
    const yes = C.seedStats.yes + mine.filter(x => x.attend).length;
    const no = C.seedStats.no + mine.filter(x => !x.attend).length;
    countTo($("#st-yes"), yes); countTo($("#st-no"), no);
  }
  renderWishes();

  /* ---------- Sheets ---------- */
  const backdrop = $("#sheetBackdrop");
  let current = null;
  function openSheet(name) {
    if (name === "music") { toggleMusic(); return; }
    const el = $("#sheet-" + name);
    if (!el) return;
    if (current === el) return closeSheet();
    closeSheet(true);
    el.classList.add("show"); backdrop.classList.add("show"); current = el;
  }
  function closeSheet(keepBackdrop) {
    if (current) current.classList.remove("show");
    current = null;
    if (!keepBackdrop) backdrop.classList.remove("show");
  }
  backdrop.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", e => e.key === "Escape" && closeSheet());
  $$("[data-open]").forEach(b => b.addEventListener("click", () => {
    openSheet(b.dataset.open);
    if (b.dataset.open === "rsvp") {
      if (b.dataset.attend) setAttend(b.dataset.attend === "1");
      if (b.dataset.focus) setTimeout(() => $("#wishInput").focus(), 450);
    }
  }));
  $$("[data-close]").forEach(b => b.addEventListener("click", () => closeSheet()));
  $("#musicToggle").addEventListener("click", toggleMusic);

  /* ---------- Calendar links ---------- */
  const fmt = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = C.title;
  const loc = `${C.venue}, ${C.address.replace(/<br>/g, " ")}`;
  $("#gcalLink").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(C.start)}/${fmt(C.end)}&location=${encodeURIComponent(loc)}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//EN", "BEGIN:VEVENT", `UID:${Date.now()}@wedding`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(C.start)}`, `DTEND:${fmt(C.end)}`, `SUMMARY:${title}`, `LOCATION:${loc.replace(/,/g, "\\,")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  $("#icsLink").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));

  /* ---------- Location ---------- */
  $("#mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.mapsQuery)}`;
  $("#wazeLink").href = `https://waze.com/ul?q=${encodeURIComponent(C.mapsQuery)}&navigate=yes`;

  /* ---------- Contacts ---------- */
  const icPhone = `<svg viewBox="0 0 24 24"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>`;
  const icWa = `<svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-1-.5-2-1.5-2.4-2.4l.8-1-1-2z"/></svg>`;
  $("#contacts").innerHTML = C.contacts.map(c => `
    <div class="contact"><div><p>${esc(c.name)}</p><small>${esc(c.role)}</small></div>
      <div class="icons"><a href="tel:+${esc(c.phone)}" aria-label="Telefon ${esc(c.name)}">${icPhone}</a>
      <a href="https://wa.me/${esc(c.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(c.name)}">${icWa}</a></div></div>`).join("");

  /* ---------- Gifts ---------- */
  $("#banks").innerHTML = C.banks.map((b, i) => `
    <div class="card bank">
      <p class="bank-name"><span class="dot" style="background:${b.color}"></span>${esc(b.bank)}</p>
      ${b.qr ? `<img class="qr" src="${esc(b.qr)}" alt="QR ${esc(b.bank)}">` : ""}
      <p class="t-strong center" style="margin-top:10px">${esc(b.holder)}</p>
      <div class="acc"><span>${esc(b.acc)}</span><button type="button" data-copy="${esc(b.acc)}">⧉ Salin</button></div>
    </div>`).join("");
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast("Disalin!"); } catch { toast(b.dataset.copy); }
  }));
  const taken = store.get("taken", []);
  $("#wishlist").innerHTML = C.wishlist.map((w, i) => `
    <div class="wish-item ${taken.includes(i) ? "taken" : ""}"><p>${esc(w.item)}</p>
      ${w.url ? `<a class="btn-solid" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.label)}</a>`
              : `<button class="btn-solid" type="button" data-take="${i}">${taken.includes(i) ? "Telah Ditempah" : esc(w.label)}</button>`}
    </div>`).join("");
  $$("[data-take]").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.take, t = store.get("taken", []);
    if (!t.includes(i)) t.push(i);
    store.set("taken", t);
    b.textContent = "Telah Ditempah"; b.parentElement.classList.add("taken");
    toast("Terima kasih! Hadiah telah ditempah.");
  }));

  /* ---------- RSVP ---------- */
  const form = $("#rsvpForm");
  let attending = true;
  function setAttend(v) {
    attending = v;
    $$(".seg-btn").forEach(b => b.classList.toggle("active", (b.dataset.attend === "1") === v));
    form.classList.toggle("no", !v);
  }
  $$(".seg-btn").forEach(b => b.addEventListener("click", () => setAttend(b.dataset.attend === "1")));
  $("#wishInput").addEventListener("input", e => $("#wishCount").textContent = e.target.value.length);
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach(f => { const bad = !f.value.trim(); f.classList.toggle("invalid", bad); if (bad) ok = false; });
    if (!ok) return toast("Sila lengkapkan semua ruangan.");
    const d = Object.fromEntries(new FormData(form));
    const list = store.get("rsvps", []);
    list.push({ ...d, attend: attending, at: Date.now() });
    store.set("rsvps", list);
    form.reset(); $("#wishCount").textContent = 0;
    form.hidden = true; $("#rsvpThanks").hidden = false;
    renderWishes();
    setTimeout(() => { closeSheet(); form.hidden = false; $("#rsvpThanks").hidden = true; }, 1800);
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800);
  }
})();
