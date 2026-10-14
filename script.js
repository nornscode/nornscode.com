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
})();
