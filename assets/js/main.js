(function () {
  const rootBody = document.body;
  const THEME_KEY = "siteTheme";

  function applyTheme(themeName) {
    rootBody.setAttribute("data-theme", themeName);
    const selector = document.querySelector("#themeSelector");
    if (selector) selector.value = themeName;
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "classic";
    applyTheme(saved);

    const selector = document.querySelector("#themeSelector");
    if (selector) {
      selector.value = saved;
      selector.addEventListener("change", function (event) {
        const value = event.target.value;
        localStorage.setItem(THEME_KEY, value);
        applyTheme(value);
      });
    }

    document.querySelectorAll("[data-set-theme]").forEach(function (button) {
      button.addEventListener("click", function () {
        const theme = button.getAttribute("data-set-theme");
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
      });
    });
  }

  function initUnifiedPublicNav() {
    const nav = document.querySelector("#mainNav");
    if (!nav) return;

    const path = window.location.pathname.toLowerCase();
    if (path.includes("/admin/") || path.includes("/help/")) return;

    const fileName = (path.split("/").pop() || "index.html").split("?")[0];
    let activeKey = "index";

    if (fileName === "catalog.html" || fileName === "search.html" || fileName === "product.html") activeKey = "catalog";
    else if (fileName === "request-service.html") activeKey = "service";
    else if (fileName === "quote-calculator.html") activeKey = "quote";
    else if (fileName === "dashboard.html" || fileName === "profile.html" || fileName === "history.html") activeKey = "dashboard";
    else if (fileName === "about.html" || fileName === "privacy.html") activeKey = "about";
    else if (fileName === "contact.html") activeKey = "contact";
    else if (fileName === "faq.html") activeKey = "faq";
    else if (fileName === "login.html" || fileName === "register.html") activeKey = "login";

    const items = [
      { key: "index", href: "index.html", label: "Home" },
      { key: "catalog", href: "catalog.html", label: "Services" },
      { key: "service", href: "request-service.html", label: "Service" },
      { key: "quote", href: "quote-calculator.html", label: "Estimate" },
      { key: "dashboard", href: "dashboard.html", label: "Dashboard" },
      { key: "about", href: "about.html", label: "About" },
      { key: "contact", href: "contact.html", label: "Contact" },
      { key: "faq", href: "faq.html", label: "FAQ" },
      { key: "login", href: "login.html", label: "Login" },
      { key: "help", href: "help/index.html", label: "Help" }
    ];

    nav.innerHTML = items
      .map(function (item) {
        const isActive = item.key === activeKey ? ' class="active"' : "";
        return '<a' + isActive + ' href="' + item.href + '">' + item.label + "</a>";
      })
      .join("");
  }

  function initMobileMenu() {
    const toggle = document.querySelector("#mobileToggle");
    const nav = document.querySelector("#mainNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function showAnimations() {
    const nodes = document.querySelectorAll(".fade-up");
    nodes.forEach(function (node, i) {
      setTimeout(function () {
        node.classList.add("show");
      }, 80 * i);
    });
  }

  function productCardHtml(item) {
    return (
      '<article class="card fade-up">' +
      '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
      "<h3>" + item.name + "</h3>" +
      '<p class="muted">Category: ' + item.category + "</p>" +
      "<p>Session Fee: $" + item.price + "</p>" +
      '<p class="muted">Options: ' + item.options.join(" / ") + "</p>" +
      '<p class="muted">Rating: ' + item.rating + " / 5</p>" +
      '<a class="btn secondary" href="product.html?id=' + item.id + '">View Service</a>' +
      "</article>"
    );
  }

  function renderCatalog(list) {
    const holder = document.querySelector("#catalogList");
    if (!holder || typeof catalogItems === "undefined") return;
    holder.innerHTML = list.map(productCardHtml).join("");
    showAnimations();
  }

  function initCatalogSearch() {
    const input = document.querySelector("#searchInput");
    const category = document.querySelector("#categoryFilter");
    if (!input || !category || typeof catalogItems === "undefined") return;

    function refresh() {
      const q = input.value.trim().toLowerCase();
      const c = category.value;
      const filtered = catalogItems.filter(function (item) {
        const nameMatch = item.name.toLowerCase().includes(q);
        const catMatch = c === "all" || item.category === c;
        return nameMatch && catMatch;
      });
      renderCatalog(filtered);
    }

    input.addEventListener("input", refresh);
    category.addEventListener("change", refresh);
    refresh();
  }

  function initProductDetails() {
    const target = document.querySelector("#productDetails");
    if (!target || typeof catalogItems === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id") || 1);
    const item = catalogItems.find(function (p) {
      return p.id === id;
    }) || catalogItems[0];

    target.innerHTML =
      '<img src="' + item.image + '" alt="' + item.name + '">' +
      "<h1>" + item.name + "</h1>" +
      '<p class="muted">Subject: ' + item.category + "</p>" +
      "<p><strong>Session Fee:</strong> $" + item.price + "</p>" +
      "<p><strong>Available options:</strong> " + item.options.join(" and ") + "</p>";
  }

  function initQuoteForm() {
    const form = document.querySelector("#quoteForm");
    const result = document.querySelector("#quoteResult");
    if (!form || !result) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const packageType = Number(form.packageType.value || 0);
      const supportType = Number(form.supportType.value || 0);
      const sessions = Number(form.sessions.value || 1);
      const total = (packageType + supportType) * sessions;
      result.textContent = "Estimated quote: $" + total + " CAD";
    });
  }

  function initServiceRequestForm() {
    const form = document.querySelector("#serviceRequestForm");
    const result = document.querySelector("#requestResult");
    if (!form || !result) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.fullName.value.trim();
      result.textContent = "Request saved for " + name + ".";
    });
  }

  function drawMiniChart() {
    const canvas = document.querySelector("#usageChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = [30, 45, 51, 62, 58, 73];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2f7fb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1466b8";
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach(function (v, i) {
      const x = 40 + i * 70;
      const y = 170 - v * 1.8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "#1a2e3f";
    ctx.font = "12px Verdana";
    labels.forEach(function (label, i) {
      ctx.fillText(label, 34 + i * 70, 190);
    });
  }

  function initMonitoringStatus() {
    const rows = document.querySelectorAll("[data-service-status]");
    rows.forEach(function (row) {
      const state = row.getAttribute("data-service-status");
      const badge = row.querySelector(".badge");
      if (!badge) return;
      badge.textContent = state === "online" ? "Online" : "Offline";
      badge.classList.toggle("offline", state !== "online");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initUnifiedPublicNav();
    initTheme();
    initMobileMenu();
    showAnimations();
    initCatalogSearch();
    initProductDetails();
    initQuoteForm();
    initServiceRequestForm();
    drawMiniChart();
    initMonitoringStatus();
  });
})();

