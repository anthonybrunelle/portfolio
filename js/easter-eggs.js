// Matrix rain (Konami code or the `matrix` terminal command), tab-away title,
// and a console message for anyone who opens DevTools.

// ---------- Matrix rain ----------
function matrixRain() {
  if (document.querySelector(".matrix")) return;
  const c = document.createElement("canvas");
  c.className = "matrix";
  const hint = document.createElement("div");
  hint.className = "matrix-hint mono";
  hint.textContent = "wake up, neo… (click or press Esc)";
  body.append(c, hint);
  const ctx = c.getContext("2d");
  c.width = innerWidth;
  c.height = innerHeight;
  const size = 16;
  const cols = Math.ceil(c.width / size);
  const drops = Array.from({ length: cols }, () => Math.random() * -50);
  const chars = "アカサタナハマヤラワ0123456789ABRUNELLE<>/{}";
  requestAnimationFrame(() => c.classList.add("on"));

  let running = true;
  (function frame() {
    if (!running) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${size}px JetBrains Mono, monospace`;
    drops.forEach((y, i) => {
      ctx.fillStyle = Math.random() < 0.05 ? "#fff" : "#22c55e";
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
      drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
    });
    setTimeout(() => requestAnimationFrame(frame), 33);
  })();

  function stop() {
    running = false;
    c.classList.remove("on");
    setTimeout(() => { c.remove(); hint.remove(); }, 600);
    removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") stop(); }
  c.addEventListener("click", stop);
  addEventListener("keydown", onKey);
  setTimeout(stop, 9000);
}

// ---------- Konami code ----------
(function konami() {
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let pos = 0;
  addEventListener("keydown", (e) => {
    pos = e.key === code[pos] ? pos + 1 : e.key === code[0] ? 1 : 0;
    if (pos === code.length) { pos = 0; matrixRain(); }
  });
})();

// ---------- Tab-away title ----------
(function tabTitle() {
  const original = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "// connection lost… come back 👋" : original;
  });
})();

// ---------- Hello, fellow dev ----------
console.log(
  "%c👋 Hey, curious dev!%c\nThanks for peeking under the hood. This site is hand-built with vanilla HTML, CSS & JS.\nPsst — try the Konami code, or type 'matrix' in the terminal.",
  "font: 700 20px sans-serif; color: #8b5cf6;",
  "font: 13px monospace; color: inherit;"
);
