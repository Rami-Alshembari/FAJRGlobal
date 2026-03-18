window.FAJR_MASTER_CONFIG = {
  reportingScope: "Projects data through 18 March 2026, hospital updated report backup, and voucher weekly aggregate source files.",
  overviewMetrics: [
    {
      label: "Program modules",
      value: 3,
      display: "3",
      meta: "General portfolio analytics, hospital service reporting, and voucher consumption monitoring."
    },
    {
      label: "Projects tracked",
      value: 10,
      display: "10",
      meta: "Active and completed project records from the FAJR Global Gaza portfolio workbook."
    },
    {
      label: "Direct beneficiaries",
      value: 37725,
      display: "37,725",
      meta: "Reported beneficiaries across the general Gaza projects dataset."
    },
    {
      label: "Disclosed budget",
      value: 2032199,
      display: "$2.03M",
      meta: "Known budget disclosed in the projects source workbook."
    },
    {
      label: "Hospital care interactions",
      value: 5137,
      display: "5,137",
      meta: "Combined surgeries, clinic visits, and ward admissions in the embedded hospital reporting backup."
    },
    {
      label: "Voucher activity rows",
      value: 5292,
      display: "5,292",
      meta: "Recorded voucher transaction rows aggregated into the consumption dashboard."
    }
  ],
  insights: [
    {
      title: "Relief remains the largest portfolio pillar.",
      body: "The general Gaza projects portfolio is still concentrated in relief delivery, while education investments broaden the profile into medium-term recovery support."
    },
    {
      title: "Hospital reporting shows high clinic pressure alongside surgical activity.",
      body: "Clinic visits substantially exceed surgical volume, indicating that outpatient demand is a major component of the health support footprint."
    },
    {
      title: "Voucher demand is broad but concentrated at the top.",
      body: "The voucher dashboard tracks thousands of aggregated item-unit combinations, yet the top categories still absorb a meaningful share of total consumption."
    },
    {
      title: "The three dashboards serve different decisions.",
      body: "Leadership can use the overview for portfolio balance, hospital pages for medical service utilization, and voucher pages for demand and market-support analysis."
    }
  ],
  notes: [
    {
      title: "Mixed units across modules",
      body: "Cross-program metrics are shown with explicit unit context. Beneficiaries, service interactions, and item quantities should not be interpreted as interchangeable outputs."
    },
    {
      title: "Legacy detail retained",
      body: "The original dashboards are preserved and embedded in each module page so no existing analytical detail is lost during unification."
    },
    {
      title: "Static-file friendly architecture",
      body: "The new master shell is built in HTML, CSS, and JavaScript and can be opened locally without a framework build step."
    }
  ],
  charts: {
    volume: {
      labels: [
        "General projects beneficiaries",
        "Hospital clinic visits",
        "Hospital surgeries",
        "Hospital admissions",
        "Voucher rows"
      ],
      values: [37725, 3934, 1097, 106, 5292]
    },
    structure: {
      labels: [
        "Portfolio projects",
        "Hospital departments",
        "Voucher unique items",
        "Voucher unique units",
        "Project sectors"
      ],
      values: [10, 13, 2169, 398, 2]
    }
  },
  programs: {
    general: {
      key: "general",
      title: "General Gaza Projects",
      shortTitle: "General Projects",
      category: ["relief", "education"],
      icon: "G",
      page: "pages/general-projects.html",
      legacyPath: "../legacy/general-projects/index.html",
      legacyLabel: "Open original portfolio dashboard",
      summary: "Executive portfolio tracking for projects, budgets, beneficiaries, locations, sectors, and implementation timelines.",
      narrative: [
        "This stream is the portfolio backbone of the unified platform. It provides the clearest view of project spread, sector balance, funding visibility, and beneficiary reach across FAJR Global’s Gaza work.",
        "The embedded source dashboard already contains rich filters and visual breakdowns, so the new module page adds executive framing and consistent navigation while preserving the existing analytical depth."
      ],
      heroStats: [
        { label: "Projects", value: "10" },
        { label: "Beneficiaries", value: "37,725" },
        { label: "Known budget", value: "$2.03M" }
      ],
      metrics: [
        { label: "Tracked projects", value: 10, display: "10", meta: "Project records after cleaning and blank-row removal." },
        { label: "Beneficiaries reached", value: 37725, display: "37,725", meta: "Reported reach across the projects dataset." },
        { label: "Known budget", value: 2032199, display: "$2,032,199", meta: "Sum of numeric budgets disclosed in the source file." },
        { label: "Sectors", value: 2, display: "2", meta: "Relief and education currently represented." }
      ],
      chart: {
        type: "bar",
        title: "Program composition",
        labels: ["Relief beneficiaries", "Education beneficiaries", "Relief projects", "Education projects"],
        values: [30425, 7300, 5, 5]
      },
      impactCards: [
        {
          title: "Geographic coverage",
          body: "The portfolio spans northern, southern, and cross-Gaza implementation footprints, supporting a broad operational map."
        },
        {
          title: "Funding visibility",
          body: "This module is currently the only source with disclosed budget totals, making it the financial anchor of the portal."
        },
        {
          title: "Strategic use",
          body: "Use this page for donor-facing portfolio review, sector balance discussions, and implementation timeline checks."
        }
      ],
      miniStats: [
        { title: "Top sector", body: "Relief remains the dominant sector by both project count and beneficiary reach." },
        { title: "Coverage footprint", body: "Three normalized location groupings are represented across the current records." },
        { title: "Status profile", body: "All projects in the current source are marked completed, supporting retrospective performance review." }
      ]
    },
    hospital: {
      key: "hospital",
      title: "Public Aid Hospital",
      shortTitle: "Public Aid Hospital",
      category: ["health"],
      icon: "H",
      page: "pages/public-aid-hospital.html",
      legacyPath: "../legacy/public-aid-hospital/dashboard.html",
      legacyLabel: "Open original hospital dashboard",
      summary: "Hospital service reporting covering surgeries, clinic visits, ward admissions, departmental load, and weekly care trends.",
      narrative: [
        "This module frames the hospital dashboard as the health-service pillar within FAJR Global Gaza’s broader response platform. It emphasizes service intensity, outpatient pressure, and departmental concentration.",
        "The original hospital dashboard remains embedded below, including its chart set and reporting logic, while the new shell standardizes the surrounding story and navigation."
      ],
      heroStats: [
        { label: "Surgeries", value: "1,097" },
        { label: "Clinic visits", value: "3,934" },
        { label: "Ward admissions", value: "106" }
      ],
      metrics: [
        { label: "Total care interactions", value: 5137, display: "5,137", meta: "Combined surgeries, clinic visits, and ward admissions." },
        { label: "Departments tracked", value: 13, display: "13", meta: "Clinical departments represented in the embedded backup data." },
        { label: "Top surgery department", value: 182, display: "General Surgery", meta: "Highest surgery total in the backup dataset." },
        { label: "Top clinic department", value: 764, display: "ENT", meta: "Largest clinic visit load in the backup dataset." }
      ],
      chart: {
        type: "doughnut",
        title: "Service mix",
        labels: ["Surgeries", "Clinic Visits", "Ward Admissions"],
        values: [1097, 3934, 106]
      },
      impactCards: [
        {
          title: "Clinical concentration",
          body: "ENT carries the heaviest clinic volume, while General Surgery leads surgical output and Pediatric Surgery leads admissions."
        },
        {
          title: "Health system signal",
          body: "Outpatient activity dominates the reporting mix, suggesting substantial front-door demand alongside procedural care."
        },
        {
          title: "Strategic use",
          body: "Use this page for health service utilization briefings, donor support conversations, and operational load review."
        }
      ],
      miniStats: [
        { title: "Top surgery load", body: "General Surgery records 182 surgeries in the backup source." },
        { title: "Top clinic load", body: "ENT records 764 clinic visits, the highest outpatient burden in the dataset." },
        { title: "Top admission load", body: "Pediatric Surgery records 34 ward admissions, the highest admission count in the dataset." }
      ]
    },
    vouchers: {
      key: "vouchers",
      title: "Voucher Project / Sponsorships",
      shortTitle: "Vouchers",
      category: ["market", "relief"],
      icon: "V",
      page: "pages/vouchers.html",
      legacyPath: "../legacy/vouchers/fajr-dashboard.html?embed=1",
      legacyLabel: "Open original voucher dashboard",
      summary: "Voucher consumption analytics covering item demand, unit mix, concentration, and detailed ranked consumption tables.",
      narrative: [
        "This stream translates voucher operations into a market-support view, showing what beneficiaries actually consume and where demand concentrates across item types and units.",
        "The original Arabic dashboard is embedded below so the full visual and linguistic context remains available while the new module adds an executive explanation in the unified portal style."
      ],
      heroStats: [
        { label: "Transaction rows", value: "5,292" },
        { label: "Unique items", value: "2,169" },
        { label: "Total quantity", value: "95,775" }
      ],
      metrics: [
        { label: "Transaction rows", value: 5292, display: "5,292", meta: "Underlying aggregated voucher transaction lines." },
        { label: "Unique items", value: 2169, display: "2,169", meta: "Distinct items represented after aggregation." },
        { label: "Unique units", value: 398, display: "398", meta: "Different units of measure present in the source file." },
        { label: "Total quantity", value: 95775.1879, display: "95,775.19", meta: "Total reported quantity across the aggregated voucher payload." }
      ],
      chart: {
        type: "bar",
        title: "Top item quantities",
        labels: [
          "بطاطا - خضار",
          "جبنة فيتا عبور لاند 250 جرام",
          "جبنة فيتا رودس 250 جرام",
          "اندومي سوبر مي 56 جرام",
          "بندورة - خضار"
        ],
        values: [1331.625, 1330, 1051, 1031, 1023.895]
      },
      impactCards: [
        {
          title: "Demand visibility",
          body: "The voucher module gives a clear commodity-level picture of what is moving through the program and where concentration emerges."
        },
        {
          title: "Market support lens",
          body: "This dashboard complements direct aid metrics by showing beneficiary purchasing behavior through a market-based assistance mechanism."
        },
        {
          title: "Strategic use",
          body: "Use this page for commodity planning, vendor engagement, and communication around voucher-supported household choice."
        }
      ],
      miniStats: [
        { title: "Breadth of assortment", body: "More than two thousand unique items are represented in the current aggregated voucher source." },
        { title: "Measurement complexity", body: "Nearly four hundred units are present, so unit context is critical when interpreting demand." },
        { title: "Top item signal", body: "Potatoes and cheese variants appear among the highest-volume consumption lines in the current aggregate." }
      ]
    }
  }
};
