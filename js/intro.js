// Preloader, then the hero name scramble and the typing line.

// ---------- Preloader ----------
(function preloader() {
  const el = document.getElementById("preloader");
  const count = document.getElementById("preloaderCount");
  const bar = document.getElementById("preloaderBar");
  const duration = reduceMotion ? 0 : 1400;
  const start = performance.now();

  function finish() {
    el.classList.add("done");
    body.classList.remove("is-loading");
    body.classList.add("loaded");
    document.querySelectorAll(".scramble").forEach((s, i) => setTimeout(() => scramble(s), 250 + i * 200));
    setTimeout(startTyping, 900);
  }

  function tick(now) {
    const t = Math.min((now - start) / (duration || 1), 1);
    const eased = 1 - Math.pow(1 - t, 3);
    count.textContent = Math.round(eased * 100);
    bar.style.width = eased * 100 + "%";
    if (t < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 150);
  }
  requestAnimationFrame(tick);
})();

// ---------- Text scramble ----------
const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
function scramble(el) {
  const text = el.dataset.text;
  if (reduceMotion) { el.textContent = text; return; }
  let frame = 0;
  const queue = [...text].map((ch, i) => ({ ch, end: 8 + i * 3 + Math.floor(Math.random() * 8) }));
  (function update() {
    let out = "";
    let done = 0;
    for (const q of queue) {
      if (frame >= q.end) { out += q.ch; done++; }
      else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    el.textContent = out;
    frame++;
    if (done < queue.length) requestAnimationFrame(update);
  })();
}

// ---------- Typing roles ----------
function startTyping() {
  const el = document.getElementById("typed");
  const roles = [
    "computer science student",
    "data science minor",
    "CCST networking certified",
    "team leader",
    "future software engineer",
  ];
  if (reduceMotion) { el.textContent = roles[0]; return; }
  let r = 0, i = 0, deleting = false;
  (function loop() {
    const word = roles[r];
    el.textContent = word.slice(0, i);
    if (!deleting && i < word.length) { i++; setTimeout(loop, 55); }
    else if (!deleting) { deleting = true; setTimeout(loop, 1800); }
    else if (i > 0) { i--; setTimeout(loop, 28); }
    else { deleting = false; r = (r + 1) % roles.length; setTimeout(loop, 300); }
  })();
}
