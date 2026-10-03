/* AIエンジニア募集ページだけの動き（2026年10月3日）
   - ボタンに矢印を足す（ホバーで右へ抜けて左から戻る）
   - 右下（スマホは下）に「正社員／インターン」の入口カード。ファーストビューを過ぎたら出し、問い合わせ欄では引っ込める
   - スクロールで一度だけふわっと表示 */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 矢印
  document.querySelectorAll('.hero .button, .closing .button, .contact-link:not(.contact-tel), .cf-submit, .nav-cta')
    .forEach(function (el) {
      if (el.querySelector('.ai-arrow')) return;
      var s = document.createElement('span');
      s.className = 'ai-arrow';
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });

  // 入口カード
  // nav 要素にすると、ヘッダー用の nav>a{display:none}（スマホ）に巻き込まれて消える
  var nav = document.createElement('div');
  nav.className = 'ai-entry';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', '応募・お問い合わせの入り口');
  nav.innerHTML =
    '<a href="#contact-fulltime"><span class="ai-entry-thumb"><img src="assets/entry-fulltime.svg" alt="" width="120" height="64" loading="lazy"></span>' +
    '<span class="ai-entry-label"><b>FULL-TIME</b><small><span class="ai-pc">正社員で問い合わせる</span><span class="ai-sp">正社員で相談</span></small></span><span class="ai-arrow" aria-hidden="true"></span></a>' +
    '<a href="#contact-intern"><span class="ai-entry-thumb"><img src="assets/entry-intern.svg" alt="" width="120" height="64" loading="lazy"></span>' +
    '<span class="ai-entry-label"><b>INTERNSHIP</b><small><span class="ai-pc">インターンで問い合わせる</span><span class="ai-sp">インターンで相談</span></small></span><span class="ai-arrow" aria-hidden="true"></span></a>';
  document.body.appendChild(nav);

  var hero = document.querySelector('.hero');
  var contact = document.querySelector('#contact');
  var heroIn = true, contactIn = false;
  function update() { nav.classList.toggle('is-visible', !heroIn && !contactIn); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { heroIn = es[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(hero);
    if (contact) new IntersectionObserver(function (es) { contactIn = es[0].isIntersecting; update(); }, { threshold: 0 }).observe(contact);
  } else {
    heroIn = false; update();
  }

  // スクロールで表示
  if (reduce || !('IntersectionObserver' in window)) { html.classList.remove('ai-anim'); return; }
  var groups = [
    '.section-top', '.intro-grid>h2', '.prose>p', '.mission-band h2', '.band-lead', '.connection>div', '.band-note',
    '.section-heading>*', '.work figure', '.work-panel', '.systems>*', '.values h2', '.values-intro', '.value-grid>article',
    '.people-grid>div>*', '.qualities>li', '.recruit-grid>div', '.contact-card', '.faq>details',
    '.closing>div>*', '#contact .cf-inner>*:not(.cf-panel)'
  ];
  var targets = [];
  groups.forEach(function (sel) {
    var last = null, i = 0;
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.closest('.hero') || el.hasAttribute('data-ai-r')) return;
      i = el.parentElement === last ? i + 1 : 0;
      last = el.parentElement;
      el.setAttribute('data-ai-r', '');
      el.style.setProperty('--ai-d', Math.min(i * 0.08, 0.4) + 's');
      targets.push(el);
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
  window.__aiReady = true;
})();
