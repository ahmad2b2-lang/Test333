// Regret Challenge — calm nature soundtracks, made live in the browser (Web Audio).
// No audio files: rain, stream, birds and night crickets are generated from noise
// and simple tones, with an optional soft pentatonic melody on top.
(() => {
  "use strict";

  const TRACKS = {
    rain: "Gentle rain",
    stream: "Forest stream",
    birds: "Birds at dawn",
    night: "Night crickets & wind"
  };

  let ctx = null, master = null, sfxGain = null, melodyBus = null;
  let current = null;          // {name, gain, nodes, timer}
  let melodyTimer = null, nextNote = 0;
  let noise = {};
  const st = load();

  function load() {
    try { return Object.assign({ on: false, track: "rain", vol: 0.6, melody: true }, JSON.parse(localStorage.getItem("rc-music") || "{}")); }
    catch { return { on: false, track: "rain", vol: 0.6, melody: true }; }
  }
  function save() { try { localStorage.setItem("rc-music", JSON.stringify(st)); } catch {} }

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = st.on ? st.vol : 0;
    master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(ctx.destination);
    // melody bus with a soft echo
    melodyBus = ctx.createGain(); melodyBus.gain.value = 1;
    const delay = ctx.createDelay(1.5); delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
    melodyBus.connect(master); melodyBus.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(master);
    noise.white = makeNoise("white"); noise.pink = makeNoise("pink"); noise.brown = makeNoise("brown");
    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (st.on) ctx.resume();
    });
    return true;
  }

  function makeNoise(kind) {
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    }
    // smooth the loop seam
    for (let i = 0; i < 2000; i++) { const f = i / 2000; d[len - 2000 + i] = d[len - 2000 + i] * (1 - f) + d[i] * f; }
    return buf;
  }
  function loopNoise(kind, out) {
    const s = ctx.createBufferSource(); s.buffer = noise[kind]; s.loop = true;
    s.loopStart = 0; s.loopEnd = noise[kind].duration - 0.05;
    s.playbackRate.value = 0.97 + Math.random() * 0.06;
    s.connect(out); s.start(ctx.currentTime, Math.random() * 3);
    return s;
  }
  function filt(type, f, q = 0.7) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function g(v) { const n = ctx.createGain(); n.gain.value = v; return n; }
  function lfo(rate, depth, target) {
    const o = ctx.createOscillator(); o.frequency.value = rate;
    const d = g(depth); o.connect(d); d.connect(target); o.start(); return o;
  }
  function panner(p) { if (ctx.createStereoPanner) { const s = ctx.createStereoPanner(); s.pan.value = p; return s; } return g(1); }

  // short sound events -------------------------------------------------------
  function blip(out, t, f1, f2, dur, vol, type = "sine") {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3)); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(e); e.connect(out); o.start(t); o.stop(t + dur + 0.02);
  }
  function drop(out, t, vol) {
    const s = ctx.createBufferSource(); s.buffer = noise.white;
    const f = filt("bandpass", 2500 + Math.random() * 4000, 3);
    const e = ctx.createGain(); e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(f); f.connect(e); e.connect(out); s.start(t, Math.random() * 3, 0.06);
  }

  // tracks -------------------------------------------------------------------
  const BUILD = {
    rain(out) {
      const a = filt("lowpass", 1600); const ga = g(0.55); loopNoise("pink", a); a.connect(ga); ga.connect(out);
      const b = filt("lowpass", 380); const gb = g(0.5); loopNoise("brown", b); b.connect(gb); gb.connect(out);
      const hp = filt("highpass", 3000); const gh = g(0.08); loopNoise("white", hp); hp.connect(gh); gh.connect(out);
      lfo(0.07, 0.12, ga.gain);
      const pl = panner(-0.4), pr = panner(0.4); pl.connect(out); pr.connect(out);
      return (t0, t1) => { for (let t = t0; t < t1; t += 0.02 + Math.random() * 0.09) drop(Math.random() < 0.5 ? pl : pr, t, 0.05 + Math.random() * 0.12); };
    },
    stream(out) {
      const b1 = filt("bandpass", 700, 0.6); const g1 = g(0.9); loopNoise("brown", b1); b1.connect(g1); g1.connect(out);
      lfo(0.18, 260, b1.frequency);
      const b2 = filt("bandpass", 2400, 1.2); const g2 = g(0.22); loopNoise("pink", b2); b2.connect(g2); g2.connect(out);
      lfo(0.9, 700, b2.frequency); lfo(0.33, 0.08, g2.gain);
      const pl = panner(-0.3), pr = panner(0.35); pl.connect(out); pr.connect(out);
      return (t0, t1) => {
        for (let t = t0; t < t1; t += 0.08 + Math.random() * 0.35) {
          const f = 280 + Math.random() * 700;
          blip(Math.random() < 0.5 ? pl : pr, t, f, f * (1.6 + Math.random()), 0.04 + Math.random() * 0.05, 0.035);
        }
      };
    },
    birds(out) {
      const w = filt("lowpass", 500); const gw = g(0.35); loopNoise("brown", w); w.connect(gw); gw.connect(out);
      lfo(0.05, 0.15, gw.gain);
      const leaves = filt("bandpass", 3000, 0.8); const gl = g(0.03); loopNoise("pink", leaves); leaves.connect(gl); gl.connect(out);
      let next = 0;
      return (t0, t1) => {
        if (next < t0) next = t0 + 0.5;
        while (next < t1) {
          const p = panner(Math.random() * 1.6 - 0.8); p.connect(out);
          const base = 2300 + Math.random() * 2200, n = 2 + Math.floor(Math.random() * 4), kind = Math.random();
          for (let i = 0; i < n; i++) {
            const t = next + i * (0.09 + Math.random() * 0.06);
            if (kind < 0.4) blip(p, t, base, base * 1.35, 0.07, 0.05);
            else if (kind < 0.75) blip(p, t, base * 1.3, base * 0.9, 0.09, 0.045);
            else blip(p, t, base, base * (i % 2 ? 1.2 : 0.85), 0.05, 0.04);
          }
          next += 1.2 + Math.random() * 3.8;
        }
      };
    },
    night(out) {
      const w = filt("lowpass", 450, 0.8); const gw = g(0.55); loopNoise("pink", w); w.connect(gw); gw.connect(out);
      lfo(0.06, 220, w.frequency); lfo(0.04, 0.2, gw.gain);
      const crickets = [{ f: 4300, pan: -0.5, next: 0, gap: 0.62 }, { f: 4700, pan: 0.45, next: 0.3, gap: 0.81 }];
      crickets.forEach((c) => { c.p = panner(c.pan); c.p.connect(out); });
      return (t0, t1) => {
        for (const c of crickets) {
          if (c.next < t0) c.next = t0 + Math.random() * 0.4;
          while (c.next < t1) {
            for (let k = 0; k < 3; k++) blip(c.p, c.next + k * 0.035, c.f, c.f * 0.995, 0.022, 0.018);
            c.next += c.gap * (0.85 + Math.random() * 0.3);
            if (Math.random() < 0.08) c.next += 1.5;
          }
        }
      };
    }
  };

  // soft pentatonic melody -----------------------------------------------------
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
  let lastIdx = 4;
  function note(t, f, vol) {
    for (const [type, mul, v] of [["triangle", 1, vol], ["sine", 2, vol * 0.25]]) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * mul;
      const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(v, t + 0.06); e.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      o.connect(e); e.connect(melodyBus); o.start(t); o.stop(t + 3);
    }
  }
  function melodyTick() {
    if (!ctx || !st.on || !st.melody) return;
    const now = ctx.currentTime;
    if (nextNote < now) nextNote = now + 0.3;
    while (nextNote < now + 0.5) {
      lastIdx = Math.max(0, Math.min(SCALE.length - 1, lastIdx + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
      note(nextNote, SCALE[lastIdx], 0.05);
      if (Math.random() < 0.2) note(nextNote, SCALE[Math.max(0, lastIdx - 3)] / 2, 0.035);
      nextNote += [1.2, 1.6, 2.0, 2.4, 3.2][Math.floor(Math.random() * 5)];
    }
  }

  function startTrack(name) {
    stopTrack();
    const out = g(0); out.connect(master);
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    const sched = BUILD[name](out);
    let ahead = ctx.currentTime;
    const timer = setInterval(() => {
      const now = ctx.currentTime;
      if (ahead < now) ahead = now;
      const until = now + 0.4;
      if (until > ahead) { sched(ahead, until); ahead = until; }
    }, 150);
    current = { name, out, timer };
  }
  function stopTrack() {
    if (!current) return;
    const c = current; current = null;
    clearInterval(c.timer);
    c.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => { try { c.out.disconnect(); } catch {} }, 2500);
  }

  function apply() {
    if (!ctx) return;
    master.gain.setTargetAtTime(st.on ? st.vol : 0, ctx.currentTime, 0.3);
    if (st.on) {
      if (ctx.state === "suspended") ctx.resume();
      if (!current || current.name !== st.track) startTrack(st.track);
      if (!melodyTimer) melodyTimer = setInterval(melodyTick, 200);
    } else {
      stopTrack();
    }
  }

  window.Sound = {
    TRACKS,
    state: () => ({ ...st }),
    // call from a tap: browsers only allow sound to start after the user touches the page
    unlock() { if (st.on && ensure()) apply(); },
    set(p) { Object.assign(st, p); save(); if (ensure()) apply(); },
    sfx(kind) {
      if (!ensure()) return;
      const t = ctx.currentTime + 0.02;
      sfxGain.gain.value = 0.25 + 0.5 * st.vol;
      if (kind === "plant") {
        blip(sfxGain, t, 240, 520, 0.12, 0.25);
        [1318.5, 1975.5].forEach((f, i) => blip(sfxGain, t + 0.12 + i * 0.1, f, f, 0.5, 0.08, "triangle"));
      } else if (kind === "good") {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(sfxGain, t + i * 0.09, f, f, 0.6, 0.09, "triangle"));
      } else if (kind === "soft") {
        [659.25, 523.25, 440].forEach((f, i) => blip(sfxGain, t + i * 0.14, f, f, 0.7, 0.07, "triangle"));
      } else if (kind === "tap") {
        blip(sfxGain, t, 880, 990, 0.06, 0.05, "triangle");
      }
    }
  };
})();
