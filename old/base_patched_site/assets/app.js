
const menuBtn = document.getElementById('menuBtn');
const navWrap = document.getElementById('navWrap');
const year = document.getElementById('year');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
if (year) year.textContent = new Date().getFullYear();
menuBtn?.addEventListener('click', () => navWrap.classList.toggle('open'));
document.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navWrap?.classList.remove('open')));
const mq = window.matchMedia('(prefers-color-scheme: dark)');
function systemTheme(){ return mq.matches ? 'dark' : 'light'; }
function applyTheme(mode){
  if(mode === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  if (themeIcon) themeIcon.textContent = mode === 'light' ? '☀️' : '🌙';
}
function toggleTheme(){
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('vanga-theme', next);
  applyTheme(next);
}
applyTheme(localStorage.getItem('vanga-theme') || systemTheme());
themeBtn?.addEventListener('click', toggleTheme);
mq.addEventListener('change', e => { if(!localStorage.getItem('vanga-theme')) applyTheme(e.matches ? 'dark' : 'light'); });
