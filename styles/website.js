(function () {
  function injectHero() {
    var isReadme = /\/(index\.html)?$/.test(location.pathname) ||
      location.pathname.endsWith("/") ||
      location.pathname.split("/").pop() === "index.html" ||
      (document.querySelector(".markdown-section h1") &&
        document.querySelector(".markdown-section h1").textContent.indexOf("OddsZero") === 0 &&
        !location.search && document.querySelector(".navigation") === null);
    var section = document.querySelector(".markdown-section");
    if (!section || document.getElementById("oz-hero")) return;
    var h1 = section.querySelector("h1");
    if (!h1) return;
    var hero = document.createElement("div");
    hero.id = "oz-hero";
    hero.className = "oz-hero";
    hero.innerHTML =
      '<div class="oz-logo"><img src="assets/oddszero.png" alt="OddsZero" style="height:40px;width:auto;border:none;vertical-align:middle;"> <span>OddsZero</span></div>' +
      '<div class="oz-tag">Fully on-chain prediction markets on Sui</div>';
    h1.parentNode.insertBefore(hero, h1);
  }

  function buildCards() {
    var section = document.querySelector(".markdown-section");
    if (!section || document.getElementById("oz-cards")) return;
    var table = section.querySelector("table");
    if (!table) return;
    var cards = document.createElement("div");
    cards.id = "oz-cards";
    cards.className = "oz-cards";
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      var link = tr.querySelector("a");
      var name = link ? link.textContent : tr.children[0].textContent;
      var href = link ? link.getAttribute("href") : "#";
      var who = tr.children[1] ? tr.children[1].textContent : "";
      var card = document.createElement("a");
      card.className = "oz-card";
      card.href = href;
      card.innerHTML = "<h3>" + name + "</h3><p>" + who + "</p>";
      cards.appendChild(card);
    });
    table.parentNode.insertBefore(cards, table.nextSibling);
    table.style.display = "none";
  }

  function addThemeToggle() {
    if (document.getElementById("oz-theme")) return;
    var btn = document.createElement("button");
    btn.id = "oz-theme";
    btn.textContent = "☀";
    btn.style.cssText =
      "position:fixed;right:18px;bottom:18px;z-index:50;width:42px;height:42px;" +
      "border-radius:50%;border:1px solid var(--oz-border);background:var(--oz-surface);" +
      "color:var(--oz-text);cursor:pointer;font-size:18px;box-shadow:var(--oz-shadow);";
    btn.onclick = function () {
      var light = document.body.classList.toggle("oz-light");
      btn.textContent = light ? "🌙" : "☀";
      try { localStorage.setItem("oz-theme", light ? "light" : "dark"); } catch (e) {}
    };
    document.body.appendChild(btn);
    try {
      if (localStorage.getItem("oz-theme") === "light") {
        document.body.classList.add("oz-light");
        btn.textContent = "🌙";
      }
    } catch (e) {}
  }

  function applyLight() {
    var s = document.createElement("style");
    s.textContent =
      "body.oz-light{--oz-bg:#ffffff;--oz-bg-soft:#f7f9fc;--oz-surface:#ffffff;" +
      "--oz-border:#e3e8f0;--oz-text:#1a2233;--oz-text-dim:#5a6478;--oz-code-bg:#f3f5f9;}";
    document.head.appendChild(s);
  }

  function injectSidebarLogo() {
    var summary = document.querySelector(".book-summary .summary");
    if (!summary || document.getElementById("oz-side-logo")) return;
    var wrap = document.createElement("li");
    wrap.id = "oz-side-logo";
    wrap.innerHTML =
      '<div style="padding:18px 18px 6px;display:flex;align-items:center;gap:10px;">' +
      '<img src="assets/oddszero.png" alt="OddsZero" style="height:30px;width:auto;border:none;">' +
      '<span style="font-weight:800;color:var(--oz-text);letter-spacing:-0.3px;">OddsZero</span></div>';
    summary.insertBefore(wrap, summary.firstChild);
  }

  function init() {
    applyLight();
    injectSidebarLogo();
    injectHero();
    buildCards();
    addThemeToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
