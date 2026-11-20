(() => {
  "use strict";

  // ---------------------------- Theme toggle ----------------------------

  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("norns-theme", next);
      } catch (_) {
        // storage unavailable — theme just won't persist
      }
    });
  }

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

  // Play the example once when it comes into view, then leave the chat visible.
  const demo = document.querySelector("[data-reminder-demo]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!demo || reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const steps = [...demo.querySelectorAll("[data-reminder-step]")];
  const controls = demo.querySelector(".reminder__controls");
  const status = demo.querySelector("[data-reminder-status]");
  const play = demo.querySelector("[data-reminder-play]");
  const frames = [
    { status: "Reminder saved", hold: 1800 },
    { status: "Worker off until Thursday", hold: 1800 },
    { status: "Worker wakes and sends the reminder", hold: 1600 },
    { status: "Run waits another hour", hold: 1300 },
    { status: "Worker sends the follow-up", hold: 1600 },
    { status: "Run complete" },
  ];
  let step = steps.length - 1;
  let timer;

  function pause() {
    clearTimeout(timer);
    timer = undefined;
  }

  function show(index) {
    step = index;
    steps.forEach((item, i) => {
      item.toggleAttribute("data-pending", i > index);
    });
    status.textContent = frames[index].status;
  }

  function advance() {
    if (step === steps.length - 1) {
      pause();
      play.textContent = "Replay";
      return;
    }

    play.textContent = "Pause";
    timer = setTimeout(() => {
      show(step + 1);
      advance();
    }, frames[step].hold);
  }

  play.addEventListener("click", () => {
    if (timer !== undefined) {
      pause();
      play.textContent = "Resume";
      return;
    }
    if (step === steps.length - 1) show(0);
    advance();
  });

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    controls.hidden = false;
    show(0);
    advance();
  }, { threshold: 0.25 });
  observer.observe(demo);
  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    observer.disconnect();
    pause();
    show(steps.length - 1);
    controls.hidden = true;
  });
})();
