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
  $(".doa-list").innerHTML = C.doa.map(d =>
    `<div class="doa-item"><p class="doa" lang="ar" dir="rtl">${d.ar}</p><p class="doa-ms">“${esc(d.ms)}”</p>${d.src ? `<p class="doa-src">${esc(d.src)}</p>` : ""}</div>`
  ).join("");
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
            `<path d="M0 0 C${f(len * .25)} -${f(len * .32)} ${f(len * .7)} -${f(len * .34)} ${len} 0 C${f(len * .7)} ${f(len * .34)} ${f(len * .25)} ${f(len * .32)} 0 0Z" fill="#fbfdf8" stroke="#6a8763" stroke-width=".42"/>` +
            `<path d="M.5 0 L${f(len * .85)} 0" stroke="#6a8763" stroke-width=".3"/></g></g>`;
        }
      }
      [-48, 10, 64, 104].forEach(a => {
        const [x, y] = P(a, 70);
        let fl = "";
        for (let k = 0; k < 5; k++) fl += `<circle cx="${f(x + 2.6 * Math.cos(k * 1.2566))}" cy="${f(y + 2.6 * Math.sin(k * 1.2566))}" r="2.2" fill="#fbfdf8" stroke="#6a8763" stroke-width=".45"/>`;
        g += `<g class="lf fl" style="--i:${i++}">${fl}<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="#6a8763"/></g>`;
      });
      return `<path d="${arc(-62, 112, 66)}" fill="none" stroke="#6a8763" stroke-width=".6"/>${g}`;
    }
    const mirror = inner => `<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
    $(".monos").innerHTML = C.couples.map((c, n) => {
      const flip = n % 2 === 1, id = "mono-arc-" + n;
      const textArc = flip ? arc(232, 372, 76) : arc(168, 308, 76);
      const lineEl = `<path d="${arc(140, 168, 76)}" fill="none" stroke="#6a8763" stroke-width=".6"/>`;
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
    const hj = $(".c-hijri"); hj.classList.add("fx"); hj.style.setProperty("--base", "2.45s");
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

  /* ---------- Background: warm paper + floating gold dust ---------- */
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  const bgImg = new Image();
  bgImg.onload = () => { $(".bg-photo").style.backgroundImage = "url(assets/bg.jpg)"; };
  bgImg.src = "assets/bg.jpg";
  const ph = new Image();
  ph.onload = () => { const p = $(".photo"); if (!p) return; p.style.backgroundImage = "url(assets/photo.jpg)"; p.classList.add("has-img"); };
  ph.src = "assets/photo.jpg";
  $("#cover").style.background = "transparent";

  const dust = $("#dust"), r = rng(99);
  for (let i = 0; i < 24; i++) {
    const d = document.createElement("i");
    const s = 2 + r() * 4;
    Object.assign(d.style, {
      width: s + "px", height: s + "px", left: r() * 100 + "%", top: 10 + r() * 90 + "%",
      animationDuration: 12 + r() * 14 + "s", animationDelay: -r() * 26 + "s",
      "--dx": (r() * 60 - 30) + "px"
    });
    dust.appendChild(d);
  }

  /* ---------- Gold line-art sprigs (cover top/bottom, footer) ---------- */
  function sprig(seed) {
    const rnd = rng(seed), f = n => n.toFixed(2);
    const leaf = (x, y, rot, len) =>
      `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><path d="M0 0 C${f(len * .3)} -${f(len * .34)} ${f(len * .72)} -${f(len * .3)} ${len} 0 C${f(len * .72)} ${f(len * .3)} ${f(len * .3)} ${f(len * .34)} 0 0Z"/><path d="M.6 0 L${f(len * .82)} 0" stroke-width=".5"/></g>`;
    const flower = (x, y, s) => {
      let g = "";
      for (let k = 0; k < 5; k++) { const a = k * 1.2566 - 1.57; g += `<ellipse cx="${f(x + Math.cos(a) * 3.2 * s)}" cy="${f(y + Math.sin(a) * 3.2 * s)}" rx="${f(2.3 * s)}" ry="${f(3.3 * s)}" transform="rotate(${f(a * 57.3 + 90)} ${f(x + Math.cos(a) * 3.2 * s)} ${f(y + Math.sin(a) * 3.2 * s)})"/>`; }
      return g + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.3 * s)}" fill="currentColor"/>`;
    };
    // one branch: quadratic curve from the centre out to one side, leaves along it
    function branch(dir) {
      const x0 = 150, y0 = 14, x2 = 150 + dir * 138, y2 = 40, x1 = 150 + dir * 70, y1 = -6;
      const P = t => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t * t * x2, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t * t * y2];
      const T = t => { const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1), dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1); return Math.atan2(dy, dx) * 57.3; };
      let g = `<path d="M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2}" fill="none"/>`;
      for (let t = .12; t < .96; t += .085) {
        const [x, y] = P(t), a = T(t), len = 13 - t * 6;
        g += leaf(x, y, a - 42 + (rnd() - .5) * 8, len) + leaf(x, y, a + 42 + (rnd() - .5) * 8, len * .9);
      }
      const [ex, ey] = P(1); g += flower(ex, ey, .9);
      const [mx, my] = P(.55); g += flower(mx, my + 9, .7);
      return g;
    }
    return `<svg viewBox="0 0 300 60" fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round">
      ${branch(-1)}${branch(1)}${flower(150, 16, 1.25)}</svg>`;
  }
  $$(".sprig").forEach((el, i) => el.innerHTML = sprig(7 + i * 5));

  /* ---------- Ornament dividers ---------- */
  const ORN = `<svg viewBox="0 0 180 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
    <path d="M6 12H64M116 12H174"/><circle cx="69" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="111" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    <path d="M90 3C94 8 98 10 104 12C98 14 94 16 90 21C86 16 82 14 76 12C82 10 86 8 90 3Z"/><path d="M90 8V16"/></svg>`;
  $$(".orn").forEach(el => el.innerHTML = ORN);

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
  let autoPausing = false; // true while we pause because the page is hidden
  audio.addEventListener("pause", () => {
    if (autoPausing) { autoPausing = false; return; }
    if (audio.currentTime > 0) userPaused = true;
  });
  const kick = e => {
    if (e.target.closest && e.target.closest("#musicBtn")) return; // music button handles itself
    if (!userPaused && audio.paused) audio.play().catch(() => {});
    if (!audio.paused) ["pointerdown", "touchend", "keydown", "click"].forEach(e => removeEventListener(e, kick, true));
  };
  audio.play().catch(() => {});
  ["pointerdown", "touchend", "keydown", "click"].forEach(e => addEventListener(e, kick, true));

  // Stop the music when the guest leaves the page (Home button, another app,
  // screen locked) and carry on when they come back, if it was playing before.
  let resumeOnReturn = false;
  const leave = () => {
    if (!audio.paused) { resumeOnReturn = true; autoPausing = true; audio.pause(); }
  };
  const back = () => {
    if (resumeOnReturn && !userPaused) audio.play().catch(() => {});
    resumeOnReturn = false;
  };
  document.addEventListener("visibilitychange", () => document.hidden ? leave() : back());
  addEventListener("pagehide", leave);
  addEventListener("blur", () => { if (document.hidden) leave(); });

  // cover names animate in as soon as the page loads
  void $("#cover").offsetWidth; // commit the hidden start state first
  setTimeout(() => $("#cover").classList.add("play"), 30);

  $("#openBtn").addEventListener("click", () => {
    $("#cover").classList.add("open");
    document.body.classList.remove("locked");
    void $("#main").offsetHeight; // let the content render hidden first so its entrance still animates
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
  /* ---------- Google Sheets link (config.js → sheetUrl) ---------- */
  const SHEET = (C.sheetUrl || "").trim();
  let remoteWishes = null; // [[wish, name], ...] from the Sheet, newest first
  function sendToSheet(payload) {
    if (!SHEET) return;
    // text/plain keeps this a "simple" request, so Apps Script accepts it without CORS preflight
    fetch(SHEET, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .catch(() => {});
  }
  function loadWishes() {
    if (!SHEET) return;
    fetch(SHEET).then(r => r.json()).then(d => {
      remoteWishes = (d.wishes || []).map(x => [String(x.wish || ""), String(x.name || "")]).filter(x => x[0]);
      renderWishes();
    }).catch(() => {});
  }

  function renderWishes() {
    const mine = store.get("rsvps", []);
    const local = mine.filter(x => x.wish).map(x => [x.wish, x.name]).reverse();
    // with the Sheet: everyone's wishes, plus this guest's own ones that the Sheet hasn't returned yet
    const list = remoteWishes
      ? [...local.filter(([w, n]) => !remoteWishes.some(r => r[0] === w && r[1] === n)), ...remoteWishes]
      : [...local, ...C.seedWishes];
    // newest first, in a scrollable box; no attendance counts
    const box = $("#wishes");
    box.innerHTML = list.length
      ? list.map(([w, n]) => `<div class="w"><b>${esc(n)}</b><p>${esc(w)}</p></div>`).join("")
      : `<p class="empty">Belum ada ucapan. Jadilah yang pertama.</p>`;
    $("#wishTotal").textContent = list.length ? `${list.length} UCAPAN` : "";
  }
  renderWishes();
  loadWishes();

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
    $$("#sheet-rsvp .seg-btn").forEach(b => b.classList.toggle("active", (b.dataset.attend === "1") === v));
    form.classList.toggle("no", !v);
  }
  $$("#sheet-rsvp .seg-btn").forEach(b => b.addEventListener("click", () => setAttend(b.dataset.attend === "1")));
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
    sendToSheet({ type: "wish", name: d.name, wish: d.wish });
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
