// hoved/assets/layout.js

// 🚀 STAGE 1: IMMEDIATE INJECTIONS (Prevents flashing/shifting)
const currentPath = window.location.pathname;
let pathPrefix = "";
if (currentPath.includes("/pages/")) {
  const pathParts = currentPath.split("/pages/")[1].split("/");
  pathPrefix = "../".repeat(pathParts.length);
}

// Read theme preferences instantly before rendering anything on screen
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const standardSystemTheme = colorSchemeQuery.matches ? 'dark' : 'light';
const activeSelectedTheme = localStorage.getItem('vanga-theme') || standardSystemTheme;

// Set up layout flash shield styles and include your main styles.css
let styleRules = `
  <link rel="stylesheet" href="${pathPrefix}assets/styles.css" />
  <style id="layout-shield">body { visibility: hidden !important; opacity: 0 !important; }</style>
`;

document.head.insertAdjacentHTML('beforeend', styleRules);

// Apply your light class condition immediately if required to prevent theme flash
if (activeSelectedTheme === 'light') {
  document.documentElement.classList.add('light-init');
}

// 🏗️ STAGE 2: BUILD INTERACTIVE INTERFACES ONCE READY
document.addEventListener("DOMContentLoaded", () => {
  // Sync the quick-applied light settings directly onto the body element tag
  if (document.documentElement.classList.contains('light-init')) {
    document.body.classList.add('light');
    document.documentElement.classList.remove('light-init');
  }

  const originalHtmlContent = document.body.innerHTML;

  document.body.innerHTML = `
    <div class="orb one"></div>
    <div class="orb two"></div>
    <div class="orb three"></div>

    <nav class="nav">
      <div class="container nav-inner">
        <a class="brand" href="${pathPrefix}index.html">
          <div class="logo">⚛</div>
          <span>Vanga Vitanastika ┃ Atheism, Life & Bangladesh</span>
        </a>
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="lang-dropdown">
            <button class="lang-trigger" aria-label="Switch Language">🌐</button>
            <div class="lang-menu">
              <a href="?lang=en" class="flag" data-code="EN" title="English"><img src="${pathPrefix}assets/flags/gb.svg" alt="EN" /></a>
              <a href="?lang=bd" class="flag" data-code="BD" title="Bengali"><img src="${pathPrefix}assets/flags/bd.svg" alt="BD" /></a>
              <a href="?lang=bl" class="flag" data-code="BL" title="Bengali-Latin"><img src="${pathPrefix}assets/flags/bdl.svg" alt="BL" /></a>
              <a href="?lang=ch" class="flag" data-code="CH" title="Chinese"><img src="${pathPrefix}assets/flags/cn.svg" alt="CH" /></a>
              <a href="?lang=de" class="flag" data-code="DE" title="German"><img src="${pathPrefix}assets/flags/de.svg" alt="DE" /></a>
              <a href="?lang=in" class="flag" data-code="IN" title="Hindi"><img src="${pathPrefix}assets/flags/in.svg" alt="IN" /></a>
              <a href="?lang=jp" class="flag" data-code="JP" title="Japanese"><img src="${pathPrefix}assets/flags/jp.svg" alt="JP" /></a>
              <a href="?lang=pk" class="flag" data-code="PK" title="Urdu"><img src="${pathPrefix}assets/flags/pk.svg" alt="PK" /></a>
              <a href="?lang=sa" class="flag" data-code="SA" title="Arabic"><img src="${pathPrefix}assets/flags/sa.svg" alt="SA" /></a>
            </div>
          </div>

          <button class="menu-btn" id="menuBtn" aria-label="Toggle navigation">☰</button>
        </div>

        <div class="nav-wrap" id="navWrap">
          <div class="nav-top">
            <a href="${pathPrefix}index.html">Home</a>
            <a href="${pathPrefix}pages/b_ftid/ftid.html">History</a>
            <a href="${pathPrefix}pages/c_ism/fil.html">Philosophy</a>
            <a href="${pathPrefix}pages/d_eve/nytt.html">Events</a>
            <a href="${pathPrefix}pages/e_post/pen.html">Posts</a>
            <a href="${pathPrefix}pages/f_info/si.html">Info</a>
          </div>
        </div>
      </div>
    </nav>

    <main class="container" id="content">
      ${originalHtmlContent}
    </main>

    <footer>
      <div class="container footer-inner">
        <div style="display:flex;align-items:center;gap:.6rem;">
          <button id="themeBtn" title="Toggle theme" class="footer-toggle">
            <span id="themeIcon">🌙</span>
          </button>
          <span>© 2016 - <span id="year"></span> VV. All rights reserved. <a> ┃ </a> Atheism, Life & Bangladesh</span>
        </div>
        <span>
          <a href="${pathPrefix}pages/f_info/talk.html" style="color:inherit;text-decoration:none">Contact</a>
          <a> ┃ </a>
          <a href="${pathPrefix}pages/f_info/fine.html" style="color:inherit;text-decoration:none">Terms of Service</a>
        </span>
      </div>
    </footer>
  `;

  // Apply accurate text identifiers to indicator icons
  const themeStateIcon = document.getElementById("themeIcon");
  if (themeStateIcon) {
    themeStateIcon.textContent = document.body.classList.contains('light') ? "☀️" : "🌙";
  }

  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // Dynamic Toggle Button Listeners
  const themeToggleBtn = document.getElementById("themeBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const changedTheme = document.body.classList.contains('light') ? 'dark' : 'light';
      localStorage.setItem('vanga-theme', changedTheme);
      
      if (changedTheme === 'light') {
        document.body.classList.add('light');
        if (themeStateIcon) themeStateIcon.textContent = "☀️";
      } else {
        document.body.classList.remove('light');
        if (themeStateIcon) themeStateIcon.textContent = "🌙";
      }
    });
  }

  const navigationMenuBtn = document.getElementById("menuBtn");
  const navigationWrapper = document.getElementById("navWrap");
  if (navigationMenuBtn && navigationWrapper) {
    navigationMenuBtn.addEventListener("click", () => {
      navigationWrapper.classList.toggle("open");
      navigationMenuBtn.textContent = navigationWrapper.classList.contains("open") ? "✕" : "☰";
    });
  }

  // 🔓 Lift structural visibility blocks smoothly
  const layoutStyleShield = document.getElementById("layout-shield");
  if (layoutStyleShield) layoutStyleShield.remove();
});