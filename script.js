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
  /* ---------- Cover monograms: initials + curved names + half laurel ---------- */
  (function monograms() {
    const P = (deg, rad) => { const a = deg * Math.PI / 180; return [100 + rad * Math.cos(a), 100 + rad * Math.sin(a)]; };
    const f = n => n.toFixed(2);
    const arc = (a0, a1, rad) => { const [x0, y0] = P(a0, rad), [x1, y1] = P(a1, rad); return `M${f(x0)} ${f(y0)} A${rad} ${rad} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`; };
    // half laurel on the right-hand side, leaves pointing up the curve
    function laurel() {
      let g = "", i = 0;
      for (let a = 112; a >= -62; a -= 8.5) {
        const [x, y] = P(a, 66);
        const tan = a - 90;
        for (const side of [-1, 1]) {
          const rot = tan + side * 32, len = side === 1 ? 13 : 11;
          g += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><g class="lf" style="--i:${i++}">` +
            `<path d="M0 0 C${f(len * .25)} -${f(len * .32)} ${f(len * .7)} -${f(len * .34)} ${len} 0 C${f(len * .7)} ${f(len * .34)} ${f(len * .25)} ${f(len * .32)} 0 0Z" fill="#fff" stroke="#3a3a3a" stroke-width=".42"/>` +
            `<path d="M.5 0 L${f(len * .85)} 0" stroke="#3a3a3a" stroke-width=".3"/></g></g>`;
        }
      }
      [-48, 10, 64, 104].forEach(a => {
        const [x, y] = P(a, 70);
        let fl = "";
        for (let k = 0; k < 5; k++) fl += `<circle cx="${f(x + 2.6 * Math.cos(k * 1.2566))}" cy="${f(y + 2.6 * Math.sin(k * 1.2566))}" r="2.2" fill="#fff" stroke="#2b2b2b" stroke-width=".45"/>`;
        g += `<g class="lf fl" style="--i:${i++}">${fl}<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="#2b2b2b"/></g>`;
      });
      return `<path d="${arc(-62, 112, 66)}" fill="none" stroke="#2b2b2b" stroke-width=".6"/>${g}`;
    }
    const mirror = inner => `<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
    $(".monos").innerHTML = C.couples.map((c, n) => {
      const flip = n % 2 === 1, id = "mono-arc-" + n;
      const textArc = flip ? arc(232, 372, 76) : arc(168, 308, 76);
      const lineEl = `<path d="${arc(140, 168, 76)}" fill="none" stroke="#2b2b2b" stroke-width=".6"/>`;
      return `<svg class="mono ${flip ? "right" : "left"}" viewBox="0 0 200 200" role="img" aria-label="${esc(c.a)} & ${esc(c.b)}">
        <defs><path id="${id}" d="${textArc}"/></defs>
        <g class="mono-wreath">${flip ? mirror(laurel()) : laurel()}</g>
        <g class="mono-line">${flip ? mirror(lineEl) : lineEl}</g>
        <text class="mono-name"><textPath href="#${id}" startOffset="50%" text-anchor="middle">- ${esc(c.a.toUpperCase())} &amp; ${esc(c.b.toUpperCase())} -</textPath></text>
        <text class="mono-l1" x="${flip ? 86 : 78}" y="118" text-anchor="middle">${esc(c.a[0])}</text>
        <text class="mono-l2" x="${flip ? 128 : 124}" y="138" text-anchor="middle">${esc(c.b[0])}</text>
      </svg>`;
    }).join("");
    // each monogram in turn, overlapping
    $$(".mono").forEach((m, n) => m.style.setProperty("--base", (0.3 + n * 0.55) + "s"));
    const k = $(".c-kicker"); k.classList.add("fx"); k.style.setProperty("--base", "2.0s");
    const cd = $("#cover .c-date"); cd.classList.add("fx"); cd.style.setProperty("--base", "2.3s");
    $("#openBtn").style.setProperty("--base", "2.8s");
  })();
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

  /* ---------- Background: hanging wisteria, falling petals, butterflies ---------- */
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  (function drawWisteria() {
    const rnd = rng(11);
    const f = n => n.toFixed(1);
    // one strand: a stem hanging from the top with petals in alternating pairs,
    // getting smaller towards the tip
    function strand(x, len, s, tint, sway) {
      const bend = (rnd() - .5) * 24;
      const pt = t => {               // point on the stem (quadratic curve)
        const y = -10 + t * len, mx = x + bend * 2 * t * (1 - t) + bend * .3 * t;
        return [mx, y];
      };
      let petals = "";
      const steps = Math.round(len / (12 * s));
      for (let i = 2; i <= steps; i++) {
        const t = i / steps, [px, py] = pt(t);
        const size = s * (1.25 - t * .75);
        for (const side of [-1, 1]) {
          if (t > .93 && side === 1) continue;
          const a = side * (35 + rnd() * 30) + (rnd() - .5) * 10;
          petals += `<use href="#pt-${tint}" transform="translate(${f(px)} ${f(py)}) rotate(${f(a)}) scale(${f(size)})"/>`;
        }
      }
      const [ex, ey] = pt(1), [cx1, cy1] = pt(.5);
      const stem = `<path d="M${f(x)} -10 Q${f(cx1 + (cx1 - (x + ex) / 2))} ${f(cy1)} ${f(ex)} ${f(ey)}" stroke="${tint === "g" ? "#6f9a55" : "#7c6a5c"}" stroke-width="${f(1.1 * s)}" fill="none" opacity=".7"/>`;
      return `<g class="strand" style="--sw:${f(sway)}deg;animation-duration:${f(6 + rnd() * 5)}s;animation-delay:-${f(rnd() * 8)}s">${stem}${petals}</g>`;
    }
    const petalDefs = (id, a, b, line) => `
      <linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <path id="pt-${id}" d="M0 0 C4 1 8 6 7.5 12 C7 16 2.5 17 .5 14 C-1.5 11 -1.5 5 0 0Z" fill="url(#g-${id})" stroke="${line}" stroke-width=".45"/>`;
    const defs = `<defs>
      ${petalDefs("b", "#e4f3fa", "#86bcd8", "#4f86a6")}
      ${petalDefs("g", "#eef7e4", "#9cc98a", "#5d8f48")}
      <filter id="far" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter>
      <filter id="near" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>`;
    let far = "", mid = "", near = "";
    [[30, 210], [95, 300], [150, 170], [215, 330], [270, 230], [330, 360], [385, 200]].forEach(([x, l]) => far += strand(x, l * .55, .75, "b", 1.6));
    [[10, 260, "b"], [70, 160, "b"], [125, 230, "b"], [195, 380, "b"], [232, 300, "g"], [300, 220, "b"], [360, 280, "b"]].forEach(([x, l, t]) => mid += strand(x, l * .55, .95, t, 2.2));
    [[-5, 330], [395, 300]].forEach(([x, l]) => near += strand(x, l * .6, 1.4, "b", 1.2));
    $(".wisteria").innerHTML = `<svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMin slice">${defs}
      <g filter="url(#far)" opacity=".4">${far}</g>
      <g opacity=".85">${mid}</g>
      <g filter="url(#near)" opacity=".6">${near}</g></svg>`;
  })();

  // optional: assets/bg.jpg replaces the drawn background
  const bgImg = new Image();
  bgImg.onload = () => { $(".bg-photo").style.backgroundImage = "url(assets/bg.jpg)"; $(".wisteria").style.display = "none"; };
  bgImg.src = "assets/bg.jpg";
  const ph = new Image();
  ph.onload = () => { const p = $(".photo"); p.style.backgroundImage = "url(assets/photo.jpg)"; p.classList.add("has-img"); };
  ph.src = "assets/photo.jpg";

  // cover shares the background look
  $("#cover").style.background = "transparent";

  /* ---------- Falling petals ---------- */
  const fall = $("#petals"), r = rng(99);
  for (let i = 0; i < 14; i++) {
    const d = document.createElement("i");
    const s = 7 + r() * 9;
    Object.assign(d.style, {
      width: s + "px", height: s * 1.4 + "px", left: r() * 100 + "%",
      animationDuration: 13 + r() * 14 + "s", animationDelay: -r() * 25 + "s",
      "--dx": (r() * 120 - 40) + "px", "--rot": (r() * 540 - 270) + "deg", opacity: .5 + r() * .45
    });
    fall.appendChild(d);
  }

  /* ---------- Butterflies ---------- */
  const wing = `<defs><linearGradient id="bw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf6fb"/><stop offset=".55" stop-color="#9fd0e6"/><stop offset="1" stop-color="#4f8fb3"/></linearGradient></defs>`;
  const half = `<path d="M-2 -2 C-16 -36 -46 -34 -44 -10 C-43 2 -22 3 -2 0Z" fill="url(#bw)" stroke="#3f7799" stroke-width=".8"/>
    <path d="M-2 2 C-22 6 -34 26 -22 33 C-12 38 -4 20 -2 4Z" fill="url(#bw)" stroke="#3f7799" stroke-width=".8"/>
    <path d="M-4 -3 C-14 -16 -26 -22 -36 -14 M-4 2 C-12 10 -18 18 -20 26" stroke="#3f7799" stroke-width=".5" fill="none" opacity=".6"/>`;
  [[72, 30, 46, -18, 0], [8, 52, 36, 14, .3], [16, 58, 26, -8, .15], [80, 70, 30, 22, .45]].forEach(([left, top, size, tilt, delay], i) => {
    const b = document.createElement("div");
    b.className = "bf";
    Object.assign(b.style, { left: left + "%", top: top + "%", width: size + "px", "--tilt": tilt + "deg", animationDelay: -i * 3 + "s" });
    b.innerHTML = `<svg viewBox="-50 -40 100 80">${wing}
      <g class="w" style="animation-delay:${delay}s">${half}</g>
      <g transform="scale(-1 1)"><g class="w" style="animation-delay:${delay}s">${half}</g></g>
      <ellipse rx="2.2" ry="13" cy="4" fill="#2f5d78"/></svg>`;
    $("#bg").appendChild(b);
  });

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
