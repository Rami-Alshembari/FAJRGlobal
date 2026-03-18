/**
 * FAJR Global Gaza — Shared Dashboard Utilities
 * v2.0 · March 2026
 *
 * Usage: <script src="../shared-utils.js"></script>
 * Exposes window.FAJR object with format, chart, animation, and UI helpers.
 */
(function (global) {
  "use strict";

  /* ── Number & Date Formatting ────────────────────────────────── */
  const enNum  = new Intl.NumberFormat("en-GB");
  const enPct  = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
  const enCur  = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const enDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function fmt(value, fallback) {
    return value == null ? (fallback ?? "—") : value;
  }

  const format = {
    number:   (v, fb) => v == null ? (fb ?? "—") : enNum.format(Number(v)),
    percent:  (v, fb) => v == null ? (fb ?? "—") : enPct.format(Number(v)) + "%",
    currency: (v, fb) => v == null ? (fb ?? "—") : enCur.format(Number(v)),
    date:     (v, fb) => {
      if (!v) return fb ?? "—";
      try { return enDate.format(new Date(`${v}T00:00:00`)); }
      catch { return String(v); }
    },
    compact: (v) => {
      if (v == null) return "—";
      const n = Number(v);
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
      if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
      return enNum.format(n);
    },
  };

  /* ── Count-Up Animation ─────────────────────────────────────── */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Animate a numeric element from 0 to target.
   * @param {HTMLElement} el  - Element whose textContent to animate.
   * @param {number}      target - Final numeric value.
   * @param {Function}    formatter - Called with current value, returns string.
   * @param {number}      [duration=900] - ms
   */
  function countUp(el, target, formatter, duration) {
    const dur = duration ?? 900;
    if (prefersReduced || !Number.isFinite(target)) {
      el.textContent = formatter(target);
      return;
    }
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatter(target);
    }
    requestAnimationFrame(step);
  }

  /** Run count-up on all [data-countup] elements in the DOM. */
  function runAllCountUps() {
    document.querySelectorAll("[data-countup]").forEach((node) => {
      const raw     = node.getAttribute("data-countup");
      const display = node.getAttribute("data-display") ?? raw;
      const target  = Number(raw);
      if (!Number.isFinite(target) || display.includes(" to ")) {
        node.textContent = display;
        return;
      }
      const isCurrency = display.startsWith("$");
      const isPct      = display.endsWith("%");
      countUp(node, target,
        isCurrency ? (v) => format.currency(v)
          : isPct  ? (v) => format.percent(v)
          :          (v) => format.number(Math.round(v)),
      );
    });
  }

  /* ── Section Reveal (IntersectionObserver) ────────────────────── */
  let _revealObserver = null;

  function initReveal(selector) {
    const sel = selector ?? ".fajr-reveal";
    if (!window.IntersectionObserver) {
      document.querySelectorAll(sel).forEach((el) => el.classList.add("is-visible"));
      return;
    }
    _revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            _revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(sel).forEach((el) => _revealObserver.observe(el));
  }

  /* ── Chart.js Theme Helpers ──────────────────────────────────── */
  const PALETTE = {
    teal:      "#157a75",
    tealLight: "#1fa89f",
    tealPale:  "#bfe2de",
    navy:      "#173347",
    gold:      "#b88746",
    coral:     "#b66a57",
    slate:     "#547a9e",
    sky:       "#8ecae6",
    dark:      "#264653",
    sequence: [
      "#157a75", "#173347", "#b88746", "#2a9d8f",
      "#b66a57", "#547a9e", "#8ecae6", "#264653",
    ],
  };

  /** Apply shared Chart.js global defaults. Call once on page load. */
  function applyChartDefaults() {
    if (!window.Chart) return;
    const Chart = window.Chart;
    Chart.defaults.font.family = '"Manrope", "Segoe UI", system-ui, sans-serif';
    Chart.defaults.font.size   = 12;
    Chart.defaults.color       = "#5c6f7b";
    Chart.defaults.animation   = { duration: prefersReduced ? 0 : 1100, easing: "easeOutCubic" };
    Chart.defaults.plugins.tooltip.backgroundColor  = "rgba(19, 39, 54, 0.95)";
    Chart.defaults.plugins.tooltip.titleColor       = "#fff";
    Chart.defaults.plugins.tooltip.bodyColor        = "rgba(255,255,255,0.82)";
    Chart.defaults.plugins.tooltip.padding          = { x: 13, y: 10 };
    Chart.defaults.plugins.tooltip.cornerRadius     = 12;
    Chart.defaults.plugins.tooltip.displayColors    = false;
    Chart.defaults.plugins.legend.labels.boxWidth   = 10;
    Chart.defaults.plugins.legend.labels.boxHeight  = 10;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
  }

  /**
   * Shared base options for bar charts.
   * @param {'x'|'y'} axis - Primary axis for values.
   */
  function barOptions(axis) {
    const isHorizontal = axis === "y";
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isHorizontal ? "y" : "x",
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid:  { color: "rgba(20, 41, 57, 0.07)", drawBorder: false },
          ticks: { color: "#5c6f7b" },
          border: { display: false },
        },
        y: {
          grid:  { color: "rgba(20, 41, 57, 0.07)", drawBorder: false },
          ticks: { color: "#5c6f7b" },
          border: { display: false },
        },
      },
    };
  }

  /** Base options for doughnut / pie charts. */
  function donutOptions(legendPosition) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          display: true,
          position: legendPosition ?? "bottom",
          labels: {
            padding: 16,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        },
      },
    };
  }

  /* ── Tooltip Helper ─────────────────────────────────────────── */
  function initTooltip(tooltipEl) {
    const el = tooltipEl ?? document.getElementById("tooltip") ?? document.querySelector(".fajr-tooltip");
    if (!el) return null;

    document.addEventListener("mousemove", (e) => {
      if (!el.classList.contains("is-visible")) return;
      el.style.left = `${e.clientX + 18}px`;
      el.style.top  = `${e.clientY + 18}px`;
    });

    return {
      show: (html) => { el.innerHTML = html; el.classList.add("is-visible"); },
      hide: ()     => el.classList.remove("is-visible"),
    };
  }

  /* ── Loader Helpers ─────────────────────────────────────────── */
  function showLoader(id) {
    const el = id ? document.getElementById(id) : document.querySelector(".fajr-loader, .loader");
    if (el) el.classList.remove("is-hidden", "hidden");
  }

  function hideLoader(id) {
    const el = id ? document.getElementById(id) : document.querySelector(".fajr-loader, .loader");
    if (el) el.classList.add("is-hidden", "hidden");
  }

  /* ── Expose ─────────────────────────────────────────────────── */
  global.FAJR = {
    format,
    countUp,
    runAllCountUps,
    initReveal,
    PALETTE,
    applyChartDefaults,
    barOptions,
    donutOptions,
    initTooltip,
    showLoader,
    hideLoader,
    prefersReduced,
  };

}(window));
