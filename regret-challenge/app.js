// Regret Challenge — main app: login, decisions, look-back check-ins, results,
// optional privacy lock (AES-GCM on the device with a key file), music and garden.
(() => {
  "use strict";

  // ---------- Settings ----------
  const SUPABASE_URL = "https://bhfgwlkzkbwcwyoypwhy.supabase.co";
  const SUPABASE_KEY = "sb_publishable_9YylflVQca-62NHsBKSTeA_GY896nj3";
  const EMAIL_DOMAIN = "players.regret-challenge.local"; // hidden; players only see usernames
  const STAGES = [1, 3, 12];                            // months
  const PIN_MIN = 4, PIN_MAX = 8;
  const ENC = "enc:v1:";

  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "regret-challenge-auth" }
  });

  // ---------- Mobile-app feel (iPhone ignores user-scalable=no) ----------
  ["gesturestart", "gesturechange", "gestureend"].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  document.addEventListener("touchmove", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  let toastT = 0;
  function toast(msg, ms = 2800) {
    const t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms);
  }
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  function addMonths(date, m) {
    const d = new Date(date), day = d.getDate();
    d.setMonth(d.getMonth() + m);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }
  const stageName = (m) => (m === 12 ? "1 year" : m === 1 ? "1 month" : `${m} months`);
  const stageHead = (m) => (m === 1 ? "🌱 1-month look back" : m === 3 ? "🌿 3-month look back" : "🌳 1-year look back");
  function confWord(v) {
    return v <= 20 ? "Poor decision" : v <= 40 ? "Doubtful" : v <= 60 ? "Not sure" : v <= 80 ? "Fairly good" : "Definitely great";
  }
  function rateWord(v) {
    return v <= 20 ? "😣 I regret it" : v <= 40 ? "😕 Mostly regret" : v <= 60 ? "😐 A bit of both" : v <= 80 ? "🙂 Mostly worth it" : "😄 Totally worth it";
  }
  const moodOf = (r) => (r == null ? "new" : r >= 60 ? "bloom" : r <= 40 ? "droop" : "mid");
  const colorOf = (v) => (v >= 60 ? "#4f9a45" : v <= 40 ? "#d9655b" : "#e0a92e");

  // test time (hidden in Settings): pretend months have passed on this device
  const realNow = () => Date.now();
  const offset = () => Number(store.get("rc-time-offset", "0")) || 0;
  const now = () => realNow() + offset();
  function showTestBar() {
    const months = Number(store.get("rc-time-months", "0")) || 0;
    $("testbar").hidden = !offset();
    $("test-off").textContent = months === 12 ? "+1 year" : `+${months} month${months === 1 ? "" : "s"}`;
  }

  // ---------- State ----------
  const S = {
    uid: null, player: null, key: null, keyB64: null,
    decisions: [],      // newest last; {id, raw, title, note, locked, confidence, decided_for, plant, created_at, checks:{1,3,12}}
    skipLookBacks: false, greeted: false, screen: "s-boot", queue: [], checkOpen: null
  };

  // ---------- Screens ----------
  const SCREENS = ["s-boot", "s-auth", "s-key", "s-home", "s-new", "s-detail", "s-results", "s-settings"];
  function show(id, push = true) {
    SCREENS.forEach((s) => ($(s).hidden = s !== id));
    const wasHome = S.screen === "s-home";
    S.screen = id;
    if (id !== "s-home" && S.checkOpen === "walking") S.checkOpen = null;
    Garden.setActive(id === "s-home");
    window.scrollTo(0, 0);
    if (push && ["s-new", "s-detail", "s-results", "s-settings"].includes(id)) history.pushState({ s: id }, "");
    if (id === "s-home" && !wasHome) setTimeout(homeArrived, 350);
  }
  document.querySelectorAll("[data-back]").forEach((b) => (b.onclick = () => history.back()));
  window.addEventListener("popstate", () => {
    const open = [...document.querySelectorAll(".modal")].find((m) => !m.hidden);
    if (open && open.id !== "m-check") { open.hidden = true; return; }
    if (["s-new", "s-detail", "s-results", "s-settings"].includes(S.screen)) { renderHome(); show("s-home", false); }
  });
  function goHome() { if (history.state && history.state.s) history.back(); else { renderHome(); show("s-home", false); } }

  // ---------- Ask dialog ----------
  function ask(head, bodyHtml, yes = "OK", no = "Cancel", danger = false) {
    return new Promise((res) => {
      $("a-head").textContent = head; $("a-body").innerHTML = bodyHtml;
      $("a-yes").textContent = yes; $("a-no").textContent = no; $("a-no").hidden = !no;
      $("a-yes").className = danger ? "btn danger" : "btn";
      $("m-ask").hidden = false;
      $("a-yes").onclick = () => { $("m-ask").hidden = true; res(true); };
      $("a-no").onclick = () => { $("m-ask").hidden = true; res(false); };
    });
  }

  // ---------- Crypto (privacy lock) ----------
  const toB64 = (u8) => { let s = ""; u8.forEach((b) => (s += String.fromCharCode(b))); return btoa(s); };
  const fromB64 = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const checkText = () => `regret-challenge-ok:${S.uid}`;
  async function importKey(b64) { return crypto.subtle.importKey("raw", fromB64(b64), "AES-GCM", false, ["encrypt", "decrypt"]); }
  async function enc(text, key = S.key) {
    if (text == null || text === "") return text;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
    const all = new Uint8Array(12 + ct.length); all.set(iv); all.set(ct, 12);
    return ENC + toB64(all);
  }
  const isEnc = (s) => typeof s === "string" && s.startsWith(ENC);
  async function dec(s, key = S.key) {
    if (!isEnc(s)) return s;
    if (!key) return null;
    try {
      const all = fromB64(s.slice(ENC.length));
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.slice(0, 12) }, key, all.slice(12));
      return new TextDecoder().decode(pt);
    } catch { return null; }
  }
  const keyStoreName = () => `rc-key-${S.uid}`;
  function downloadKey() {
    const body = JSON.stringify({ app: "regret-challenge", v: 1, user: S.player.username, uid: S.uid, key: S.keyB64, made: new Date().toISOString() }, null, 1);
    const blob = new Blob([body], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = keyFileName();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  const keyFileName = () => `regret-challenge-${(S.player?.username || "player").replace(/[^\p{L}\p{N}_-]+/gu, "-")}.key`;

  // ---------- Auth ----------
  const normalizeName = (u) => u.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  async function emailFor(u) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(u));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `u${hex.slice(0, 40)}@${EMAIL_DOMAIN}`;
  }
  const passwordFor = (pin) => `rc-pin-${pin}`;
  let mode = "login", pin = "", firstPin = null;
  function renderPin() {
    const slots = Math.max(PIN_MIN, pin.length);
    $("pin-dots").innerHTML = Array.from({ length: slots }, (_, i) => `<i class="${i < pin.length ? "f" : ""}"></i>`).join("");
    $("auth-submit").disabled = pin.length < PIN_MIN;
  }
  function setPinStep() {
    const signup = mode === "signup";
    $("pin-label").textContent = !signup ? "PIN" : firstPin === null ? "Choose a PIN (at least 4 digits)" : "Enter the PIN again to confirm";
    $("auth-submit").textContent = !signup ? "Log in" : firstPin === null ? "Next" : "Create account";
    $("pin-restart").hidden = !(signup && firstPin !== null);
    pin = ""; renderPin();
  }
  function setMode(m) {
    mode = m; firstPin = null;
    $("tab-login").classList.toggle("on", m === "login");
    $("tab-signup").classList.toggle("on", m === "signup");
    $("f-user").placeholder = m === "signup" ? "Choose a username (any language)" : "Username";
    $("auth-error").textContent = "";
    setPinStep();
  }
  $("tab-login").onclick = () => setMode("login");
  $("tab-signup").onclick = () => setMode("signup");
  $("pin-restart").onclick = () => { firstPin = null; $("auth-error").textContent = ""; setPinStep(); };
  function pressKey(k) {
    if (k === "back") pin = pin.slice(0, -1);
    else if (k === "clear") pin = "";
    else if (/^[0-9]$/.test(k) && pin.length < PIN_MAX) pin += k;
    $("auth-error").textContent = "";
    renderPin();
  }
  $("keypad").onclick = (e) => { const b = e.target.closest("button"); if (b) pressKey(b.dataset.k); };
  document.addEventListener("keydown", (e) => {
    if ($("s-auth").hidden || e.target === $("f-user")) return;
    const k = e.key.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    if (/^[0-9]$/.test(k)) pressKey(k);
    else if (e.key === "Backspace") pressKey("back");
    else if (e.key === "Enter" && pin.length >= PIN_MIN) $("auth-form").requestSubmit();
  });
  $("f-user").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("f-user").blur(); } });

  $("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const err = $("auth-error");
    const username = normalizeName($("f-user").value);
    err.textContent = "";
    if ([...username].length < 2) { err.textContent = "Type a username (at least 2 letters)"; return; }
    if (pin.length < PIN_MIN) { err.textContent = "The PIN needs at least 4 digits"; return; }
    if (mode === "signup" && firstPin === null) { firstPin = pin; setPinStep(); return; }
    if (mode === "signup" && pin !== firstPin) { firstPin = null; setPinStep(); err.textContent = "The PINs didn't match. Choose your PIN again."; return; }
    const btn = $("auth-submit"); btn.disabled = true;
    try {
      if (mode === "signup") {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/regret-signup`, {
          method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
          body: JSON.stringify({ username, pin })
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          firstPin = null; setPinStep();
          err.textContent = body.error === "username_taken" ? "That username is taken. Pick another one." : "Couldn't create the account. Try again.";
          return;
        }
      }
      const { error } = await sb.auth.signInWithPassword({ email: await emailFor(username), password: passwordFor(pin) });
      if (error) {
        pin = ""; renderPin();
        err.textContent = /invalid/i.test(error.message) ? "Wrong username or PIN" : "Couldn't log in. Check your connection.";
        return;
      }
      firstPin = null; pin = ""; renderPin();
      S.greeted = false; S.skipLookBacks = false;
      await enterApp(true);
    } catch {
      err.textContent = "No connection. Check your internet.";
    } finally {
      btn.disabled = pin.length < PIN_MIN;
    }
  };

  // ---------- Loading ----------
  // fresh = the player just typed their PIN (not reopening a saved session)
  async function enterApp(fresh = false) {
    show("s-boot", false);
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { setMode("login"); show("s-auth", false); return; }
    S.uid = session.user.id;
    try {
      const { data: player, error } = await sb.from("rc_players").select("*").maybeSingle();
      if (error) throw error;
      if (!player) {
        await sb.auth.signOut();
        setMode("login"); show("s-auth", false);
        $("auth-error").textContent = "This account isn't a Regret Challenge account.";
        return;
      }
      S.player = player;
      // key on this device?
      S.key = null; S.keyB64 = null;
      if (fresh) store.del(keyStoreName());   // every login asks for the key file again
      const saved = store.get(keyStoreName());
      if (!player.locked && saved) store.del(keyStoreName());
      if (player.locked && saved) {
        try {
          const k = await importKey(saved);
          if ((await dec(player.key_check, k)) === checkText()) { S.key = k; S.keyB64 = saved; }
          else store.del(keyStoreName());
        } catch { store.del(keyStoreName()); }
      }
      await loadData();
      if (player.locked && !S.key) { openKeyScreen(); return; }
      renderHome();
      show("s-home", false);
      if (fresh && !player.locked && !store.get(`rc-lock-asked-${S.uid}`)) setTimeout(offerLock, 600);
    } catch (e) {
      console.error(e);
      show("s-auth", false);
      $("auth-error").textContent = "Couldn't load your garden. Check your connection and log in again.";
    }
  }

  async function loadData() {
    const [{ data: ds, error: e1 }, { data: cs, error: e2 }] = await Promise.all([
      sb.from("rc_decisions").select("*").order("created_at", { ascending: true }),
      sb.from("rc_checkins").select("*")
    ]);
    if (e1 || e2) throw e1 || e2;
    const byId = new Map();
    S.decisions = [];
    for (const d of ds) {
      const item = { ...d, raw: { title: d.title, note: d.note }, checks: {} };
      byId.set(d.id, item); S.decisions.push(item);
    }
    for (const c of cs) { const d = byId.get(c.decision_id); if (d) d.checks[c.stage] = { ...c, rawNote: c.note }; }
    await decryptAll();
  }
  async function decryptAll() {
    for (const d of S.decisions) {
      d.title = await dec(d.raw.title);
      d.note = await dec(d.raw.note);
      d.locked = d.title === null;
      for (const c of Object.values(d.checks)) c.note = await dec(c.rawNote);
    }
  }

  // ---------- Decisions helpers ----------
  function dueStages(d) {
    const t = now();
    return STAGES.filter((m) => !d.checks[m] && addMonths(d.created_at, m).getTime() <= t);
  }
  function latest(d) {
    for (const m of [12, 3, 1]) if (d.checks[m]) return d.checks[m];
    return null;
  }
  function nextDate(d) {
    const m = STAGES.find((x) => !d.checks[x]);
    return m ? addMonths(d.created_at, m) : null;
  }
  function plantEmoji(d) {
    const l = latest(d), n = Object.keys(d.checks).length;
    if (l && l.rating >= 60) return n >= 3 ? "🌳" : "🌸";
    if (l && l.rating <= 40) return "🥀";
    return ["🌰", "🌱", "🌿", "🌳"][n];
  }
  function buildQueue() {
    S.queue = [];
    if (S.player?.locked && !S.key) return;
    for (const d of S.decisions) for (const m of dueStages(d)) S.queue.push({ d, m });
  }
  function accuracy(d) {
    const l = latest(d);
    return l ? 100 - Math.abs(d.confidence - l.rating) : null;
  }

  // ---------- Home ----------
  function renderHome() {
    const locked = S.player?.locked && !S.key;
    $("lockbar").hidden = !locked;
    Garden.setPlants(S.decisions.map((d) => {
      const l = latest(d);
      return { id: d.id, stage: Object.keys(d.checks).length, mood: moodOf(l?.rating), variety: d.plant, due: !locked && dueStages(d).length > 0 };
    }));
    const list = $("list");
    $("list-count").textContent = S.decisions.length ? `${S.decisions.length} planted` : "";
    if (!S.decisions.length) {
      list.innerHTML = `<div class="empty">Your garden is empty.<br>Plant your first decision with the green button 🌱</div>`;
    } else {
      const sorted = [...S.decisions].sort((a, b) => (dueStages(b).length > 0) - (dueStages(a).length > 0) || new Date(b.created_at) - new Date(a.created_at));
      list.innerHTML = sorted.map((d) => {
        const due = !locked && dueStages(d).length > 0;
        const nd = nextDate(d);
        const sub = [`Planted ${fmtDate(d.created_at)}`, `${d.confidence}% sure`];
        const l = latest(d);
        if (l) sub.push(`turned out ${l.rating}`);
        if (!due && nd) sub.push(`next look back ${fmtDate(nd)}`);
        if (!nd) sub.push("all look backs done");
        return `<button class="dec" data-id="${d.id}"><span class="em">${plantEmoji(d)}</span><span class="grow">
          <div class="t">${d.locked ? "🔒 Locked decision" : esc(d.title)}${due ? '<span class="due">Look back now</span>' : ""}</div>
          <div class="s">${sub.join(" · ")}</div></span></button>`;
      }).join("");
    }
    $("b-music").textContent = Sound.state().on ? "🎵" : "🔇";
  }
  $("list").onclick = (e) => { const b = e.target.closest(".dec"); if (b) openDetail(b.dataset.id); };

  function greetWord() {
    const h = new Date().getHours();
    return h >= 5 && h < 12 ? "Good morning" : h < 17 && h >= 12 ? "Good afternoon" : h >= 17 && h < 22 ? "Good evening" : "Hello, night owl";
  }
  const nameCap = () => { const n = S.player?.username || ""; return n.charAt(0).toUpperCase() + n.slice(1); };

  // runs each time the garden screen is shown
  function homeArrived() {
    if (S.screen !== "s-home" || S.planting) return;
    if (!$("m-ask").hidden) { setTimeout(homeArrived, 1500); return; }
    buildQueue();
    if (S.queue.length && !S.skipLookBacks && !S.checkOpen) { startLookBacks(); return; }
    if (!S.greeted) {
      S.greeted = true;
      const msg = !S.decisions.length
        ? `${greetWord()}, <b>${esc(nameCap())}</b>! I'm Old Basil, the gardener. Every decision you plant here grows as time tells how it went.`
        : `${greetWord()}, <b>${esc(nameCap())}</b>! What are you deciding today?`;
      sayHtml(msg, 7000);
    }
  }
  function sayHtml(html, ms, onTap) {
    Garden.say("…", ms, onTap);
    document.querySelector("#scene .bubble .txt").innerHTML = html;
  }

  const TIPS = [
    "Every plant here is a choice you made. Some bloom, some droop — all of them teach.",
    "A drooping plant isn't a failure. It's a lesson you can see.",
    "When you're very sure, write down why. Future you will want to know.",
    "Small daily decisions count too. Plant those as well!",
    "I'll come and find you when a plant is ready for a look back.",
    "Tap any plant to see the decision behind it.",
    "Feeling stuck? Plant the decision and let time be the judge."
  ];
  let tipIdx = Math.floor(Math.random() * TIPS.length);
  function gardenerTalk() {
    Sound.sfx("tap");
    buildQueue();
    if (S.queue.length && !(S.player?.locked && !S.key)) { S.skipLookBacks = false; startLookBacks(); return; }
    if (S.player?.locked && !S.key) { Garden.say("Your decisions are locked. Unlock them with your key file and I can show you around.", 6000); return; }
    tipIdx = (tipIdx + 1) % TIPS.length;
    Garden.say(TIPS[tipIdx], 6500);
  }
  setInterval(() => {
    if (S.screen === "s-home" && !document.hidden && !S.checkOpen && Math.random() < 0.5 && document.querySelector("#scene .bubble").hidden) {
      tipIdx = (tipIdx + 1) % TIPS.length; Garden.say(TIPS[tipIdx], 6000);
    }
  }, 40000);

  // ---------- Look-backs ----------
  function startLookBacks() {
    if (!S.queue.length) return;
    const { d, m } = S.queue[0];
    S.checkOpen = "walking";
    Garden.say(S.queue.length > 1 ? `${S.queue.length} plants are ready for a look back. Follow me!` : "One of your plants is ready for a look back. Follow me!", 4000);
    Garden.walkTo(d.id, () => {
      sayHtml(`This one has grown for <b>${stageName(m)}</b>. How did it turn out?`, 0, () => openCheck(d, m));
      setTimeout(() => { if (S.checkOpen === "walking" && S.screen === "s-home") openCheck(d, m); }, 1400);
    });
  }
  function openCheck(d, m) {
    S.checkOpen = { d, m };
    Garden.hush();
    $("c-head").textContent = stageHead(m);
    $("c-when").textContent = `Planted on ${fmtDate(d.created_at)} · you were ${d.confidence}% sure it was right`;
    $("c-title").textContent = d.title ?? "🔒 Locked decision";
    $("c-note").hidden = !d.note; $("c-note").textContent = d.note ? `Your reason: ${d.note}` : "";
    const prev = STAGES.filter((x) => d.checks[x]).map((x) => `${stageName(x)}: ${d.checks[x].rating}`);
    $("c-prev").textContent = prev.length ? `Earlier look backs — ${prev.join(" · ")}` : "";
    $("c-rate").value = 50; rateUI();
    $("c-text").value = ""; $("c-err").textContent = "";
    const more = S.queue.filter((q) => !(q.d === d && q.m === m)).length;
    $("c-more").textContent = more ? `${more} more waiting after this one` : "";
    $("m-check").hidden = false;
  }
  function rateUI() {
    const v = Number($("c-rate").value);
    $("c-num").textContent = v; $("c-num").style.color = colorOf(v);
    $("c-word").textContent = rateWord(v);
  }
  $("c-rate").oninput = rateUI;
  $("c-later").onclick = () => {
    $("m-check").hidden = true; S.checkOpen = null; S.skipLookBacks = true;
    Garden.say("No rush. I'll keep them watered until you're ready.", 4500);
    Garden.goHome();
  };
  $("c-save").onclick = async () => {
    const cur = S.checkOpen; if (!cur || !cur.d) return;
    const { d, m } = cur;
    const rating = Number($("c-rate").value);
    const noteTxt = $("c-text").value.trim();
    const btn = $("c-save"); btn.disabled = true;
    try {
      const note = noteTxt ? (S.player.locked ? await enc(noteTxt) : noteTxt) : null;
      const { data, error } = await sb.from("rc_checkins").insert({ decision_id: d.id, stage: m, rating, note }).select().single();
      if (error && error.code !== "23505") throw error;
      if (data) d.checks[m] = { ...data, rawNote: data.note, note: noteTxt || null };
      else await loadData();
      $("m-check").hidden = true;
      S.checkOpen = null;
      Sound.sfx(rating >= 60 ? "good" : "soft");
      renderHome();
      buildQueue();
      const line = rating >= 60 ? "Wonderful — look at it bloom! 🌸" : rating <= 40 ? "It drooped a little. These plants teach us the most." : "A bit of both. That's life in the garden.";
      Garden.walkTo(d.id, () => Garden.water(1500, () => {
        Garden.say(line, 4000);
        if (S.queue.length) setTimeout(() => { if (S.screen === "s-home" && !S.checkOpen) startLookBacks(); }, 2600);
        else setTimeout(() => Garden.goHome(), 3500);
      }));
      if (S.screen !== "s-home") { if (S.screen === "s-detail") renderDetail(d.id); }
    } catch (e) {
      console.error(e);
      $("c-err").textContent = "Couldn't save. Check your connection.";
    } finally { btn.disabled = false; }
  };

  // ---------- New decision ----------
  let when = "today";
  function openNew() {
    if (S.player.locked && !S.key) { openKeyScreen(); return; }
    $("n-title").value = ""; $("n-note").value = ""; $("n-err").textContent = "";
    $("n-conf").value = 70; confUI(); countUI();
    setWhen("today");
    show("s-new");
    setTimeout(() => $("n-title").focus(), 250);
  }
  function setWhen(w) { when = w; document.querySelectorAll("[data-when]").forEach((b) => b.classList.toggle("on", b.dataset.when === w)); }
  document.querySelectorAll("[data-when]").forEach((b) => (b.onclick = () => setWhen(b.dataset.when)));
  function confUI() {
    const v = Number($("n-conf").value);
    $("n-num").textContent = v; $("n-num").style.color = colorOf(v); $("n-word").textContent = confWord(v);
  }
  const countUI = () => ($("n-count").textContent = `${$("n-title").value.length} / 200`);
  $("n-conf").oninput = confUI;
  $("n-title").oninput = countUI;
  $("b-new").onclick = openNew;
  $("n-save").onclick = async () => {
    const title = $("n-title").value.trim(), note = $("n-note").value.trim();
    if (title.length < 3) { $("n-err").textContent = "Write the decision in a few words first."; return; }
    const btn = $("n-save"); btn.disabled = true;
    try {
      const locked = !!S.player.locked;
      const row = {
        title: locked ? await enc(title) : title,
        note: note ? (locked ? await enc(note) : note) : null,
        encrypted: locked,
        confidence: Number($("n-conf").value),
        decided_for: when,
        plant: Math.floor(Math.random() * 6)
      };
      const { data, error } = await sb.from("rc_decisions").insert(row).select().single();
      if (error) throw error;
      const d = { ...data, raw: { title: data.title, note: data.note }, title, note: note || null, locked: false, checks: {} };
      S.decisions.push(d);
      Sound.sfx("plant");
      S.planting = true;
      Garden.hush();
      setTimeout(() => (S.planting = false), 12000);
      goHome();
      setTimeout(() => {
        Garden.walkTo(d.id, () => Garden.water(1700, () => {
          sayHtml(`Planted! I'll call you back for a look on <b>${fmtDate(addMonths(d.created_at, 1))}</b>.`, 6000);
          setTimeout(() => { S.planting = false; Garden.goHome(); }, 4000);
        }));
      }, 500);
    } catch (e) {
      console.error(e);
      $("n-err").textContent = "Couldn't save. Check your connection.";
    } finally { btn.disabled = false; }
  };

  // ---------- Detail ----------
  let detailId = null;
  function openDetail(id) { detailId = id; renderDetail(id); show("s-detail"); }
  function renderDetail(id) {
    const d = S.decisions.find((x) => x.id === id);
    if (!d) return;
    const locked = S.player.locked && !S.key;
    const acc = accuracy(d);
    const steps = STAGES.map((m) => {
      const c = d.checks[m], date = addMonths(d.created_at, m);
      if (c) {
        return `<div class="step"><div class="dot" style="background:${colorOf(c.rating)}22">${c.rating >= 60 ? "🌸" : c.rating <= 40 ? "🥀" : "🌿"}</div><div class="grow">
          <b>${stageName(m)}: ${c.rating} · ${rateWord(c.rating).slice(2).trim()}</b>
          <div class="muted">Rated ${fmtDate(c.created_at)}</div>${c.note ? `<div class="note">${esc(c.note)}</div>` : c.rawNote ? '<div class="note">🔒 Locked note</div>' : ""}</div></div>`;
      }
      const due = date.getTime() <= now();
      return `<div class="step"><div class="dot">${due ? "⏰" : "⏳"}</div><div class="grow"><b>${stageName(m)}</b>
        <div class="muted">${due ? "Ready for a look back" : `On ${fmtDate(date)}`}</div>
        ${due && !locked ? `<button class="btn small" style="margin-top:8px" data-check="${m}">Look back now</button>` : ""}</div></div>`;
    }).join("");
    $("d-body").innerHTML = `
      <div class="card" style="margin-top:4px">
        <div class="muted">${plantEmoji(d)} Planted ${fmtDate(d.created_at)} · to do ${d.decided_for === "today" ? "the same day" : "within a few days"}</div>
        <div class="big-t">${d.locked ? "🔒 Locked decision" : esc(d.title)}</div>
        ${d.note ? `<div class="note">Why I thought it was right: ${esc(d.note)}</div>` : ""}
        <div class="muted" style="margin-top:12px">How sure I was: <b style="color:${colorOf(d.confidence)}">${d.confidence}% · ${confWord(d.confidence)}</b></div>
        <div class="meter"><i style="width:${d.confidence}%;background:${colorOf(d.confidence)}"></i></div>
      </div>
      <div class="card"><h3>Look backs</h3>${steps}</div>
      ${acc != null ? `<div class="card"><h3>🎯 Gut accuracy: ${acc}%</h3><div class="muted">How close your confidence (${d.confidence}) was to how it turned out (${latest(d).rating}).</div></div>` : ""}`;
    $("d-body").querySelectorAll("[data-check]").forEach((b) => (b.onclick = () => openCheck(d, Number(b.dataset.check))));
  }
  $("d-delete").onclick = async () => {
    if (!(await ask("Delete this decision?", "Its plant and all its look backs will be removed for good.", "Delete", "Keep it", true))) return;
    const { error } = await sb.from("rc_decisions").delete().eq("id", detailId);
    if (error) { toast("Couldn't delete. Check your connection."); return; }
    S.decisions = S.decisions.filter((d) => d.id !== detailId);
    toast("Decision deleted");
    goHome();
  };

  // ---------- Results ----------
  function renderResults() {
    const rated = S.decisions.filter((d) => latest(d));
    const waiting = S.decisions.length - rated.length;
    let html = "";
    if (!rated.length) {
      const nd = S.decisions.map(nextDate).filter(Boolean).sort((a, b) => a - b)[0];
      html = `<div class="hero"><div style="font-size:42px">🌱</div><b>No look backs yet</b>
        <div class="muted" style="margin-top:6px">Your results appear after your first look back${nd ? ` — the first one is on <b>${fmtDate(nd)}</b>` : ". Plant a decision to start"}.</div></div>`;
    } else {
      const acc = Math.round(rated.reduce((s, d) => s + accuracy(d), 0) / rated.length);
      const avgC = Math.round(rated.reduce((s, d) => s + d.confidence, 0) / rated.length);
      const avgO = Math.round(rated.reduce((s, d) => s + latest(d).rating, 0) / rated.length);
      const worth = rated.filter((d) => latest(d).rating >= 60).length;
      const regret = rated.filter((d) => latest(d).rating <= 40).length;
      const diff = avgC - avgO;
      const read = diff > 10 ? "You tend to feel surer than things turn out. A short pause before big choices may help."
        : diff < -10 ? "Your choices turn out better than you expect. You can trust yourself a little more."
        : "Your gut feeling matches reality well. Keep listening to it.";
      html = `<div class="hero"><div class="muted">Gut accuracy</div><div class="num">${acc}%</div>
          <div class="muted" style="margin-top:6px">${read}</div></div>
        <div class="stats">
          <div class="stat"><b style="color:#4f9a45">${worth}</b><span>🌸 worth it</span></div>
          <div class="stat"><b style="color:#e0a92e">${rated.length - worth - regret}</b><span>🌿 a bit of both</span></div>
          <div class="stat"><b style="color:#d9655b">${regret}</b><span>🥀 regret</span></div>
        </div>
        <div class="stats">
          <div class="stat"><b>${avgC}</b><span>how sure I usually am</span></div>
          <div class="stat"><b>${avgO}</b><span>how it usually turns out</span></div>
          <div class="stat"><b>${waiting}</b><span>still growing</span></div>
        </div>
        <div class="card"><h3>Sure vs. how it turned out</h3>${chart(rated)}
          <div class="muted">Each dot is a decision. Dots on the dashed line = your gut was spot on. Above it = better than you expected; below = worse.</div></div>`;
    }
    $("r-body").innerHTML = html;
  }
  function chart(rated) {
    const W = 300, P = 34, I = W - P - 10;
    const X = (v) => P + (v / 100) * I, Y = (v) => 10 + I - (v / 100) * I;
    let g = "";
    for (const v of [0, 50, 100]) {
      g += `<line x1="${X(0)}" y1="${Y(v)}" x2="${X(100)}" y2="${Y(v)}" stroke="#ece4cf"/><line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(100)}" stroke="#ece4cf"/>`;
      g += `<text x="${P - 6}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="#8a8f7e">${v}</text><text x="${X(v)}" y="${Y(0) + 14}" font-size="10" text-anchor="middle" fill="#8a8f7e">${v}</text>`;
    }
    g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(100)}" stroke="#9aa38c" stroke-dasharray="5 5"/>`;
    g += rated.map((d) => `<circle cx="${X(d.confidence)}" cy="${Y(latest(d).rating)}" r="7" fill="${colorOf(latest(d).rating)}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`).join("");
    g += `<text x="${X(50)}" y="${W + 8}" font-size="11" text-anchor="middle" fill="#6d7563">How sure I was →</text>`;
    g += `<text x="10" y="${Y(50)}" font-size="11" text-anchor="middle" fill="#6d7563" transform="rotate(-90 10 ${Y(50)})">How it turned out →</text>`;
    return `<svg viewBox="0 0 ${W} ${W + 14}" width="100%" style="display:block;margin:4px 0 8px">${g}</svg>`;
  }
  $("b-results").onclick = () => { renderResults(); show("s-results"); };

  // ---------- Privacy lock ----------
  function openKeyScreen() {
    $("key-name").textContent = keyFileName();
    $("key-error").textContent = "";
    show("s-key", false);
  }
  $("key-pick").onclick = () => $("key-file").click();
  $("lockbar-open").onclick = openKeyScreen;
  $("key-skip").onclick = () => { renderHome(); show("s-home", false); };
  $("key-file").onchange = async () => {
    const f = $("key-file").files[0]; $("key-file").value = "";
    if (!f) return;
    const err = $("key-error"); err.textContent = "";
    try {
      const j = JSON.parse(await f.text());
      if (j.app !== "regret-challenge" || !j.key) throw new Error("bad");
      if (j.uid && j.uid !== S.uid) { err.textContent = "This key file belongs to another account."; return; }
      const k = await importKey(j.key);
      if ((await dec(S.player.key_check, k)) !== checkText()) { err.textContent = "This key doesn't open your garden. Is it the newest key file?"; return; }
      S.key = k; S.keyB64 = j.key; store.set(keyStoreName(), j.key);
      await decryptAll();
      toast("Unlocked 🔓");
      S.skipLookBacks = false;
      renderHome(); show("s-home", false);
      if (S.screen === "s-settings") renderSettings();
    } catch { err.textContent = "That doesn't look like a Regret Challenge key file."; }
  };

  const LOCK_INFO = `Your decision texts and notes will be scrambled on this phone before they are saved. Nobody — not even the app owner — can read them.
       <div class="ok-box">You'll get a <b>key file</b> now. Each time you log in, the game asks you to pick that file from your device to open your decisions.</div>
       <div class="warn"><b>Keep the key file safe</b> (e.g. save it to Google Drive or send it to yourself). <b>If you lose it, locked decisions can never be recovered by anyone.</b></div>`;
  // asked once after logging in, so every player knows the option exists
  async function offerLock() {
    store.set(`rc-lock-asked-${S.uid}`, "1");
    if (await ask("🔒 Keep your decisions private?", LOCK_INFO + `<div class="muted" style="margin-top:10px">Optional. You can also turn it on later in Settings.</div>`, "Yes, give me a key file", "No thanks")) turnOnLock(false);
  }
  async function turnOnLock(confirm = true) {
    if (confirm && !(await ask("Turn on the privacy lock?", LOCK_INFO, "Turn on & download key", "Cancel"))) return;
    try {
      const k = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", k));
      S.keyB64 = toB64(raw); S.key = await importKey(S.keyB64);
      store.set(keyStoreName(), S.keyB64);
      downloadKey();
      const key_check = await enc(checkText());
      const { error } = await sb.from("rc_players").update({ locked: true, key_check }).eq("user_id", S.uid);
      if (error) throw error;
      S.player.locked = true; S.player.key_check = key_check;
      await rewriteAll(true);
      renderSettings(); renderHome();
      await ask("🔒 Privacy lock is on", `Your key file <b>${esc(keyFileName())}</b> was saved to this device (usually the Downloads folder).
        <div class="ok-box">Next time you log in (on this phone or any other), the game will ask you to pick this file.</div>`, "Got it", "");
    } catch (e) {
      console.error(e);
      toast("Couldn't turn on the lock. Check your connection and try again.");
      await loadData().catch(() => {}); renderSettings();
    }
  }
  async function turnOffLock() {
    if (!S.key) { openKeyScreen(); return; }
    const ok = await ask("Turn off the privacy lock?", "Your decisions will be saved as normal text again. Your old key file will no longer be needed.", "Turn off", "Cancel");
    if (!ok) return;
    try {
      await rewriteAll(false);
      const { error } = await sb.from("rc_players").update({ locked: false, key_check: null }).eq("user_id", S.uid);
      if (error) throw error;
      S.player.locked = false; S.player.key_check = null;
      store.del(keyStoreName()); S.key = null; S.keyB64 = null;
      toast("Privacy lock is off");
      renderSettings(); renderHome();
    } catch (e) { console.error(e); toast("Couldn't turn it off. Check your connection."); }
  }
  // lock = true: scramble plain text; false: unscramble
  async function rewriteAll(lock) {
    for (const d of S.decisions) {
      if (d.title == null) continue;
      const title = lock ? (isEnc(d.raw.title) ? d.raw.title : await enc(d.title)) : d.title;
      const note = d.note == null ? null : lock ? (isEnc(d.raw.note) ? d.raw.note : await enc(d.note)) : d.note;
      if (title !== d.raw.title || note !== d.raw.note || d.encrypted !== lock) {
        const { error } = await sb.from("rc_decisions").update({ title, note, encrypted: lock }).eq("id", d.id);
        if (error) throw error;
        d.raw = { title, note }; d.encrypted = lock;
      }
      for (const c of Object.values(d.checks)) {
        if (c.note == null) continue;
        const n = lock ? (isEnc(c.rawNote) ? c.rawNote : await enc(c.note)) : c.note;
        if (n !== c.rawNote) {
          const { error } = await sb.from("rc_checkins").update({ note: n }).eq("id", c.id);
          if (error) throw error;
          c.rawNote = n;
        }
      }
    }
  }
  function renderSettings() {
    $("set-user").textContent = S.player?.username || "";
    const box = $("set-lock");
    if (!S.player.locked) {
      box.innerHTML = `<div class="muted">Off. Most players don't need it. Turn it on if you want your decisions scrambled so that nobody, not even the app owner, can read them.</div>
        <button class="btn light" id="lk-on" style="margin-top:12px">Turn on privacy lock</button>`;
      $("lk-on").onclick = () => turnOnLock(true);
    } else if (S.key) {
      box.innerHTML = `<div class="ok-box"><b>On.</b> Decisions are scrambled on this phone before they're saved. The key is kept on this device only until you log out; the next login asks for your key file.</div>
        <button class="btn light" id="lk-dl" style="margin-top:12px">⬇️ Download key file again</button>
        <button class="btn light" id="lk-forget" style="margin-top:10px">Forget the key on this device</button>
        <button class="btn light" id="lk-off" style="margin-top:10px">Turn off privacy lock</button>`;
      $("lk-dl").onclick = downloadKey;
      $("lk-forget").onclick = async () => {
        if (!(await ask("Forget the key here?", "This device will need your key file again to open your decisions. Make sure you still have the file!", "Forget it", "Cancel", true))) return;
        store.del(keyStoreName()); S.key = null; S.keyB64 = null;
        await decryptAll(); renderSettings(); renderHome(); toast("Key removed from this device");
      };
      $("lk-off").onclick = turnOffLock;
    } else {
      box.innerHTML = `<div class="warn"><b>On</b>, but this device doesn't have your key.</div>
        <button class="btn light" id="lk-pick" style="margin-top:12px">📂 Pick my key file</button>`;
      $("lk-pick").onclick = openKeyScreen;
    }
  }

  // ---------- Settings ----------
  $("b-settings").onclick = () => { renderSettings(); refreshInstall(); show("s-settings"); };
  $("set-logout").onclick = async () => {
    if (S.uid) store.del(keyStoreName());   // the next login must pick the key file again
    await sb.auth.signOut();
    Object.assign(S, { uid: null, player: null, key: null, keyB64: null, decisions: [], greeted: false, skipLookBacks: false, checkOpen: null });
    setMode("login"); $("f-user").value = "";
    history.replaceState(null, ""); show("s-auth", false);
  };
  $("set-delete").onclick = async () => {
    if (!(await ask("Delete your account?", "Your account, every decision and every look back will be deleted for good.", "Delete everything", "Cancel", true))) return;
    if (!(await ask("Are you sure?", "This can't be undone.", "Yes, delete", "No", true))) return;
    const { error } = await sb.rpc("rc_delete_account");
    if (error) { toast("Couldn't delete the account. Check your connection."); return; }
    store.del(keyStoreName());
    await sb.auth.signOut().catch(() => {});
    Object.assign(S, { uid: null, player: null, key: null, decisions: [], greeted: false });
    setMode("login"); $("f-user").value = "";
    history.replaceState(null, ""); show("s-auth", false);
    toast("Account deleted");
  };
  // hidden test panel: tap the version 5 times
  let verTaps = 0, verT = 0;
  $("ver").onclick = () => {
    clearTimeout(verT); verT = setTimeout(() => (verTaps = 0), 1500);
    if (++verTaps >= 5) { verTaps = 0; $("test-panel").hidden = !$("test-panel").hidden; }
  };
  function setTest(m) {
    if (!m) { store.del("rc-time-offset"); store.del("rc-time-months"); }
    else { store.set("rc-time-offset", String(addMonths(realNow(), m).getTime() - realNow() + 60000)); store.set("rc-time-months", String(m)); }
    S.skipLookBacks = false;
    showTestBar();
    toast(m ? `Pretending ${stageName(m)} has passed. Go back to the garden!` : "Back to real time");
  }
  document.querySelectorAll("[data-test]").forEach((b) => (b.onclick = () => setTest(Number(b.dataset.test))));
  $("test-reset").onclick = () => { setTest(0); if (S.screen === "s-home") renderHome(); };

  // ---------- Music ----------
  function renderMusic() {
    const st = Sound.state();
    $("mu-on").classList.toggle("on", st.on);
    $("mu-mel").classList.toggle("on", st.melody);
    $("mu-vol").value = Math.round(st.vol * 100);
    $("mu-tracks").innerHTML = Object.entries(Sound.TRACKS).map(([k, v]) =>
      `<button class="track ${st.on && st.track === k ? "on" : ""}" data-track="${k}">${{ rain: "🌧️", stream: "🏞️", birds: "🐦", night: "🦗" }[k]} ${v}</button>`).join("");
    $("b-music").textContent = st.on ? "🎵" : "🔇";
  }
  $("b-music").onclick = () => { renderMusic(); $("m-music").hidden = false; };
  $("mu-on").onclick = () => { Sound.set({ on: !Sound.state().on }); renderMusic(); };
  $("mu-mel").onclick = () => { Sound.set({ melody: !Sound.state().melody }); renderMusic(); };
  $("mu-vol").oninput = () => Sound.set({ vol: Number($("mu-vol").value) / 100 });
  $("mu-tracks").onclick = (e) => { const b = e.target.closest("[data-track]"); if (b) { Sound.set({ track: b.dataset.track, on: true }); renderMusic(); } };
  document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => (b.closest(".modal").hidden = true)));
  $("m-music").onclick = (e) => { if (e.target.id === "m-music") $("m-music").hidden = true; };
  // browsers only start sound after a touch: resume saved music on the first tap
  document.addEventListener("pointerdown", () => Sound.unlock(), { once: true });

  // ---------- Install ----------
  let installEvt = null;
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; refreshInstall(); });
  window.addEventListener("appinstalled", () => { installEvt = null; refreshInstall(); toast("Installed! Open it from your home screen."); });
  function refreshInstall() {
    $("b-install").hidden = standalone() || !(installEvt || isIOS);
    $("set-install").hidden = standalone();
    $("set-install-txt").textContent = standalone() ? "Already installed on this device ✅" : "Add Regret Challenge to your home screen so it opens like an app.";
  }
  async function doInstall() {
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; refreshInstall(); return; }
    if (isIOS) ask("Install on iPhone", "Tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>.", "OK", "");
    else ask("Install", "Open your browser menu (⋮) and choose <b>Install app</b> or <b>Add to Home screen</b>.", "OK", "");
  }
  $("b-install").onclick = doInstall;
  $("set-install").onclick = doInstall;
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

  // ---------- Logo ----------
  (function drawLogo() {
    const c = $("logo").getContext("2d");
    const R = (col, x, y, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    R("#b8734a", 6, 15, 12, 2); R("#a0623e", 7, 17, 10, 6); R("#8a5233", 7, 17, 10, 1);
    R("#3f7a3a", 11, 7, 2, 8);
    R("#5fae4f", 6, 6, 5, 3); R("#5fae4f", 5, 5, 3, 2); R("#3f8a3a", 7, 8, 4, 1);
    R("#5fae4f", 13, 4, 5, 3); R("#5fae4f", 16, 3, 3, 2); R("#3f8a3a", 13, 6, 4, 1);
    R("#f08fb0", 11, 3, 2, 2); R("#f5c542", 11, 4, 1, 1);
  })();

  // ---------- Garden ----------
  Garden.init($("scene"), {
    onPlantTap: (id) => { Sound.sfx("tap"); openDetail(id); },
    onEmptyTap: () => { Sound.sfx("tap"); openNew(); },
    onGardenerTap: gardenerTalk
  });

  // ---------- Start ----------
  showTestBar();
  setMode("login");
  refreshInstall();
  enterApp();
})();
