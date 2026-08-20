const header = document.getElementById("siteHeader");
const menuButton = document.getElementById("menuButton");
const globalNav = document.getElementById("globalNav");

window.addEventListener("scroll", () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
});

if (menuButton && globalNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = globalNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  globalNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      globalNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const integrationMap = document.getElementById("integrationMap");
if (integrationMap) {
  const integrationObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) integrationMap.classList.add("is-visible");
    });
  }, { threshold: 0.35 });

  integrationObserver.observe(integrationMap);
}

const numberElements = document.querySelectorAll("[data-count]");
const numberObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.count);
    const duration = 900;
    const start = performance.now();

    const update = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
    observer.unobserve(el);
  });
}, { threshold: 0.6 });

numberElements.forEach(el => numberObserver.observe(el));


// Business division switcher
const divisionTabs = document.querySelectorAll(".division-tab");
const divisionPanels = document.querySelectorAll(".division-panel");

function activateDivision(name, updateUrl = true) {
  if (!divisionTabs.length || !divisionPanels.length) return;

  const validNames = [...divisionTabs].map(tab => tab.dataset.division);
  const target = validNames.includes(name) ? name : "solution";

  divisionTabs.forEach(tab => {
    const active = tab.dataset.division === target;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  divisionPanels.forEach(panel => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;

    if (active) {
      panel.querySelectorAll(".reveal").forEach(el => {
        el.classList.add("is-visible");
      });
    }
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("division", target);
    history.replaceState({}, "", url);
  }

  window.scrollTo({
    top: document.querySelector(".division-switch-wrap")?.offsetTop - 90 || 0,
    behavior: "smooth"
  });
}

if (divisionTabs.length) {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("division") || "solution";
  activateDivision(initial, false);

  divisionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activateDivision(tab.dataset.division, true);
    });
  });

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    activateDivision(params.get("division") || "solution", false);
  });
}


// Reflect active division theme on body for future global theming
function syncBusinessBodyTheme(name) {
  if (!document.body.classList.contains("business-page")) return;
  document.body.dataset.activeDivision = name;
}

if (divisionTabs.length) {
  const originalActivateDivision = activateDivision;
  activateDivision = function(name, updateUrl = true) {
    originalActivateDivision(name, updateUrl);
    const params = new URLSearchParams(window.location.search);
    const valid = ["solution","housing","accounting"];
    syncBusinessBodyTheme(valid.includes(name) ? name : (params.get("division") || "solution"));
  };

  const initialTheme = new URLSearchParams(window.location.search).get("division") || "solution";
  syncBusinessBodyTheme(initialTheme);
}
