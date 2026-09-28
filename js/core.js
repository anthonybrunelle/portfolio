// Shared values used by the other scripts. Load this file first.
const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Theme toggle (persists choice) ----------
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) { }
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
