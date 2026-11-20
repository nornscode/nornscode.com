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

  // Play each conversation once as it comes into view.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  document.querySelectorAll("[data-reminder-demo]").forEach((demo) => {
    const steps = [...demo.querySelectorAll("[data-reminder-step]")];
    const controls = demo.querySelector(".reminder__controls");
    const status = demo.querySelector("[data-reminder-status]");
    const play = demo.querySelector("[data-reminder-play]");
    const title = demo.querySelector("figcaption strong").textContent;
    let step = steps.length - 1;
    let timer;

    function setButton(label) {
      play.textContent = label;
      play.setAttribute("aria-label", label + " — " + title);
    }

    function pause() {
      clearTimeout(timer);
      timer = undefined;
    }

    function show(index) {
      step = index;
      steps.forEach((item, i) => {
        item.toggleAttribute("data-pending", i > index);
      });
      if (status) status.textContent = steps[index].dataset.reminderStep;
    }

    function advance() {
      if (step === steps.length - 1) {
        pause();
        setButton("Replay");
        return;
      }

      setButton("Pause");
      const current = steps[step];
      const hold = Number(current.dataset.hold) || Math.min(2500, 750 + current.textContent.trim().length * 12);
      timer = setTimeout(() => {
        show(step + 1);
        advance();
      }, hold);
    }

    play.addEventListener("click", () => {
      if (timer !== undefined) {
        pause();
        setButton("Resume");
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
  });
})();
