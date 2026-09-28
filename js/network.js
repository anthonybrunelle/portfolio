// Hero background: drifting nodes that link up when close, with packets
// traveling along the links. Nodes are drawn toward the cursor.
(function network() {
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let w, h, nodes, dpr;

  function accent() {
    return getComputedStyle(root).getPropertyValue("--accent").trim() || "#8b5cf6";
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
    }));
  }

  // Packets that travel along links, like data on a network
  const packets = [];
  function spawnPacket() {
    if (!nodes || nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let best = null, bestD = Infinity;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 140 && d < bestD) { best = b; bestD = d; }
    }
    if (best) packets.push({ a, b: best, t: 0 });
  }

  const hero = canvas.parentElement;
  hero.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function draw() {
    requestAnimationFrame(draw);
    if (!visible) return;
    const [r, g, b] = hexToRgb(accent());
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      if (!reduceMotion) { n.x += n.vx; n.y += n.vy; }
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // Gentle pull toward cursor
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const dm = Math.hypot(dx, dy);
      if (dm < 180 && !reduceMotion) { n.x += dx * 0.012; n.y += dy * 0.012; }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], c = nodes[j];
        const d = Math.hypot(a.x - c.x, a.y - c.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 140) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }
      const n = nodes[i];
      const dm = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dm / 180) * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotion && Math.random() < 0.08) spawnPacket();
    for (let k = packets.length - 1; k >= 0; k--) {
      const p = packets[k];
      p.t += 0.025;
      if (p.t >= 1) { packets.splice(k, 1); continue; }
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = "#fff";
      ctx.shadowColor = `rgb(${r},${g},${b})`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  resize();
  addEventListener("resize", resize);
  draw();
})();
