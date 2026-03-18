(() => {
  const data = window.FAJR_PORTFOLIO_DATA;
  if (!data) {
    throw new Error("FAJR portfolio data is missing.");
  }

  const state = {
    sector: "All",
    location: "All",
    funding: "All",
    search: "",
    sortKey: "projectName",
    sortDirection: "asc",
    activeProjectId: null,
  };

  const tooltip = document.getElementById("tooltip");
  const tableColumns = [
    { key: "projectName", label: "Project", sortable: true },
    { key: "location", label: "Location", sortable: true },
    { key: "sector", label: "Sector", sortable: true },
    { key: "formattedStartDate", label: "Start Date", sortable: true },
    { key: "formattedEndDate", label: "End Date", sortable: true },
    { key: "formattedBudget", label: "Budget", sortable: true },
    { key: "formattedBeneficiaries", label: "Beneficiaries", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "fundingSource", label: "Funding Source", sortable: true },
  ];

  const palette = {
    navy: "#173347",
    teal: "#157a75",
    tealSoft: "#9fd3cc",
    gold: "#b88746",
    sand: "#e6d7c4",
    coral: "#b66a57",
    slate: "#678190",
    ink: "#132736",
    cloud: "#edf2f4",
  };

  const formatNumber = (value) => (value == null ? "Unknown" : Number(value).toLocaleString("en-GB"));
  const formatPercent = (value) => (value == null ? "Unknown" : `${Number(value).toFixed(1)}%`);
  const formatCurrency = (value) => (value == null ? "Unknown" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value));
  const formatDate = (value) => {
    if (!value) return "Unknown";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
  };
  const titleCase = (text) => text.replace(/\b\w/g, (char) => char.toUpperCase());

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    byId(id).textContent = value;
  }

  function downloadCleanData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fajr-global-portfolio-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function uniqueOptions(key) {
    return ["All", ...new Set(data.records.map((record) => record[key]).filter(Boolean))];
  }

  function populateSelect(id, options) {
    const select = byId(id);
    select.innerHTML = "";
    options.forEach((option) => {
      const node = document.createElement("option");
      node.value = option;
      node.textContent = option;
      select.appendChild(node);
    });
  }

  function recordMatchesSearch(record, query) {
    if (!query) return true;
    const haystack = [
      record.projectId,
      record.projectName,
      record.location,
      record.sector,
      record.fundingSource,
      record.status,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function getFilteredRecords() {
    return data.records.filter((record) => {
      if (state.sector !== "All" && record.sector !== state.sector) return false;
      if (state.location !== "All" && record.location !== state.location) return false;
      if (state.funding !== "All" && record.fundingSource !== state.funding) return false;
      if (!recordMatchesSearch(record, state.search)) return false;
      return true;
    });
  }

  function sum(records, key) {
    return records.reduce((total, record) => total + (record[key] || 0), 0);
  }

  function groupRecords(records, key, metricKey) {
    const grouped = new Map();
    records.forEach((record) => {
      const bucket = record[key] || "Unspecified";
      if (!grouped.has(bucket)) {
        grouped.set(bucket, { label: bucket, count: 0, metric: 0 });
      }
      const current = grouped.get(bucket);
      current.count += 1;
      current.metric += metricKey ? record[metricKey] || 0 : 0;
    });
    return [...grouped.values()].sort((a, b) => b.count - a.count || b.metric - a.metric || a.label.localeCompare(b.label));
  }

  function buildDerived(records) {
    const knownBudget = records.filter((record) => record.numericBudget != null);
    const withDates = records.filter((record) => record.startDate && record.endDate);
    const totalKnownBudget = sum(records, "numericBudget");
    const totalBeneficiaries = sum(records, "beneficiaries");
    const earliestStart = withDates.length ? withDates.map((record) => record.startDate).sort()[0] : null;
    const latestEnd = withDates.length ? withDates.map((record) => record.endDate).sort().slice(-1)[0] : null;

    return {
      totals: {
        projects: records.length,
        beneficiaries: totalBeneficiaries,
        knownBudget: totalKnownBudget,
        averageBeneficiariesPerProject: records.length ? totalBeneficiaries / records.length : null,
        averageBudgetPerKnownProject: knownBudget.length ? totalKnownBudget / knownBudget.length : null,
        sectorCount: new Set(records.map((record) => record.sector)).size,
        locationCount: new Set(records.map((record) => record.location)).size,
        completionRate: records.length ? (records.filter((record) => record.status === "Completed").length / records.length) * 100 : null,
        missingBudgetCount: records.filter((record) => !record.budgetKnown).length,
        earliestStart,
        latestEnd,
      },
      bySector: groupRecords(records, "sector", "beneficiaries"),
      byLocation: groupRecords(records, "location", "beneficiaries"),
      byStatus: groupRecords(records, "status"),
      budgetProjects: [...knownBudget].sort((a, b) => b.numericBudget - a.numericBudget),
      beneficiaryProjects: [...records]
        .filter((record) => record.beneficiaries != null)
        .sort((a, b) => b.beneficiaries - a.beneficiaries),
      timeline: [...withDates].sort((a, b) => a.startDate.localeCompare(b.startDate)),
      scatter: records.filter((record) => record.numericBudget != null && record.beneficiaries != null),
      beneficiaryByLocation: groupRecords(records, "location", "beneficiaries"),
      topBudget: knownBudget.length ? [...knownBudget].sort((a, b) => b.numericBudget - a.numericBudget)[0] : null,
      topBeneficiaries: records.filter((record) => record.beneficiaries != null).sort((a, b) => b.beneficiaries - a.beneficiaries)[0] || null,
    };
  }

  function buildExecutiveText(records, derived) {
    if (!records.length) {
      return {
        hero: "No projects match the active filter set. Reset the filters to restore the full portfolio view.",
        overview: "The current filter selection returns no records, so no evidence-based portfolio interpretation can be shown.",
      };
    }

    const topSector = derived.bySector[0];
    const topLocation = derived.byLocation[0];
    const topBudget = derived.topBudget;
    const topBeneficiaries = derived.topBeneficiaries;

    return {
      hero: `${formatNumber(derived.totals.projects)} projects in view, reaching ${formatNumber(derived.totals.beneficiaries)} beneficiaries with ${formatCurrency(derived.totals.knownBudget)} in disclosed budget. ${topSector ? `${topSector.label} is the largest sector in the active view.` : ""}`,
      overview: `${topLocation ? `${topLocation.label} carries the strongest delivery presence in the active slice.` : ""} ${topBudget ? `${topBudget.projectName} is the highest-budget disclosed intervention.` : ""} ${topBeneficiaries ? `${topBeneficiaries.projectName} reaches the largest beneficiary cohort.` : ""}`.trim(),
    };
  }

  function renderKpis(derived) {
    const metrics = [
      ["Total projects", formatNumber(derived.totals.projects), "Count of populated projects after blank-row removal"],
      ["Total beneficiaries reached", formatNumber(derived.totals.beneficiaries), "Reported reach across all projects in the active view"],
      ["Total known budget", formatCurrency(derived.totals.knownBudget), "Budget aggregation excludes projects marked under review or missing"],
      ["Average beneficiaries per project", formatNumber(derived.totals.averageBeneficiariesPerProject), "Simple portfolio-level mean across filtered projects"],
      ["Average budget per known project", formatCurrency(derived.totals.averageBudgetPerKnownProject), "Calculated only across projects with numeric budgets"],
      ["Number of sectors", formatNumber(derived.totals.sectorCount), "Distinct sectors represented in the active slice"],
      ["Number of locations", formatNumber(derived.totals.locationCount), "Distinct normalized geographies represented"],
      ["Project completion rate", formatPercent(derived.totals.completionRate), "Share of projects marked completed"],
      ["Projects with missing or non-standard budgets", formatNumber(derived.totals.missingBudgetCount), "Includes under-review or blank budget values"],
      ["Portfolio time span", `${formatDate(derived.totals.earliestStart)} to ${formatDate(derived.totals.latestEnd)}`, "Earliest start and latest end dates in the filtered set"],
    ];

    const grid = byId("kpi-grid");
    grid.innerHTML = "";

    metrics.forEach(([label, value, meta]) => {
      const card = document.createElement("article");
      card.className = "kpi-card";
      card.innerHTML = `
        <p class="kpi-card__label">${label}</p>
        <div class="kpi-card__value" data-countup="${String(value).replace(/[^0-9.]/g, "")}" data-display="${value}">${value}</div>
        <div class="kpi-card__meta">${meta}</div>
      `;
      grid.appendChild(card);
    });

    animateCountUp();
  }

  function animateCountUp() {
    document.querySelectorAll("[data-countup]").forEach((node) => {
      const raw = node.getAttribute("data-countup");
      const finalDisplay = node.getAttribute("data-display");
      const target = Number(raw);
      if (!Number.isFinite(target) || String(finalDisplay).includes("to")) {
        node.textContent = finalDisplay;
        return;
      }

      const duration = 900;
      const start = performance.now();
      const isCurrency = finalDisplay.startsWith("$");
      const isPercent = finalDisplay.endsWith("%");

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        if (isCurrency) {
          node.textContent = formatCurrency(value);
        } else if (isPercent) {
          node.textContent = `${value.toFixed(1)}%`;
        } else {
          node.textContent = formatNumber(Math.round(value));
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          node.textContent = finalDisplay;
        }
      }

      requestAnimationFrame(step);
    });
  }

  function renderInsights(records, derived) {
    const grid = byId("insight-grid");
    grid.innerHTML = "";
    const cards = data.insights.slice(0, 6);

    cards.forEach((item) => {
      const card = document.createElement("article");
      card.className = "insight-card";
      card.innerHTML = `
        <p class="eyebrow">${item.title}</p>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      `;
      grid.appendChild(card);
    });

    const nonNumeric = records.filter((record) => !record.budgetKnown).length;
    setText(
      "sector-annotation",
      derived.bySector.length
        ? `${derived.bySector[0].label} leads by project count in the active view.`
        : "No sector data available."
    );
    setText(
      "location-annotation",
      derived.byLocation.length
        ? `${derived.byLocation[0].label} carries the strongest project footprint in the active selection.`
        : "No location data available."
    );
    setText(
      "beneficiary-annotation",
      derived.topBeneficiaries
        ? `${derived.topBeneficiaries.projectName} reaches the largest reported beneficiary cohort.`
        : "No beneficiary counts available."
    );
    setText(
      "timeline-annotation",
      derived.timeline.length
        ? `The active timeline spans ${formatDate(derived.totals.earliestStart)} to ${formatDate(derived.totals.latestEnd)}.`
        : "No dated projects are available in the current view."
    );
    byId("analysis-overview").textContent = nonNumeric
      ? `${buildExecutiveText(records, derived).overview} ${nonNumeric} project${nonNumeric === 1 ? "" : "s"} in this view still carry non-standard budget values.`
      : buildExecutiveText(records, derived).overview;
  }

  function renderStories(records) {
    const stories = [...records]
      .sort((a, b) => (b.beneficiaries || 0) - (a.beneficiaries || 0))
      .slice(0, 6);
    const grid = byId("story-grid");
    grid.innerHTML = "";

    stories.forEach((record) => {
      const card = document.createElement("article");
      card.className = "story-card";
      card.innerHTML = `
        <div class="story-card__meta">${record.sector} · ${record.location}</div>
        <h3>${record.projectName}</h3>
        <p>${record.impactStory}</p>
        <p class="note-chip">Reported reach: ${record.formattedBeneficiaries} beneficiaries · Budget: ${record.formattedBudget}</p>
      `;
      grid.appendChild(card);
    });
  }

  function mountTooltip() {
    document.addEventListener("mousemove", (event) => {
      if (!tooltip.classList.contains("is-visible")) return;
      tooltip.style.left = `${event.clientX + 18}px`;
      tooltip.style.top = `${event.clientY + 18}px`;
    });
  }

  function showTooltip(html) {
    tooltip.innerHTML = html;
    tooltip.classList.add("is-visible");
  }

  function hideTooltip() {
    tooltip.classList.remove("is-visible");
  }

  function bindHover(node, html) {
    node.addEventListener("mouseenter", () => showTooltip(html));
    node.addEventListener("mouseleave", hideTooltip);
  }

  function bindProjectSelection(node, projectId) {
    if (!projectId) return;
    node.style.cursor = "pointer";
    node.addEventListener("click", () => {
      state.activeProjectId = state.activeProjectId === projectId ? null : projectId;
      render();
    });
  }

  function createSvg(container, width, height) {
    container.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "chart-svg");
    container.appendChild(svg);
    return svg;
  }

  function renderEmptyState(containerId, message) {
    const container = byId(containerId);
    const svg = createSvg(container, 640, 240);
    const text = appendSvg("text", {
      x: 320,
      y: 120,
      "text-anchor": "middle",
      fill: palette.slate,
      "font-size": "14",
      "font-family": "Manrope, sans-serif",
    }, svg);
    text.textContent = message;
  }

  function appendSvg(type, attributes, parent) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", type);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  }

  function renderVerticalBarChart(containerId, items, config) {
    const container = byId(containerId);
    const width = 740;
    const height = 340;
    const margin = { top: 16, right: 20, bottom: 70, left: 56 };
    const svg = createSvg(container, width, height);
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(...items.map((item) => item.value), 0);
    const barWidth = items.length ? chartWidth / items.length * 0.64 : 0;

    for (let tick = 0; tick <= 4; tick += 1) {
      const value = maxValue * (tick / 4);
      const y = margin.top + chartHeight - (value / (maxValue || 1)) * chartHeight;
      appendSvg("line", { x1: margin.left, y1: y, x2: width - margin.right, y2: y, stroke: "rgba(23,51,71,0.12)", "stroke-dasharray": "4 6" }, svg);
      const label = appendSvg("text", { x: margin.left - 10, y: y + 4, "text-anchor": "end", class: "small-label" }, svg);
      label.textContent = config.tickFormat(value);
    }

    items.forEach((item, index) => {
      const x = margin.left + (index + 0.18) * (chartWidth / Math.max(items.length, 1));
      const barHeight = (item.value / (maxValue || 1)) * chartHeight;
      const y = margin.top + chartHeight - barHeight;
      const isActive = state.activeProjectId && item.projectId === state.activeProjectId;
      const bar = appendSvg("rect", {
        x,
        y,
        width: barWidth,
        height: Math.max(barHeight, 0),
        rx: 10,
        fill: item.color || config.color,
        class: `bar${isActive ? " is-active" : ""}`,
      }, svg);
      bindHover(bar, config.tooltip(item));
      bindProjectSelection(bar, item.projectId);

      const label = appendSvg("text", {
        x: x + barWidth / 2,
        y: height - 28,
        "text-anchor": "end",
        transform: `rotate(-34 ${x + barWidth / 2} ${height - 28})`,
        class: "label-text",
      }, svg);
      label.textContent = item.label;
    });
  }

  function renderHorizontalBarChart(containerId, items, config) {
    const container = byId(containerId);
    const width = 640;
    const height = Math.max(280, items.length * 48 + 40);
    const margin = { top: 12, right: 24, bottom: 24, left: 220 };
    const svg = createSvg(container, width, height);
    const chartWidth = width - margin.left - margin.right;
    const rowHeight = items.length ? (height - margin.top - margin.bottom) / items.length : 0;
    const maxValue = Math.max(...items.map((item) => item.value), 0);

    items.forEach((item, index) => {
      const y = margin.top + index * rowHeight + 8;
      const barWidth = (item.value / (maxValue || 1)) * chartWidth;
      const isActive = state.activeProjectId && item.projectId === state.activeProjectId;

      const label = appendSvg("text", {
        x: margin.left - 12,
        y: y + rowHeight / 2 + 4,
        "text-anchor": "end",
        class: "label-text",
      }, svg);
      label.textContent = item.label;

      const bar = appendSvg("rect", {
        x: margin.left,
        y,
        width: Math.max(barWidth, 2),
        height: rowHeight - 16,
        rx: 10,
        fill: item.color || config.color,
        class: `bar${isActive ? " is-active" : ""}`,
      }, svg);
      bindHover(bar, config.tooltip(item));
      bindProjectSelection(bar, item.projectId);

      const value = appendSvg("text", {
        x: margin.left + barWidth + 10,
        y: y + rowHeight / 2 + 4,
        class: "label-text",
      }, svg);
      value.textContent = config.valueFormat(item.value);
    });
  }

  function renderDonutChart(containerId, items) {
    if (!items.length) {
      renderEmptyState(containerId, "No status data available for the active filters.");
      return;
    }
    const container = byId(containerId);
    const width = 320;
    const height = 280;
    const svg = createSvg(container, width, height);
    const centerX = 110;
    const centerY = 136;
    const radius = 72;
    const total = items.reduce((sumValue, item) => sumValue + item.count, 0) || 1;
    let startAngle = -Math.PI / 2;
    const colors = [palette.teal, palette.navy, palette.gold, palette.coral];

    items.forEach((item, index) => {
      const angle = (item.count / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const segment = appendSvg("path", {
        d: pathData,
        fill: colors[index % colors.length],
        opacity: "0.94",
        class: "donut-segment",
      }, svg);
      bindHover(segment, `<strong>${item.label}</strong><br>${item.count} project(s)`);
      startAngle = endAngle;
    });

    appendSvg("circle", { cx: centerX, cy: centerY, r: 42, fill: "#fffaf5" }, svg);
    const totalLabel = appendSvg("text", { x: centerX, y: centerY - 4, "text-anchor": "middle", fill: palette.navy, "font-size": "30", "font-family": "Fraunces, serif" }, svg);
    totalLabel.textContent = String(total);
    const subLabel = appendSvg("text", { x: centerX, y: centerY + 18, "text-anchor": "middle", class: "small-label" }, svg);
    subLabel.textContent = "projects";

    items.forEach((item, index) => {
      const y = 52 + index * 28;
      appendSvg("rect", { x: 208, y: y - 10, width: 12, height: 12, rx: 4, fill: colors[index % colors.length] }, svg);
      const text = appendSvg("text", { x: 228, y, class: "label-text" }, svg);
      text.textContent = `${item.label} (${item.count})`;
    });
  }

  function renderScatterPlot(containerId, items) {
    const container = byId(containerId);
    const width = 640;
    const height = 340;
    const margin = { top: 20, right: 24, bottom: 48, left: 70 };
    const svg = createSvg(container, width, height);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const maxBudget = Math.max(...items.map((item) => item.numericBudget), 0);
    const maxBeneficiaries = Math.max(...items.map((item) => item.beneficiaries), 0);

    for (let tick = 0; tick <= 4; tick += 1) {
      const xValue = maxBudget * (tick / 4);
      const x = margin.left + (xValue / (maxBudget || 1)) * plotWidth;
      appendSvg("line", { x1: x, y1: margin.top, x2: x, y2: height - margin.bottom, stroke: "rgba(23,51,71,0.08)" }, svg);
      const label = appendSvg("text", { x, y: height - 18, "text-anchor": "middle", class: "small-label" }, svg);
      label.textContent = formatCurrency(xValue);
    }

    for (let tick = 0; tick <= 4; tick += 1) {
      const yValue = maxBeneficiaries * (tick / 4);
      const y = margin.top + plotHeight - (yValue / (maxBeneficiaries || 1)) * plotHeight;
      appendSvg("line", { x1: margin.left, y1: y, x2: width - margin.right, y2: y, stroke: "rgba(23,51,71,0.08)" }, svg);
      const label = appendSvg("text", { x: margin.left - 12, y: y + 4, "text-anchor": "end", class: "small-label" }, svg);
      label.textContent = formatNumber(yValue);
    }

    items.forEach((item) => {
      const x = margin.left + (item.numericBudget / (maxBudget || 1)) * plotWidth;
      const y = margin.top + plotHeight - (item.beneficiaries / (maxBeneficiaries || 1)) * plotHeight;
      const radius = 7 + Math.min(18, (item.projectDurationDays || 10) / 8);
      const isActive = state.activeProjectId === item.projectId;
      const dot = appendSvg("circle", {
        cx: x,
        cy: y,
        r: radius,
        fill: item.sector === "Education" ? palette.gold : palette.teal,
        opacity: "0.82",
        class: `dot${isActive ? " is-active" : ""}`,
      }, svg);
      bindHover(
        dot,
        `<strong>${item.projectName}</strong><br>Budget: ${formatCurrency(item.numericBudget)}<br>Beneficiaries: ${formatNumber(item.beneficiaries)}<br>Budget per beneficiary: ${item.budgetPerBeneficiary ? formatCurrency(item.budgetPerBeneficiary) : "Unknown"}`
      );
      bindProjectSelection(dot, item.projectId);
    });
  }

  function renderTimeline(containerId, items) {
    if (!items.length) {
      renderEmptyState(containerId, "No timeline data available for the active filters.");
      return;
    }
    const container = byId(containerId);
    const width = 1100;
    const height = Math.max(300, items.length * 42 + 80);
    const margin = { top: 18, right: 28, bottom: 50, left: 250 };
    const svg = createSvg(container, width, height);
    const minDate = Math.min(...items.map((item) => new Date(`${item.startDate}T00:00:00`).getTime()));
    const maxDate = Math.max(...items.map((item) => new Date(`${item.endDate}T00:00:00`).getTime()));
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const colors = { Relief: palette.teal, Education: palette.gold, Unspecified: palette.slate };

    const tickCount = 5;
    for (let tick = 0; tick <= tickCount; tick += 1) {
      const time = minDate + ((maxDate - minDate) * tick) / tickCount;
      const x = margin.left + ((time - minDate) / (maxDate - minDate || 1)) * chartWidth;
      appendSvg("line", { x1: x, y1: margin.top, x2: x, y2: height - margin.bottom, stroke: "rgba(23,51,71,0.08)" }, svg);
      const label = appendSvg("text", { x, y: height - 18, "text-anchor": "middle", class: "small-label" }, svg);
      label.textContent = formatDate(new Date(time).toISOString().slice(0, 10));
    }

    items.forEach((item, index) => {
      const y = margin.top + index * (chartHeight / items.length) + 8;
      const start = new Date(`${item.startDate}T00:00:00`).getTime();
      const end = new Date(`${item.endDate}T00:00:00`).getTime();
      const x = margin.left + ((start - minDate) / (maxDate - minDate || 1)) * chartWidth;
      const widthValue = Math.max(6, ((end - start) / (maxDate - minDate || 1)) * chartWidth);
      const isActive = state.activeProjectId === item.projectId;

      const label = appendSvg("text", {
        x: margin.left - 14,
        y: y + 16,
        "text-anchor": "end",
        class: "label-text",
      }, svg);
      label.textContent = item.projectName;

      const bar = appendSvg("rect", {
        x,
        y,
        width: widthValue,
        height: 22,
        rx: 10,
        fill: colors[item.sector] || palette.slate,
        opacity: "0.9",
        class: `timeline-bar${isActive ? " is-active" : ""}`,
      }, svg);
      bindHover(
        bar,
        `<strong>${item.projectName}</strong><br>${formatDate(item.startDate)} to ${formatDate(item.endDate)}<br>Duration: ${formatNumber(item.projectDurationDays)} days<br>${item.location}`
      );
      bindProjectSelection(bar, item.projectId);
    });
  }

  function renderLocationBeneficiaries(items) {
    const shell = byId("location-beneficiaries");
    shell.innerHTML = "";
    const maxVal = Math.max(...items.map((item) => item.metric), 0);
    items.forEach((item) => {
      const node = document.createElement("div");
      node.className = "metric-pill";
      const pct = maxVal ? (item.metric / maxVal) * 100 : 0;
      node.innerHTML = `
        <strong>${formatNumber(item.metric)}</strong>
        <span>${item.label}</span>
        <div class="metric-pill__bar">
          <div class="metric-pill__fill" style="width:0%" data-target="${pct}"></div>
        </div>
      `;
      shell.appendChild(node);
    });
    // Animate bars after a frame
    requestAnimationFrame(() => {
      shell.querySelectorAll(".metric-pill__fill").forEach((fill) => {
        fill.style.width = `${fill.dataset.target}%`;
      });
    });
  }

  function sortRecords(records) {
    const sortValue = (record, key) => {
      const value = record[key];
      if (key === "formattedBudget") return record.numericBudget ?? -1;
      if (key === "formattedBeneficiaries") return record.beneficiaries ?? -1;
      if (key === "formattedStartDate") return record.startDate || "";
      if (key === "formattedEndDate") return record.endDate || "";
      return value ?? "";
    };

    return [...records].sort((a, b) => {
      const left = sortValue(a, state.sortKey);
      const right = sortValue(b, state.sortKey);
      const factor = state.sortDirection === "asc" ? 1 : -1;
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }
      return String(left).localeCompare(String(right)) * factor;
    });
  }

  function renderTable(records) {
    const head = byId("table-head");
    const body = byId("table-body");

    head.innerHTML = "";
    const row = document.createElement("tr");
    tableColumns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column.label;
      if (state.sortKey === column.key) {
        th.setAttribute("aria-sort", state.sortDirection === "asc" ? "ascending" : "descending");
      }
      th.addEventListener("click", () => {
        if (state.sortKey === column.key) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = column.key;
          state.sortDirection = column.key === "projectName" ? "asc" : "desc";
        }
        render();
      });
      row.appendChild(th);
    });
    head.appendChild(row);

    body.innerHTML = "";

    if (!records.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="${tableColumns.length}" style="text-align:center; padding:40px 20px; color:var(--muted);">
          <div style="font-size:1.8rem; margin-bottom:10px; opacity:0.35;">&#9203;</div>
          <div style="font-weight:700; color:var(--navy); margin-bottom:6px;">No projects match the active filters</div>
          <div style="font-size:0.9rem;">Try adjusting the sector, location, or search terms above.</div>
        </td>
      `;
      body.appendChild(emptyRow);
      return;
    }

    sortRecords(records).forEach((record) => {
      const tr = document.createElement("tr");
      if (state.activeProjectId === record.projectId) {
        tr.classList.add("is-active");
      }
      tr.innerHTML = `
        <td>
          <div class="cell-title">
            <strong>${record.projectName}</strong>
            <span>${record.projectId}</span>
          </div>
        </td>
        <td>${record.location}</td>
        <td><span class="tag">${record.sector}</span></td>
        <td>${record.formattedStartDate}</td>
        <td>${record.formattedEndDate}</td>
        <td>${record.formattedBudget}</td>
        <td>${record.formattedBeneficiaries}</td>
        <td>${record.status}</td>
        <td>${record.fundingSource}</td>
      `;
      tr.addEventListener("click", () => {
        state.activeProjectId = state.activeProjectId === record.projectId ? null : record.projectId;
        render();
      });
      body.appendChild(tr);
    });
  }

  function renderCharts(records, derived) {
    renderVerticalBarChart(
      "sector-chart",
      derived.bySector.map((item) => ({
        label: item.label,
        value: item.count,
        color: item.label === "Education" ? palette.gold : palette.teal,
      })),
      {
        color: palette.teal,
        tickFormat: (value) => String(Math.round(value)),
        tooltip: (item) => `<strong>${item.label}</strong><br>${item.value} project(s)`,
      }
    );
    renderHorizontalBarChart(
      "location-chart",
      derived.byLocation.map((item) => ({
        label: item.label,
        value: item.count,
        color: palette.navy,
      })),
      {
        color: palette.navy,
        valueFormat: (value) => `${value} project(s)`,
        tooltip: (item) => `<strong>${item.label}</strong><br>${item.value} project(s)`,
      }
    );

    renderLocationBeneficiaries(derived.beneficiaryByLocation);

    renderVerticalBarChart(
      "budget-chart",
      derived.budgetProjects.map((record) => ({
        label: record.projectName,
        value: record.numericBudget,
        projectId: record.projectId,
        color: palette.teal,
      })),
      {
        color: palette.teal,
        tickFormat: (value) => formatCurrency(value),
        tooltip: (item) => {
          const record = derived.budgetProjects.find((project) => project.projectId === item.projectId);
          return `<strong>${record.projectName}</strong><br>Budget: ${record.formattedBudget}<br>Beneficiaries: ${record.formattedBeneficiaries}<br>${record.location}`;
        },
      }
    );

    renderHorizontalBarChart(
      "beneficiaries-chart",
      derived.beneficiaryProjects.map((record) => ({
        label: record.projectName,
        value: record.beneficiaries,
        projectId: record.projectId,
        color: palette.gold,
      })),
      {
        color: palette.gold,
        valueFormat: (value) => formatNumber(value),
        tooltip: (item) => {
          const record = derived.beneficiaryProjects.find((project) => project.projectId === item.projectId);
          return `<strong>${record.projectName}</strong><br>Beneficiaries: ${record.formattedBeneficiaries}<br>Budget: ${record.formattedBudget}<br>${record.sector}`;
        },
      }
    );

    renderScatterPlot("scatter-chart", derived.scatter);
    renderTimeline("timeline-chart", derived.timeline);
  }

  function renderHeader(records, derived) {
    const executive = buildExecutiveText(records, derived);
    setText("hero-summary", executive.hero);
    setText("generated-at", `Generated ${formatDate(data.metadata.generatedAt.slice(0, 10))}`);
    renderActiveFilterBar(records.length);
  }

  function renderActiveFilterBar(count) {
    // Remove any existing bar
    const existing = document.getElementById("active-filter-bar");
    if (existing) existing.remove();

    const hasFilters = state.sector !== "All" || state.location !== "All" || state.funding !== "All" || state.search;
    if (!hasFilters) return;

    const bar = document.createElement("div");
    bar.id = "active-filter-bar";
    bar.className = "filters-active-bar";
    bar.innerHTML = `<span>${count} project${count !== 1 ? "s" : ""} in view</span>`;

    const chips = [
      { key: "sector",  label: state.sector },
      { key: "location",label: state.location },
      { key: "funding", label: state.funding },
      { key: "search",  label: state.search ? `"${state.search}"` : null },
    ].filter((c) => c.label && c.label !== "All");

    chips.forEach(({ key, label }) => {
      const chip = document.createElement("span");
      chip.className = "filter-chip";
      chip.innerHTML = `${label} <button aria-label="Remove filter" title="Remove">&#10005;</button>`;
      chip.querySelector("button").addEventListener("click", () => {
        if (key === "sector")   { state.sector = "All"; byId("sector-filter").value = "All"; }
        if (key === "location") { state.location = "All"; byId("location-filter").value = "All"; }
        if (key === "funding")  { state.funding = "All"; byId("funding-filter").value = "All"; }
        if (key === "search")   { state.search = ""; byId("search-filter").value = ""; }
        render();
      });
      bar.appendChild(chip);
    });

    const clearBtn = document.createElement("button");
    clearBtn.className = "clear-filters-btn";
    clearBtn.textContent = "Clear all filters";
    clearBtn.addEventListener("click", () => {
      state.sector = "All"; state.location = "All";
      state.funding = "All"; state.search = "";
      byId("sector-filter").value = "All";
      byId("location-filter").value = "All";
      byId("funding-filter").value = "All";
      byId("search-filter").value = "";
      render();
    });
    bar.appendChild(clearBtn);

    // Insert bar after .filters
    const filtersEl = document.querySelector(".filters");
    if (filtersEl) filtersEl.after(bar);
  }

  function render() {
    const records = getFilteredRecords();
    const derived = buildDerived(records);
    renderHeader(records, derived);
    renderKpis(derived);
    renderInsights(records, derived);
    renderStories(records);
    renderCharts(records, derived);
    renderTable(records);
  }

  function bindControls() {
    populateSelect("sector-filter", uniqueOptions("sector"));
    populateSelect("location-filter", uniqueOptions("location"));
    populateSelect("funding-filter", uniqueOptions("fundingSource"));

    byId("sector-filter").addEventListener("change", (event) => {
      state.sector = event.target.value;
      render();
    });
    byId("location-filter").addEventListener("change", (event) => {
      state.location = event.target.value;
      render();
    });
    byId("funding-filter").addEventListener("change", (event) => {
      state.funding = event.target.value;
      render();
    });
    byId("search-filter").addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      render();
    });
    byId("print-button").addEventListener("click", () => window.print());
    byId("download-data").addEventListener("click", downloadCleanData);
  }

  bindControls();
  mountTooltip();

  // Section reveal via IntersectionObserver
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); observer.unobserve(e.target); } }),
      { threshold: 0.06 }
    );
    document.querySelectorAll(".section, .panel, .kpi-card").forEach((el) => {
      el.classList.add("fajr-reveal");
      observer.observe(el);
    });
  }

  render();
})();
