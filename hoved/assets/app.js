document.addEventListener("DOMContentLoaded", () => {
  // 1. 📆 AUTO-UPDATE COPYRIGHT TIMESTAMP
  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // 2. 🎨 INITIALIZE SAVED PREFERENCE STATE
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const standardSystemTheme = colorSchemeQuery.matches ? 'dark' : 'light';
  const activeSelectedTheme = localStorage.getItem('vanga-theme') || standardSystemTheme;

  // Sync icon layout indicator properties on startup
  const themeStateIcon = document.getElementById("themeIcon");
  if (activeSelectedTheme === 'light') {
    document.body.classList.add('light');
    if (themeStateIcon) themeStateIcon.textContent = "☀️";
  } else {
    document.body.classList.remove('light');
    if (themeStateIcon) themeStateIcon.textContent = "🌙";
  }

  // 3. 🛠️ ACTIVE CLICK INTERACTION HANDLING
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

  // Mobile navigation trigger engine
  const navigationMenuBtn = document.getElementById("menuBtn");
  const navigationWrapper = document.getElementById("navWrap");
  if (navigationMenuBtn && navigationWrapper) {
    navigationMenuBtn.addEventListener("click", () => {
      navigationWrapper.classList.toggle("open");
      navigationMenuBtn.textContent = navigationWrapper.classList.contains("open") ? "✕" : "☰";
    });
  }
});