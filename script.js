(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------------------------- Copy button ----------------------------

  const copyButtons = document.querySelectorAll("[data-copy-target]");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text =
        btn.dataset.copyText ||
        document.querySelector(btn.dataset.copyTarget)?.innerText ||
        "";
      try {
        await navigator.clipboard.writeText(text.trim());
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 1600);
      } catch {
        // no-op — user can still select the text
      }
    });
  });

  // ---------------------------- Terminal animation ----------------------------

  const terminal = document.getElementById("terminal");
  if (!terminal) return;

  // Each frame: `html` is the inline markup for the line, `delay` is ms to
  // wait *before* this line appears. Alignment assumes a monospace font.
  const frames = [
    { html: `<span class="tm-prompt">$</span> nornsctl dev`, delay: 300 },
    { html: `  <span class="tm-ok">ready</span>    orchestrator on :4000`, delay: 420 },
    { html: `  <span class="tm-info">online</span>   worker#1 connected`, delay: 380 },
    { html: ``, delay: 260 },
    { html: `  <span class="tm-muted">run_01hf</span> started`, delay: 380 },
    { html: `  <span class="tm-ok">✓</span>  1  llm.call              <span class="tm-dim">142ms</span>`, delay: 260 },
    { html: `  <span class="tm-ok">✓</span>  2  tool.lookup_order      <span class="tm-dim">89ms</span>`, delay: 240 },
    { html: `  <span class="tm-ok">✓</span>  3  llm.call              <span class="tm-dim">118ms</span>`, delay: 240 },
    { html: `  <span class="tm-ok">✓</span>  4  tool.charge_card      <span class="tm-dim">312ms</span>`, delay: 260 },
    { html: `  <span class="tm-ok">✓</span>  5  llm.call              <span class="tm-dim">156ms</span>`, delay: 240 },
    { html: `  <span class="tm-ok">✓</span>  6  tool.audit_trail       <span class="tm-dim">67ms</span>`, delay: 240 },
    { html: `  <span class="tm-ok">✓</span>  7  llm.call              <span class="tm-dim">101ms</span>`, delay: 240 },
    { html: `  <span class="tm-ok">✓</span>  8  tool.send_receipt     <span class="tm-dim">118ms</span>`, delay: 260 },
    { html: `  <span class="tm-err">✗</span>     worker#1 disconnected`, delay: 780 },
    { html: ``, delay: 360 },
    { html: `  <span class="tm-warn">◌</span>     awaiting worker`, delay: 340, cursor: true },
    { html: `  <span class="tm-info">online</span>   worker#2 connected`, delay: 950 },
    { html: `  <span class="tm-accent">↻</span>     resumed at call 9`, delay: 420 },
    { html: `  <span class="tm-ok">✓</span>  9  llm.call              <span class="tm-dim">167ms</span>`, delay: 360 },
    { html: `  <span class="tm-ok">✓</span>     run_01hf complete`, delay: 360 },
  ];

  const LOOP_PAUSE_MS = 4200;
  const STATIC_MODE = prefersReducedMotion;

  function renderStatic() {
    terminal.innerHTML = frames
      .map(
        (f) =>
          `<div class="term-line is-visible">${f.html || "&nbsp;"}</div>`,
      )
      .join("");
  }

  function clear() {
    terminal.innerHTML = "";
  }

  function addLine(frame) {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = frame.html || "&nbsp;";
    if (frame.cursor) {
      line.insertAdjacentHTML("beforeend", '<span class="term-cursor"></span>');
    }
    terminal.appendChild(line);
    // rAF → ensure the element is in the DOM before applying the transition.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => line.classList.add("is-visible"));
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let running = false;
  let cancel = false;

  async function runLoop() {
    if (running) return;
    running = true;
    cancel = false;

    while (!cancel) {
      clear();
      for (const frame of frames) {
        if (cancel) break;
        await sleep(frame.delay);
        if (cancel) break;
        addLine(frame);
      }
      if (cancel) break;
      await sleep(LOOP_PAUSE_MS);
    }

    running = false;
  }

  function stop() {
    cancel = true;
  }

  if (STATIC_MODE) {
    renderStatic();
    return;
  }

  // Only animate when the terminal is visible. Pause when the tab is hidden
  // or the user scrolls it out of view.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !document.hidden) {
          runLoop();
        } else {
          stop();
        }
      });
    },
    { threshold: 0.2 },
  );

  io.observe(terminal);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      // Restart if still in view.
      const rect = terminal.getBoundingClientRect();
      const inView =
        rect.bottom > 0 && rect.top < (window.innerHeight || 0) * 0.8;
      if (inView) runLoop();
    }
  });
})();
