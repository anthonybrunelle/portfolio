// Interactive terminal: commands, subnet calculator, simulated ping,
// history (↑/↓) and autocomplete with a ghost-text preview.
(function terminal() {
  const out = document.getElementById("termOut");
  const form = document.getElementById("termForm");
  const input = document.getElementById("termInput");
  const bodyEl = document.getElementById("termBody");
  const history = [];
  let hIndex = 0;

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function print(html) {
    const pre = document.createElement("pre");
    pre.innerHTML = html;
    out.appendChild(pre);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  // ---- Subnet calculator ----
  function ipToInt(ip) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  }
  const intToIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
  function subnet(arg) {
    const m = /^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/.exec(arg || "");
    const ip = m && ipToInt(m[1]);
    const cidr = m && +m[2];
    if (ip === null || !m || cidr > 32) return `<span class="err">usage: subnet &lt;ip&gt;/&lt;cidr&gt;   e.g. subnet 10.0.0.0/24</span>`;
    const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
    const net = (ip & mask) >>> 0;
    const bcast = (net | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - cidr);
    // /31 (point-to-point) and /32 (single host) have no separate network/broadcast addresses
    const usable = cidr >= 31 ? total : total - 2;
    const first = cidr >= 31 ? net : net + 1;
    const last = cidr >= 31 ? bcast : bcast - 1;
    const row = (k, v) => `<span class="m">${k.padEnd(12)}</span>${v}`;
    return [
      row("network", `<span class="a">${intToIp(net)}/${cidr}</span>`),
      row("netmask", intToIp(mask)),
      row("wildcard", intToIp(~mask >>> 0)),
      row("broadcast", intToIp(bcast)),
      row("host range", `${intToIp(first)} – ${intToIp(last)}`),
      row("usable", `<span class="ok">${usable.toLocaleString()}</span> hosts`),
    ].join("\n");
  }

  // ---- Simulated ping ----
  function ping(host) {
    if (!host) return print(`<span class="err">usage: ping &lt;host&gt;</span>`);
    const h = esc(host);
    const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 223) + 1).join(".");
    print(`PING ${h} (${ip}): 56 data bytes <span class="m">(simulated)</span>`);
    input.disabled = true;
    const times = [];
    let n = 0;
    const iv = setInterval(() => {
      const t = (8 + Math.random() * 30).toFixed(1);
      times.push(+t);
      print(`64 bytes from ${ip}: icmp_seq=${n} ttl=117 time=<span class="ok">${t} ms</span>`);
      if (++n === 4) {
        clearInterval(iv);
        const avg = (times.reduce((a, b) => a + b) / 4).toFixed(1);
        print(`<span class="m">--- ${h} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, avg ${avg} ms</span>`);
        input.disabled = false;
        input.focus();
      }
    }, 450);
  }

  const commands = {
    help: () =>
      [
        `<span class="a">available commands</span>`,
        `  whoami        who is this guy?`,
        `  about         a little more detail`,
        `  skills        what I work with`,
        `  experience    where I've worked`,
        `  certs         certifications`,
        `  education     school stuff`,
        `  contact       how to reach me`,
        `  subnet        subnet calculator — try <span class="a">subnet 172.16.0.0/20</span>`,
        `  ping          ping a host (simulated)`,
        `  theme         toggle light/dark`,
        `  matrix        ...`,
        `  clear         clear the screen`,
        `<span class="m">tip: ↑/↓ for history, tab to autocomplete</span>`,
      ].join("\n"),
    whoami: () => `<span class="a">Anthony Brunelle</span>\nCS major, Data Science minor @ CSU San Marcos · CCST Networking certified · San Diego, CA`,
    about: () =>
      `I'm a CS major (Data Science minor) at CSU San Marcos (class of Dec 2027).\nMost of my focus so far has been networking; I hold the Cisco CCST Networking cert.\nI also work at United Parks &amp; Resorts, where I went from ride operator to assistant supervisor.`,
    skills: () =>
      [...document.querySelectorAll(".info-card .tags li")].map((li) => `<span class="ok">✔</span> ${esc(li.textContent)}`).join("\n"),
    experience: () =>
      [...document.querySelectorAll(".tl-item")]
        .map((it) => `<span class="a">${esc(it.querySelector("h3").textContent)}</span> <span class="m">@</span> ${esc(it.querySelector(".tl-org").textContent.split("·")[0].trim())}  <span class="m">${esc(it.querySelector(".tl-meta").textContent)}</span>`)
        .join("\n"),
    certs: () => [...document.querySelectorAll(".certs li")].map((li) => `<span class="ok">★</span> ${esc(li.textContent)}`).join("\n"),
    education: () => `CSU San Marcos        B.S. CS, Data Sci minor  <span class="m">2025 – 2027</span>\nSan Diego Mesa College  Computer Science         <span class="m">2021 – 2025</span>`,
    contact: () => {
      const mail = document.getElementById("emailLink").getAttribute("href").replace("mailto:", "");
      return `email     <a href="mailto:${mail}">${mail}</a>\nlinkedin  <a href="https://www.linkedin.com/in/anthonybrunelle/" target="_blank" rel="noopener">linkedin.com/in/anthonybrunelle</a>\ngithub    <a href="https://github.com/anthonybrunelle" target="_blank" rel="noopener">github.com/anthonybrunelle</a>`;
    },
    subnet: (args) => subnet(args[0]),
    ping: (args) => { ping(args[0]); return null; },
    theme: () => { document.getElementById("themeToggle").click(); return `theme set to <span class="a">${root.dataset.theme}</span>`; },
    matrix: () => { matrixRain(); return `<span class="ok">entering the matrix…</span>`; },
    clear: () => { out.innerHTML = ""; return null; },
    sudo: () => `<span class="err">nice try. this incident will be reported.</span>`,
    ls: () => `about.txt  projects/  experience.log  resume.pdf  <span class="m">secret.txt</span>`,
    cat: (args) => args[0] === "secret.txt" ? `the konami code works on this site 👀` : `try <span class="a">help</span> instead`,
    date: () => new Date().toString(),
    echo: (args) => esc(args.join(" ")),
    hello: () => `hey! 👋 thanks for stopping by.`,
    hi: () => commands.hello(),
    exit: () => `there is no escape. (try <span class="a">contact</span> instead)`,
  };

  function run(raw) {
    const line = raw.trim();
    print(`<span class="p">anthony@portfolio:~$</span> ${esc(line)}`);
    if (!line) return;
    history.push(line);
    hIndex = history.length;
    const [cmd, ...args] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    const result = fn ? fn(args) : `<span class="err">command not found: ${esc(cmd)}</span>. type <span class="a">help</span>`;
    if (result) print(result);
  }

  // ---- Autocomplete preview (ghost text) ----
  const ghost = document.getElementById("termGhost");
  const argHints = { subnet: ["192.168.1.0/24"], ping: ["github.com"], cat: ["secret.txt"] };
  let suggestion = "";

  function suggest(value) {
    const lower = value.toLowerCase();
    if (!lower.includes(" ")) {
      const hit = Object.keys(commands).find((c) => c.startsWith(lower) && c !== lower);
      return hit ? value + hit.slice(value.length) : "";
    }
    const [cmd, arg = "", ...rest] = lower.split(" ");
    if (rest.length || !argHints[cmd]) return "";
    const hit = argHints[cmd].find((a) => a.startsWith(arg) && a !== arg);
    return hit ? value + hit.slice(arg.length) : "";
  }

  function updateGhost() {
    const value = input.value;
    suggestion = value && input.selectionEnd === value.length ? suggest(value) : "";
    if (!value) {
      ghost.innerHTML = `type a command… <kbd>help</kbd>`;
    } else if (suggestion && input.scrollWidth <= input.clientWidth) {
      ghost.innerHTML = `<span class="typed">${esc(value)}</span>${esc(suggestion.slice(value.length))}<kbd>tab</kbd>`;
    } else {
      ghost.textContent = "";
    }
  }

  function accept() {
    if (!suggestion) return false;
    input.value = suggestion + (suggestion.includes(" ") ? "" : " ");
    updateGhost();
    return true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
    updateGhost();
  });

  input.addEventListener("input", updateGhost);
  input.addEventListener("click", updateGhost);

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hIndex > 0) { input.value = history[--hIndex]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ""; e.preventDefault(); }
    else if (e.key === "ArrowRight" && input.selectionEnd === input.value.length && suggestion) { e.preventDefault(); accept(); return; }
    else if (e.key === "Tab") {
      e.preventDefault();
      if (!accept() && input.value && !input.value.includes(" ")) {
        const match = Object.keys(commands).filter((c) => c.startsWith(input.value.toLowerCase()));
        if (match.length > 1) print(match.join("  "));
      }
      return;
    }
    requestAnimationFrame(updateGhost);
  });

  bodyEl.addEventListener("click", () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
  document.querySelectorAll(".term-hint button").forEach((b) =>
    b.addEventListener("click", () => { if (!input.disabled) run(b.dataset.cmd); })
  );
  updateGhost();

  // Boot sequence when the terminal scrolls into view
  const boot = [
    `<span class="m">booting anthony-os v2.0.25 …</span>`,
    `<span class="ok">[ ok ]</span> loaded coffee.service`,
    `<span class="ok">[ ok ]</span> mounted /home/anthony/curiosity`,
    `<span class="ok">[ ok ]</span> network link up · 1 Gbps full duplex`,
    `\nWelcome! Type <span class="a">help</span> to see what you can do.\n`,
  ];
  const bootObserver = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    bootObserver.disconnect();
    boot.forEach((l, i) => setTimeout(() => print(l), reduceMotion ? 0 : i * 280));
  }, { threshold: 0.4 });
  bootObserver.observe(bodyEl);
})();
