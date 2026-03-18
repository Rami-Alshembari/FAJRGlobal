(() => {
  const config = window.FAJR_MASTER_CONFIG;
  if (!config) return;

  const formatNumber = (value, decimals = 0) =>
    new Intl.NumberFormat("en-GB", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(value);

  const byId = (id) => document.getElementById(id);

  function activateNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === page);
    });
  }

  function setupPrintAction() {
    document.querySelectorAll("[data-action='print']").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });
  }

  function animateCount(node) {
    const target = Number(node.dataset.value);
    const finalDisplay = node.dataset.display;
    if (!Number.isFinite(target)) {
      node.textContent = finalDisplay;
      return;
    }
    const duration = 850;
    const start = performance.now();
    const hasCurrency = finalDisplay.startsWith("$");
    const decimals = finalDisplay.includes(".") ? 2 : 0;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      if (hasCurrency && target >= 1000000 && !finalDisplay.includes(",")) {
        node.textContent = `$${(value / 1000000).toFixed(2)}M`;
      } else if (hasCurrency) {
        node.textContent = `$${formatNumber(value, decimals)}`;
      } else {
        node.textContent = formatNumber(value, decimals);
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        node.textContent = finalDisplay;
      }
    }

    requestAnimationFrame(step);
  }

  function renderOverviewMetrics() {
    const container = byId("overviewMetrics");
    if (!container) return;
    container.innerHTML = config.overviewMetrics.map((item) => `
      <article class="metric-card">
        <div class="metric-card__label">${item.label}</div>
        <div class="metric-card__value" data-value="${item.value}" data-display="${item.display}">${item.display}</div>
        <div class="metric-card__meta">${item.meta}</div>
      </article>
    `).join("");
    container.querySelectorAll(".metric-card__value").forEach(animateCount);
  }

  function renderProgramCards() {
    const container = byId("programCards");
    if (!container) return;
    const programs = Object.values(config.programs);
    container.innerHTML = programs.map((program) => `
      <article class="program-card" data-categories="${program.category.join(" ")}" data-search="${[
        program.title,
        program.summary,
        ...program.category,
        ...program.metrics.map((item) => item.label)
      ].join(" ").toLowerCase()}">
        <div class="program-card__top">
          <div>
            <p class="eyebrow">${program.shortTitle}</p>
            <h3>${program.title}</h3>
          </div>
          <div class="icon-badge">${program.icon}</div>
        </div>
        <p>${program.summary}</p>
        <div class="card-stat-list">
          ${program.heroStats.map((stat) => `
            <div class="card-stat">
              <span>${stat.label}</span>
              <strong>${stat.value}</strong>
            </div>
          `).join("")}
        </div>
        <div>
          <a class="button" href="${program.page}">Explore Dashboard</a>
        </div>
      </article>
    `).join("");
  }

  function setupProgramFilters() {
    const search = byId("programSearch");
    const chipContainer = byId("programFilters");
    const cards = () => Array.from(document.querySelectorAll(".program-card"));
    if (!search || !chipContainer) return;

    let activeFilter = "all";
    const update = () => {
      const query = search.value.trim().toLowerCase();
      cards().forEach((card) => {
        const categories = card.dataset.categories.split(" ");
        const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
        const matchesSearch = !query || card.dataset.search.includes(query);
        card.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
      });
    };

    search.addEventListener("input", update);
    chipContainer.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      chipContainer.querySelectorAll("[data-filter]").forEach((chip) => {
        chip.classList.toggle("is-active", chip === button);
      });
      update();
    });
  }

  function renderInsights() {
    const insightList = byId("insightList");
    const qualityNotes = byId("qualityNotes");
    if (insightList) {
      insightList.innerHTML = config.insights.map((item) => `
        <div class="insight-item">
          <strong>${item.title}</strong><br>${item.body}
        </div>
      `).join("");
    }
    if (qualityNotes) {
      qualityNotes.innerHTML = config.notes.map((item) => `
        <div class="note-item">
          <strong>${item.title}</strong><br>${item.body}
        </div>
      `).join("");
    }
  }

  function renderOverviewCharts() {
    if (!window.Chart) return;

    const volumeCanvas = byId("volumeChart");
    const structureCanvas = byId("structureChart");
    if (volumeCanvas) {
      new Chart(volumeCanvas, {
        type: "bar",
        data: {
          labels: config.charts.volume.labels,
          datasets: [{
            data: config.charts.volume.values,
            backgroundColor: [
              "rgba(23, 51, 71, 0.88)",
              "rgba(21, 122, 117, 0.82)",
              "rgba(184, 135, 70, 0.82)",
              "rgba(90, 109, 122, 0.78)",
              "rgba(35, 105, 129, 0.78)"
            ],
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#596d7a" } },
            y: {
              ticks: { color: "#596d7a", callback: (value) => formatNumber(value) },
              grid: { color: "rgba(20, 41, 57, 0.08)" }
            }
          }
        }
      });
    }

    if (structureCanvas) {
      new Chart(structureCanvas, {
        type: "bar",
        data: {
          labels: config.charts.structure.labels,
          datasets: [{
            data: config.charts.structure.values,
            backgroundColor: "rgba(21, 122, 117, 0.22)",
            borderColor: "rgba(21, 122, 117, 0.86)",
            borderWidth: 1.2,
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#596d7a" } },
            y: {
              ticks: { color: "#596d7a", callback: (value) => formatNumber(value) },
              grid: { color: "rgba(20, 41, 57, 0.08)" }
            }
          }
        }
      });
    }
  }

  function hydrateReportingScope() {
    const node = byId("reportingScope");
    if (node) {
      node.textContent = `Reporting scope: ${config.reportingScope}`;
    }
  }

  activateNav();
  setupPrintAction();
  hydrateReportingScope();
  renderOverviewMetrics();
  renderProgramCards();
  setupProgramFilters();
  renderInsights();
  renderOverviewCharts();
})();
