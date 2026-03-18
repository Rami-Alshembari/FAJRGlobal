(() => {
  const config = window.FAJR_MASTER_CONFIG;
  if (!config) return;

  const programKey = document.body.dataset.program;
  const program = config.programs[programKey];
  const mount = document.getElementById("programPage");
  const mainHref = window.location.pathname.endsWith("/index.html") ? "index.html" : "../index.html";
  if (!program || !mount) return;

  const metricsMarkup = program.metrics.map((item) => `
    <article class="metric-card">
      <div class="metric-card__label">${item.label}</div>
      <div class="metric-card__value" data-value="${typeof item.value === "number" ? item.value : ""}" data-display="${item.display}">${item.display}</div>
      <div class="metric-card__meta">${item.meta}</div>
    </article>
  `).join("");

  const heroStatsMarkup = program.heroStats.map((stat) => `<span>${stat.label}: ${stat.value}</span>`).join("");
  const narrativeMarkup = program.narrative.map((paragraph) => `<p>${paragraph}</p>`).join("");
  const impactMarkup = program.impactCards.map((item) => `
    <article class="impact-card">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
  const miniStatsMarkup = program.miniStats.map((item) => `
    <div class="mini-stat">
      <strong>${item.title}</strong>
      <div>${item.body}</div>
    </div>
  `).join("");

  const legacyActionMarkup = `<a class="button" href="${program.legacyPath.replace("?embed=1", "")}" target="_blank" rel="noreferrer">${program.legacyLabel}</a>`;

  const legacySectionMarkup = `
    <section class="section legacy-shell">
      <div class="legacy-header">
        <div>
          <p class="eyebrow">Detailed Analytics</p>
          <h3>Preserved source dashboard</h3>
          <p>The original dashboard remains available here inside the unified platform so all detailed charts, tables, and interactions remain accessible.</p>
        </div>
        <div class="legacy-actions">
          <a class="button" href="${program.legacyPath.replace("?embed=1", "")}" target="_blank" rel="noreferrer">Open in separate tab</a>
        </div>
      </div>
      <iframe class="legacy-frame" title="${program.title} detailed dashboard" src="${program.legacyPath}" loading="lazy"></iframe>
    </section>`;

  mount.innerHTML = `
    <section class="hero-panel">
      <div class="program-hero">
        <div>
          <p class="eyebrow">Program Module</p>
          <h2 class="program-shell-title">${program.title}</h2>
        </div>
        <p class="hero-text">${program.summary}</p>
        <div class="program-meta">${heroStatsMarkup}</div>
        <div class="program-hero__actions">
          ${legacyActionMarkup}
          <a class="button button--ghost" href="${mainHref}">Main Dashboard</a>
        </div>
      </div>
      <aside class="panel panel--soft">
        <div class="panel__header">
          <div>
            <p class="eyebrow eyebrow--gold">Strategic Context</p>
            <h3>How this module fits the portfolio</h3>
          </div>
        </div>
        <div class="mini-stats">${miniStatsMarkup}</div>
      </aside>
    </section>

    <section class="section">
      <div class="metric-grid">${metricsMarkup}</div>
    </section>

    <section class="section two-column">
      <article class="panel program-chart-panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Program Summary</p>
            <h3>${program.chart.title}</h3>
          </div>
          <p class="panel__annotation">A compact executive view before entering the full embedded dashboard.</p>
        </div>
        <div class="chart-wrap">
          <canvas id="programChart"></canvas>
        </div>
      </article>
      <article class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Narrative</p>
            <h3>Executive interpretation</h3>
          </div>
        </div>
        <div class="program-story">${narrativeMarkup}</div>
      </article>
    </section>

    <section class="section">
      <div class="impact-grid">${impactMarkup}</div>
    </section>

    ${legacySectionMarkup}
  `;

  mount.querySelectorAll(".metric-card__value").forEach((node) => {
    const target = Number(node.dataset.value);
    if (!Number.isFinite(target)) return;
    const finalDisplay = node.dataset.display;
    const start = performance.now();
    const duration = 850;
    const decimals = finalDisplay.includes(".") ? 2 : 0;
    const hasCurrency = finalDisplay.startsWith("$");

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      node.textContent = hasCurrency
        ? `$${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value)}`
        : new Intl.NumberFormat("en-GB", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        node.textContent = finalDisplay;
      }
    }

    requestAnimationFrame(step);
  });

  if (window.Chart) {
    const chartCanvas = document.getElementById("programChart");
    if (chartCanvas) {
      new Chart(chartCanvas, {
        type: program.chart.type,
        data: {
          labels: program.chart.labels,
          datasets: [{
            data: program.chart.values,
            backgroundColor: [
              "rgba(23, 51, 71, 0.86)",
              "rgba(21, 122, 117, 0.82)",
              "rgba(184, 135, 70, 0.82)",
              "rgba(89, 110, 124, 0.75)",
              "rgba(93, 155, 143, 0.7)"
            ],
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: 1.2,
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: program.chart.type === "doughnut",
              position: "bottom"
            }
          },
          scales: program.chart.type === "doughnut" ? {} : {
            x: { grid: { display: false }, ticks: { color: "#596d7a" } },
            y: { grid: { color: "rgba(20, 41, 57, 0.08)" }, ticks: { color: "#596d7a" } }
          }
        }
      });
    }
  }
})();
