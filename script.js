const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  const closeMenu = () => {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  };

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close the mobile menu when tapping anywhere outside it
  document.addEventListener("click", (event) => {
    if (
      siteNav.classList.contains("is-open") &&
      !siteNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Theme toggle: an explicit choice is saved; otherwise the OS setting is used
const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const currentTheme = () =>
    root.dataset.theme || (prefersDark.matches ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (error) {}
  });
}

// Give the header a background once the page is scrolled
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

// Highlight the nav link for the section currently in view
const sectionLinks = document.querySelectorAll('.site-nav a[href^="#"]');

if (sectionLinks.length && "IntersectionObserver" in window) {
  const linkFor = new Map();

  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) linkFor.set(section, link);
  });

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        sectionLinks.forEach((link) => link.classList.remove("is-active"));
        linkFor.get(entry.target).classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  linkFor.forEach((link, section) => spyObserver.observe(section));
}

// Copy email address to the clipboard
document.querySelectorAll(".copy-email").forEach((button) => {
  const label = button.querySelector(".copy-label");

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      label.textContent = "Copied ✓";
    } catch (error) {
      label.textContent = "Press Ctrl+C";
    }

    button.classList.add("is-copied");
    setTimeout(() => {
      label.textContent = "Copy";
      button.classList.remove("is-copied");
    }, 2000);
  });
});
