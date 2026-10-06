// Filter chips
const filterChips = document.querySelectorAll(".filter-chip");
const labCards = document.querySelectorAll(".lab-card");
const filterEmpty = document.querySelector(".filter-empty");

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    let visibleCount = 0;

    filterChips.forEach((other) => {
      const isActive = other === chip;
      other.classList.toggle("is-active", isActive);
      other.setAttribute("aria-pressed", String(isActive));
    });

    labCards.forEach((card) => {
      const tags = card.dataset.tags.split(" ");
      const matches = filter === "all" || tags.includes(filter);

      card.hidden = !matches;
      if (matches) {
        card.classList.add("is-visible");
        visibleCount += 1;
      }
    });

    if (filterEmpty) filterEmpty.hidden = visibleCount > 0;
  });
});

// Embedded live demos: the iframe is only created on demand so hosted apps
// are not woken up (or slowed down) for visitors who never open them.
const loadDemo = (demoWindow) => {
  if (demoWindow.querySelector("iframe")) return;

  const body = demoWindow.querySelector(".demo-body");
  const iframe = document.createElement("iframe");

  iframe.src = demoWindow.dataset.src;
  iframe.title = `${demoWindow.querySelector(".demo-url").textContent} live demo`;
  iframe.loading = "lazy";
  iframe.allow = "clipboard-write";

  body.classList.add("is-loading");
  iframe.addEventListener("load", () => body.classList.remove("is-loading"));

  body.replaceChildren(iframe);
};

document.querySelectorAll(".demo-launch").forEach((button) => {
  button.addEventListener("click", () => {
    const demoWindow = document.querySelector(
      `[data-demo-window="${button.dataset.demo}"]`
    );
    if (!demoWindow) return;

    loadDemo(demoWindow);
    button.innerHTML = "Demo running <span>●</span>";
    button.disabled = true;
    demoWindow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

document.querySelectorAll(".demo-placeholder").forEach((placeholder) => {
  placeholder.addEventListener("click", () => {
    const demoWindow = placeholder.closest(".demo-window");
    const launchButton = document.querySelector(
      `.demo-launch[data-demo="${demoWindow.dataset.demoWindow}"]`
    );

    if (launchButton) launchButton.click();
    else loadDemo(demoWindow);
  });
});

// Expand a demo to fill the screen
document.querySelectorAll(".demo-expand").forEach((button) => {
  const demoWindow = button.closest(".demo-window");

  const setExpanded = (isExpanded) => {
    demoWindow.classList.toggle("is-expanded", isExpanded);
    document.body.classList.toggle("demo-open", isExpanded);
    button.setAttribute("aria-label", isExpanded ? "Collapse demo" : "Expand demo");
    button.textContent = isExpanded ? "✕" : "⤢";
  };

  button.addEventListener("click", () => {
    loadDemo(demoWindow);
    setExpanded(!demoWindow.classList.contains("is-expanded"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && demoWindow.classList.contains("is-expanded")) {
      setExpanded(false);
      button.focus();
    }
  });
});

// Live repository list from GitHub
const repoGrid = document.querySelector(".repo-grid");
const GITHUB_USER = "Developer-aadi-AI";
// Repos already featured above, or not useful to show here
const HIDDEN_REPOS = ["chatmyvideo", "vendor-invoice-system", "portfolio"];

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const prettifyName = (name) => name.replace(/[-_]+/g, " ");

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

const renderRepos = (repos) => {
  const visible = repos
    .filter((repo) => !repo.fork && !HIDDEN_REPOS.includes(repo.name.toLowerCase()))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  if (!visible.length) {
    repoGrid.innerHTML = '<p class="muted repo-status">No public repositories to show yet.</p>';
    return;
  }

  repoGrid.innerHTML = visible
    .map((repo) => {
      const description = repo.description || "Source code and notes on GitHub.";
      const homepage = repo.homepage
        ? `<a class="text-link" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">Live ↗</a>`
        : "";

      return `
        <article class="repo-card">
          <div class="work-meta">
            <span>${escapeHtml(repo.language || "Code")}</span>
            <span>${formatDate(repo.pushed_at)}</span>
          </div>
          <h3>${escapeHtml(prettifyName(repo.name))}</h3>
          <p>${escapeHtml(description)}</p>
          <div class="repo-links">
            <a class="text-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">Code ↗</a>
            ${homepage}
          </div>
        </article>`;
    })
    .join("");
};

if (repoGrid) {
  fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`)
    .then((response) => {
      if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
      return response.json();
    })
    .then(renderRepos)
    .catch(() => {
      repoGrid.innerHTML =
        '<p class="muted repo-status">Couldn\'t reach GitHub right now. Use the link below to browse the repositories.</p>';
    });
}
