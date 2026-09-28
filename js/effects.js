// Scroll and pointer effects: heading reveals, fade-ins, progress bar,
// card spotlight/tilt, magnetic links, custom cursor, active nav, click sparks.

// ---------- Split headings into letters ----------
document.querySelectorAll(".split").forEach((el) => {
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", i);
    span.textContent = ch === " " ? " " : ch;
    el.appendChild(span);
  });
});

// ---------- Reveal on scroll ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll?.(".count").forEach(countUp);
      if (entry.target.classList.contains("count")) countUp(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  observer.observe(el);
});
document.querySelectorAll(".split").forEach((el) => observer.observe(el));

// ---------- Count-up numbers ----------
function countUp(el) {
  const to = +el.dataset.to;
  if (reduceMotion) { el.textContent = to; return; }
  const start = performance.now();
  const dur = 1600;
  (function step(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// ---------- Scroll progress + timeline fill ----------
const progress = document.getElementById("progress");
const timeline = document.getElementById("timeline");
const timelineFill = document.getElementById("timelineFill");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

  const rect = timeline.getBoundingClientRect();
  const p = (innerHeight * 0.6 - rect.top) / rect.height;
  timelineFill.style.transform = `scaleY(${Math.max(0, Math.min(1, p))})`;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Spotlight follow ----------
document.querySelectorAll(".spotlight").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

if (finePointer && !reduceMotion) {
  // ---------- 3D tilt ----------
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transitionDelay = "0ms";
      card.style.transform = `rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  // ---------- Magnetic elements ----------
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 600);
    });
  });

  // ---------- Custom cursor ----------
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    body.classList.add("has-cursor");
  });
  document.addEventListener("mouseleave", () => body.classList.remove("has-cursor"));
  (function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  })();
  const termBody = document.getElementById("termBody");
  termBody.addEventListener("pointerenter", () => body.classList.add("cursor-text"));
  termBody.addEventListener("pointerleave", () => body.classList.remove("cursor-text"));

  document.querySelectorAll("a, button, .project-card, .tl-item").forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("hover"));
  });
}

// ---------- Active nav link ----------
(function activeNav() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("section[id]").forEach((s) => navObserver.observe(s));
})();

// ---------- Click sparks ----------
if (!reduceMotion) {
  addEventListener("pointerdown", (e) => {
    if (e.target.closest("input, .term-body")) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      body.appendChild(s);
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      const dist = 30 + Math.random() * 40;
      s.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 },
        ],
        { duration: 600 + Math.random() * 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      ).onfinish = () => s.remove();
    }
  });
}
