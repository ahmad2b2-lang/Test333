// Regret Challenge — the village garden scene.
// Pixel art drawn in code (all original): cottage, fence, garden plots, a plant per
// decision, and Old Basil the gardener who walks around, waters plants and talks.
(() => {
  "use strict";

  // ---------- Old Basil sprite (14 x 20) ----------
  const PAL = {
    h: "#e8c170", H: "#b98a3e", s: "#f2c29b", e: "#3a2a1e", r: "#e8a091",
    w: "#f6f3ec", W: "#d9d2c3", g: "#5f9f52", G: "#3f7a3a", O: "#8a5a3b",
    o: "#6b4329", b: "#4a3424"
  };
  const TOP = [
    "....hhhhhh....",
    "...hhhhhhhh...",
    "...HHHHHHHH...",
    ".hhhhhhhhhhhh.",
    "hhhhhhhhhhhhhh",
    "...ssssssss...",
    "...sesssses...",
    "...rssssssr...",
    "...wwwwwwww...",
    "..wwwwwwwwww..",
    "..wWwwwwwwWw..",
    ".gggWwwwwWggg.",
    ".ggOggggggOgg.",
    ".gOOOOOOOOOOg.",
    "s.OOOOOOOOOO.s",
    "..OOOOOOOOOO.."
  ];
  const LEGS = {
    idle: ["..OOOO..OOOO..", "..oooo..oooo..", "..bbbb..bbbb..", ".bbbbb..bbbbb."],
    a:    ["..OOOO..OOOO..", ".oooo....oooo.", ".bbbb....bbbb.", "bbbbb.....bbbb"],
    b:    ["...OOOOOOOO...", "....oooooo....", "....bbbbbb....", "...bbbbbbbb..."]
  };
  function makeSprite(rows, flip) {
    const c = document.createElement("canvas");
    c.width = 14; c.height = rows.length;
    const x = c.getContext("2d");
    rows.forEach((row, y) => {
      [...row].forEach((ch, i) => {
        if (ch === ".") return;
        x.fillStyle = PAL[ch];
        x.fillRect(flip ? 13 - i : i, y, 1, 1);
      });
    });
    return c;
  }
  const blinkTop = TOP.slice();
  blinkTop[6] = "...sossssos...";
  const SPR = {};
  for (const flip of [false, true]) {
    for (const leg of ["idle", "a", "b"]) {
      SPR[`${leg}${flip ? "L" : "R"}`] = makeSprite(TOP.concat(LEGS[leg]), flip);
      SPR[`${leg}${flip ? "L" : "R"}blink`] = makeSprite(blinkTop.concat(LEGS[leg]), flip);
    }
  }

  // ---------- Colours ----------
  const FLOWER = ["#f08fb0", "#f5d04a", "#ffffff", "#a98be0", "#ff9a3d", "#e0483e"];
  const SKY = {
    morning: ["#ffd3ae", "#fff2da"],
    day: ["#9fd3f5", "#e2f4ff"],
    sunset: ["#f6ae86", "#ffe3bd"],
    evening: ["#8a8fd0", "#cdbfe9"]
  };
  function period(d = new Date()) {
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= 5 && h < 9) return "morning";
    if (h >= 9 && h < 16.5) return "day";
    if (h >= 16.5 && h < 18.5) return "sunset";
    return "evening";
  }

  // ---------- State ----------
  let wrap, canvas, ctx, bubble, opts = {};
  let S = 2, LW = 195, LH = 200, GY = 60, COLS = 4, ROWS = 2;
  let plants = [];          // {id, stage, mood, variety, due, seed}
  let plots = [];           // {x, y, w, h, cx, by, plant}
  let active = true, raf = 0, last = 0, acc = 0, t = 0;
  const HOUSE_X = 8;
  const bob = { x: 0, y: 0, tx: 0, ty: 0, mode: "idle", facing: "R", onArrive: null, waterUntil: 0, blinkAt: 2 };
  let say = { text: "", until: 0, onTap: null };
  let clouds = [], flies = [];

  const hash = (n) => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296; };
  const seedOf = (id) => { let h = 7; for (const ch of String(id)) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0; return Math.abs(h); };

  function R(c, x, y, w = 1, h = 1) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function disc(c, cx, cy, r) {
    ctx.fillStyle = c;
    cx = Math.round(cx); cy = Math.round(cy);
    for (let y = -r; y <= r; y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.6));
      ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  }

  // ---------- Layout ----------
  function layout() {
    const cssW = wrap.clientWidth || 360;
    S = Math.max(2, Math.floor(cssW / 190));
    LW = Math.ceil(cssW / S);
    COLS = LW >= 232 ? 5 : 4;
    GY = 58;
    const total = Math.max(COLS * 2, Math.ceil((plants.length + 1) / COLS) * COLS);
    ROWS = total / COLS;
    const y0 = GY + 30, rowH = 34, m = 10, gap = 7;
    const pw = Math.floor((LW - 2 * m - (COLS - 1) * gap) / COLS);
    const left = Math.round((LW - (COLS * pw + (COLS - 1) * gap)) / 2);
    LH = y0 + ROWS * rowH - 8;
    plots = [];
    for (let i = 0; i < total; i++) {
      const c = i % COLS, r = Math.floor(i / COLS);
      const x = left + c * (pw + gap), y = y0 + r * rowH;
      plots.push({ x, y, w: pw, h: 10, cx: x + Math.floor(pw / 2), by: y + 5, plant: plants[i] || null });
    }
    canvas.width = LW; canvas.height = LH;
    canvas.style.width = LW * S + "px";
    canvas.style.height = LH * S + "px";
    wrap.style.height = LH * S + "px";
    ctx.imageSmoothingEnabled = false;
    if (!bob.x) { bob.x = bob.tx = HOUSE_X + 8; bob.y = bob.ty = GY + 14; }
    if (!clouds.length) clouds = [0, 1, 2].map((i) => ({ x: hash(i + 9) * LW, y: 8 + hash(i + 3) * 20, s: 0.6 + hash(i + 5) * 0.8 }));
    if (!flies.length) flies = [0, 1, 2, 3, 4, 5].map((i) => ({ p: hash(i * 7) * 6.28, x: hash(i + 11) * LW, y: GY + 10 + hash(i + 21) * (LH - GY - 20) }));
  }

  // ---------- Background ----------
  function drawSky(per) {
    const [a, b] = SKY[per];
    const g = ctx.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, GY);
    if (per === "evening") {
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(hash(i * 13) * LW), y = Math.floor(hash(i * 17) * (GY - 22));
        if (Math.sin(t * 2 + i) > -0.4) R("#fffbe6", x, y);
      }
      disc("#e9e3f7", LW - 30, 15, 8);
      disc("#fff8e1", LW - 30, 15, 6);
      R("#efe6c8", LW - 32, 13, 2, 2); R("#efe6c8", LW - 28, 17, 2, 1);
    } else {
      const sunC = per === "day" ? "#ffe27a" : "#ffbf6b";
      const sy = per === "day" ? 13 : per === "morning" ? 22 : 26;
      disc(per === "day" ? "#fff6c8" : "#ffe1b0", LW - 30, sy, 9);
      disc(sunC, LW - 30, sy, 7);
    }
    for (const c of clouds) {
      c.x += c.s * 0.05;
      if (c.x > LW + 20) c.x = -24;
      const col = per === "evening" ? "#e3dbf4" : "#ffffff";
      disc(col, c.x, c.y, 4); disc(col, c.x + 6, c.y - 2, 5); disc(col, c.x + 12, c.y, 4);
      R(col, c.x - 3, c.y + 2, 19, 2);
    }
    // hills
    for (let x = 0; x < LW; x++) {
      const y1 = Math.round(GY - 16 + Math.sin(x * 0.045 + 1) * 5 + Math.sin(x * 0.11) * 2);
      R(per === "evening" ? "#9fb7a8" : "#b5dc98", x, y1, 1, GY - y1);
    }
    for (let i = 0; i < 9; i++) {
      const x = Math.round(hash(i * 29) * LW);
      const y = Math.round(GY - 16 + Math.sin(x * 0.045 + 1) * 5 + Math.sin(x * 0.11) * 2);
      disc(per === "evening" ? "#86a493" : "#93c77a", x, y - 2, 3);
    }
    for (let x = 0; x < LW; x++) {
      const y2 = Math.round(GY - 6 + Math.sin(x * 0.06 + 3) * 3);
      R(per === "evening" ? "#8fb889" : "#9dd27f", x, y2, 1, GY - y2 + 1);
    }
  }

  function drawGround(per) {
    R("#8cc56b", 0, GY, LW, LH - GY);
    for (let i = 0; i < (LW * (LH - GY)) / 55; i++) {
      const x = Math.floor(hash(i * 3 + 1) * LW), y = GY + 1 + Math.floor(hash(i * 5 + 2) * (LH - GY));
      R(i % 3 ? "#7db75d" : "#a3d684", x, y);
    }
    // wild flowers at the edges
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(hash(i * 41) * LW), y = GY + 3 + Math.floor(hash(i * 43) * (LH - GY - 4));
      if (plots.some((p) => x >= p.x - 3 && x <= p.x + p.w + 3 && y >= p.y - 30 && y <= p.y + p.h + 2)) continue;
      R(FLOWER[i % FLOWER.length], x, y);
      R("#5f9f52", x, y + 1);
    }
    // path from the door to the garden
    const px = HOUSE_X + 7;
    R("#dcc896", px, GY + 1, 7, 22);
    R("#dcc896", px, GY + 20, LW - px - 6, 5);
    R("#cdb683", px + 1, GY + 23, LW - px - 8, 1);
    // fence
    const fx0 = HOUSE_X + 38;
    R("#b48c55", fx0, GY - 3, LW - fx0 - 3, 1);
    R("#b48c55", fx0, GY + 1, LW - fx0 - 3, 1);
    for (let x = fx0; x < LW - 3; x += 8) { R("#d1ab72", x, GY - 5, 2, 8); R("#a37c48", x + 1, GY - 5, 1, 8); }
    if (per === "evening") { ctx.fillStyle = "rgba(120,110,190,0.10)"; ctx.fillRect(0, GY, LW, LH - GY); }
  }

  function drawHouse(per) {
    const x0 = HOUSE_X, base = GY + 2;
    R("#f3e6c8", x0, base - 16, 28, 16);
    R("#e3d2ad", x0, base - 2, 28, 2);
    R("#9b6b55", x0 + 20, base - 27, 4, 7);
    R("#7f5644", x0 + 19, base - 28, 6, 1);
    for (let i = 0; i < 9; i++) R(i % 2 ? "#b4553c" : "#c8664a", x0 - 3 + 2 * i, base - 17 - i, 34 - 4 * i, 1);
    R("#8a5a3b", x0 + 5, base - 10, 6, 10);
    R("#a06a47", x0 + 6, base - 9, 4, 9);
    R("#f5d04a", x0 + 9, base - 5);
    const glow = per === "evening" || per === "sunset";
    R("#7a5236", x0 + 15, base - 13, 9, 7);
    R(glow ? "#ffe08a" : "#c4e6fa", x0 + 16, base - 12, 7, 5);
    R("#7a5236", x0 + 19, base - 12, 1, 5); R("#7a5236", x0 + 16, base - 10, 7, 1);
    R("#8a5a3b", x0 + 15, base - 6, 9, 2);
    R("#f08fb0", x0 + 16, base - 7); R("#f5d04a", x0 + 19, base - 7); R("#ffffff", x0 + 22, base - 7);
    // chimney smoke
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.35 + k / 3) % 1;
      ctx.globalAlpha = 0.65 * (1 - ph);
      disc("#ffffff", x0 + 22 + Math.sin(ph * 6 + k) * 2, base - 30 - ph * 16, 1 + Math.round(ph * 2));
      ctx.globalAlpha = 1;
    }
  }

  function drawPlot(p) {
    R("#9a6a45", p.x + 1, p.y, p.w - 2, p.h);
    R("#9a6a45", p.x, p.y + 1, p.w, p.h - 2);
    R("#b07e57", p.x + 1, p.y, p.w - 2, 1);
    R("#865a39", p.x + 2, p.y + 3, p.w - 4, 1);
    R("#865a39", p.x + 2, p.y + 6, p.w - 4, 1);
    if (!p.plant) {
      R("#b5875f", p.x + Math.floor(p.w / 2) - 1, p.y + 4, 3, 1);
    }
  }

  // ---------- Plants ----------
  function drawPlant(p, d) {
    const x = p.cx, by = p.by;
    const fc = FLOWER[d.variety % FLOWER.length];
    const sway = Math.round(Math.sin(t * 1.4 + d.seed) * 0.6);
    const droop = d.mood === "droop", bloom = d.mood === "bloom";
    const leaf = droop ? "#b2a65a" : "#5fae4f", leafD = droop ? "#958a45" : "#3f8a3a", stem = droop ? "#8f8a4a" : "#3f7a3a";
    let top = by - 4;
    if (d.stage === 0) {
      R("#7a4f30", x - 3, by - 1, 7, 1); R("#8f603d", x - 2, by - 2, 5, 1);
      R("#b08a5a", x + 5, by - 6, 1, 6); R("#e6cf9c", x + 4, by - 9, 3, 3);
      if (Math.sin(t * 3 + d.seed) > 0.3) R("#fffbd0", x, by - 4);
      top = by - 10;
    } else if (d.stage === 1) {
      R("#7a4f30", x - 2, by - 1, 5, 1);
      R(stem, x, by - 6, 1, 5);
      if (droop) { R(leaf, x - 2, by - 4, 2, 1); R(leaf, x - 3, by - 3); R(leaf, x + 1, by - 4, 2, 1); R(leaf, x + 3, by - 3); }
      else { R(leaf, x - 2 + sway, by - 6, 2, 1); R(leaf, x - 3 + sway, by - 7, 2, 1); R(leaf, x + 1 + sway, by - 6, 2, 1); R(leaf, x + 2 + sway, by - 7, 2, 1); }
      if (bloom) R(fc, x + sway, by - 8);
      top = by - 9;
    } else if (d.stage === 2) {
      const h = 12;
      R("#7a4f30", x - 2, by - 1, 5, 1);
      R(stem, x, by - h, 1, h);
      for (const k of [3, 6, 9]) {
        const yy = by - k, s = k > 6 ? sway : 0;
        if (droop) { R(leaf, x - 3 + s, yy, 3, 1); R(leafD, x - 3 + s, yy + 1); R(leaf, x + 1 + s, yy, 3, 1); R(leafD, x + 3 + s, yy + 1); }
        else { R(leaf, x - 3 + s, yy, 3, 1); R(leafD, x - 4 + s, yy - 1, 2, 1); R(leaf, x + 1 + s, yy, 3, 1); R(leafD, x + 3 + s, yy - 1, 2, 1); }
      }
      if (droop) { R(stem, x + 1 + sway, by - h - 1); R(leaf, x + 2 + sway, by - h); }
      else R(leaf, x - 1 + sway, by - h - 1, 3, 2);
      if (bloom) {
        for (const [dx, dy] of [[0, -h - 3], [-4, -8], [4, -5]]) {
          const fx = x + dx + sway, fy = by + dy;
          R(fc, fx - 1, fy, 3, 1); R(fc, fx, fy - 1, 1, 3); R("#f5c542", fx, fy);
        }
      }
      top = by - h - 5;
    } else {
      R("#6b4329", x - 2, by - 1, 5, 1);
      R("#7a5236", x - 1, by - 13, 3, 12);
      R("#8f6544", x, by - 12, 1, 10);
      const cy = by - 19, r = droop ? 6 : 8;
      disc(droop ? "#a99a48" : "#4f9445", x + sway, cy, r);
      disc(droop ? "#c7b45c" : "#6bb35a", x - 2 + sway, cy - 2, r - 3);
      if (!droop) { R("#86c870", x - 4 + sway, cy - 4, 2, 1); R("#3f7e39", x + 4 + sway, cy + 3, 2, 1); }
      if (bloom) {
        const fruitC = d.variety >= 4 ? fc : fc;
        for (let i = 0; i < 7; i++) {
          const a = hash(d.seed + i) * 6.28, rr = 2 + hash(d.seed + i + 50) * (r - 2);
          const fx = Math.round(x + sway + Math.cos(a) * rr), fy = Math.round(cy + Math.sin(a) * rr);
          if (d.variety >= 4) { R(fruitC, fx, fy, 2, 2); R("#ffffff", fx, fy); }
          else { R(fruitC, fx - 1, fy, 3, 1); R(fruitC, fx, fy - 1, 1, 3); R("#f5c542", fx, fy); }
        }
      }
      if (droop) { R("#c7a04a", x - 6, by, 2, 1); R("#b08a3e", x + 5, by + 1, 2, 1); }
      top = cy - r - 1;
    }
    if (d.due) {
      const yy = top - 8 + Math.round(Math.sin(t * 4 + d.seed) * 1.2);
      R("#3f7a3a", x - 3, yy - 1, 7, 9);
      R("#ffffff", x - 2, yy, 5, 7);
      R("#e0483e", x, yy + 1, 1, 3); R("#e0483e", x, yy + 5);
      R("#3f7a3a", x, yy + 8, 1, 2);
    }
    p.top = top - (d.due ? 10 : 0);
  }

  // ---------- Old Basil ----------
  function drawBob() {
    const walking = bob.mode === "walk";
    const leg = walking ? (Math.floor(t * 6) % 2 ? "a" : "b") : "idle";
    const blink = t % 4.2 > 4.0;
    const spr = SPR[`${leg}${bob.facing}${blink ? "blink" : ""}`];
    const breathe = !walking && Math.sin(t * 2) > 0.6 ? 1 : 0;
    const x = Math.round(bob.x - 7), y = Math.round(bob.y - 20 + (walking ? (Math.floor(t * 6) % 2) * -1 : 0));
    ctx.globalAlpha = 0.25; R("#2f3a2a", x + 2, Math.round(bob.y) - 1, 10, 2); ctx.globalAlpha = 1;
    if (breathe) { ctx.drawImage(spr, 0, 0, 14, 16, x, y + 1, 14, 16); ctx.drawImage(spr, 0, 16, 14, 4, x, y + 16, 14, 4); }
    else ctx.drawImage(spr, x, y);
    if (bob.mode === "water") {
      const dir = bob.facing === "R" ? 1 : -1;
      const hx = Math.round(bob.x + dir * 7), hy = Math.round(bob.y - 7);
      R("#7fb2d9", dir > 0 ? hx : hx - 4, hy - 2, 4, 3);
      R("#5d93bd", dir > 0 ? hx : hx - 4, hy - 2, 4, 1);
      R("#7fb2d9", dir > 0 ? hx + 4 : hx - 6, hy - 3, 2, 1);
      for (let k = 0; k < 3; k++) {
        const ph = (t * 2.5 + k / 3) % 1;
        R("#9fd0f5", dir > 0 ? hx + 6 + k : hx - 7 - k, hy - 2 + ph * 9);
      }
    }
  }

  function stepBob(dt) {
    if (bob.mode === "walk") {
      const dx = bob.tx - bob.x, dy = bob.ty - bob.y, dist = Math.hypot(dx, dy);
      const sp = 34 * dt;
      if (dist <= sp) {
        bob.x = bob.tx; bob.y = bob.ty; bob.mode = "idle";
        const cb = bob.onArrive; bob.onArrive = null; if (cb) cb();
      } else {
        bob.x += (dx / dist) * sp; bob.y += (dy / dist) * sp;
        if (Math.abs(dx) > 0.5) bob.facing = dx > 0 ? "R" : "L";
      }
    } else if (bob.mode === "water" && performance.now() > bob.waterUntil) {
      bob.mode = "idle";
      const cb = bob.onArrive; bob.onArrive = null; if (cb) cb();
    }
  }

  // ---------- Speech bubble ----------
  function placeBubble() {
    if (!bubble) return;
    const now = performance.now();
    if (!say.text || (say.until && now > say.until)) { if (!bubble.hidden) { bubble.hidden = true; say.onTap = null; } return; }
    bubble.hidden = false;
    const bw = bubble.offsetWidth, cssW = LW * S;
    const hx = bob.x * S;
    let left = hx - bw * 0.3;
    left = Math.max(4, Math.min(cssW - bw - 4, left));
    bubble.style.left = left + "px";
    bubble.style.top = Math.max(4, (bob.y - 23) * S - bubble.offsetHeight) + "px";
    const tail = Math.max(12, Math.min(bw - 12, hx - left));
    bubble.style.setProperty("--tail", tail + "px");
  }

  // ---------- Loop ----------
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (!active) return;
    acc += dt; t += dt;
    stepBob(dt);
    if (acc < 1 / 24) { placeBubble(); return; }
    acc = 0;
    const per = period();
    drawSky(per);
    drawGround(per);
    drawHouse(per);
    plots.forEach(drawPlot);
    const items = plots.filter((p) => p.plant).map((p) => ({ y: p.by, draw: () => drawPlant(p, p.plant) }));
    items.push({ y: bob.y, draw: drawBob });
    items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
    if (per === "evening") {
      for (const f of flies) {
        const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + f.p));
        ctx.globalAlpha = a;
        R("#fff59a", f.x + Math.sin(t * 0.5 + f.p) * 8, f.y + Math.cos(t * 0.7 + f.p) * 5);
        ctx.globalAlpha = 1;
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const f = flies[i];
        const bx = (f.x + t * 6) % (LW + 20) - 10, by = f.y - 10 + Math.sin(t * 2 + f.p) * 6;
        const flap = Math.floor(t * 8 + i) % 2;
        R(i ? "#f5d04a" : "#ffffff", bx - 1, by - flap, 1, 1 + flap); R(i ? "#f5d04a" : "#ffffff", bx + 1, by - flap, 1, 1 + flap); R("#3a2a1e", bx, by);
      }
    }
    placeBubble();
  }

  // ---------- Input ----------
  function onTap(e) {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * LW, y = ((e.clientY - r.top) / r.height) * LH;
    if (Math.abs(x - bob.x) <= 8 && y >= bob.y - 22 && y <= bob.y + 2) { opts.onGardenerTap && opts.onGardenerTap(); return; }
    for (const p of [...plots].reverse()) {
      const top = p.plant ? Math.min(p.top ?? p.y - 10, p.y - 8) : p.y - 2;
      if (x >= p.x - 2 && x <= p.x + p.w + 2 && y >= top && y <= p.y + p.h + 2) {
        if (p.plant) opts.onPlantTap && opts.onPlantTap(p.plant.id);
        else opts.onEmptyTap && opts.onEmptyTap();
        return;
      }
    }
  }

  // ---------- API ----------
  const plotOf = (id) => plots.find((p) => p.plant && p.plant.id === id);
  window.Garden = {
    init(el, o) {
      wrap = el; opts = o || {};
      canvas = el.querySelector("canvas");
      bubble = el.querySelector(".bubble");
      ctx = canvas.getContext("2d");
      canvas.addEventListener("click", onTap);
      bubble.addEventListener("click", (e) => { e.stopPropagation(); const f = say.onTap; if (f) { say.text = ""; f(); } });
      layout();
      new ResizeObserver(() => { const w = wrap.clientWidth; if (w && Math.ceil(w / S) !== LW) layout(); }).observe(wrap);
      raf = requestAnimationFrame(frame);
    },
    setPlants(list) {
      plants = list.map((p) => ({ ...p, seed: seedOf(p.id) }));
      layout();
    },
    setActive(v) { active = v; last = 0; },
    say(text, ms = 6000, onTapFn = null) {
      say = { text, until: ms ? performance.now() + ms : 0, onTap: onTapFn };
      if (bubble) {
        bubble.querySelector(".txt").textContent = text;
        bubble.classList.toggle("tap", !!onTapFn);
      }
    },
    hush() { say.text = ""; },
    walkTo(id, cb) {
      const p = plotOf(id);
      if (!p) { cb && cb(); return; }
      bob.tx = Math.max(8, p.cx - 9); bob.ty = p.by + 1; bob.mode = "walk"; bob.onArrive = () => { bob.facing = "R"; cb && cb(); };
    },
    water(ms = 1600, cb) { bob.mode = "water"; bob.facing = "R"; bob.waterUntil = performance.now() + ms; bob.onArrive = cb; },
    goHome(cb) { bob.tx = HOUSE_X + 8; bob.ty = GY + 14; bob.mode = "walk"; bob.onArrive = () => { bob.facing = "R"; cb && cb(); }; },
    period
  };
})();
