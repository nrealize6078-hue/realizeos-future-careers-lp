/* 採用問い合わせフォーム（職種別4フォーム）2026年10月3日
   送信先は section[data-endpoint] の Google Apps Script。中継先で RC@n-realize.co.jp へ転送される。
   本体は realizeos-recruit-contact/ にあり、_add_contact.py で各LPへコピーする。 */
(function () {
  var root = document.querySelector('.rc-contact');
  if (!root) return;
  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = [].slice.call(root.querySelectorAll('[role="tabpanel"]'));
  var endpoint = root.getAttribute('data-endpoint') || '';

  function show(id, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p) { p.hidden = p.id !== id; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('aria-controls')); });
    t.addEventListener('keydown', function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      show(tabs[(i + k + tabs.length) % tabs.length].getAttribute('aria-controls'), true);
    });
  });

  // ページ内リンク（#contact-engineer など）で、そのフォームを開く
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (panels.some(function (p) { return p.id === id; })) {
      show(id);
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#contact-"]');
    if (!a) return;
    e.preventDefault();
    history.replaceState(null, '', a.getAttribute('href'));
    fromHash();
  });
  fromHash();

  function collect(form) {
    var fields = [];
    [].slice.call(form.querySelectorAll('[data-label]')).forEach(function (box) {
      var label = box.getAttribute('data-label');
      var checks = box.querySelectorAll('input[type="checkbox"]:checked');
      var el = box.querySelector('input:not([type="checkbox"]),select,textarea');
      var value = checks.length
        ? [].map.call(checks, function (c) { return c.value; }).join('、')
        : (el ? el.value : '');
      fields.push([label, value]);
    });
    return fields;
  }

  panels.forEach(function (panel) {
    var form = panel.querySelector('form');
    var status = panel.querySelector('.cf-status');
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // チェックボックスの「1つ以上選ぶ」を確認
      var group = form.querySelector('[data-need-one]');
      if (group && !group.querySelector('input:checked')) {
        status.textContent = group.getAttribute('data-label') + 'を1つ以上お選びください。';
        status.className = 'cf-status is-error';
        group.querySelector('input').focus();
        return;
      }
      if (!endpoint) {
        status.textContent = 'ただいまフォームの準備中です。恐れ入りますが、時間をおいてお試しください。';
        status.className = 'cf-status is-error';
        return;
      }
      var payload = {
        category: form.getAttribute('data-category'),
        name: form.elements.name.value,
        email: form.elements.email.value,
        website: form.elements.website.value,
        fields: collect(form),
        page: location.href.split('#')[0]
      };
      button.disabled = true;
      status.textContent = '送信しています…';
      status.className = 'cf-status';
      // text/plain で送るとプリフライトが発生しない（Apps Script は OPTIONS を受けられない）
      fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || 'error');
          // 送信完了ページがあれば移動する（応募の計測はこのページへの遷移で判定する）
          var thanks = form.getAttribute('data-thanks');
          if (thanks) { location.href = new URL(thanks, location.href).href; return; }
          form.hidden = true;
          status.className = 'cf-status is-done';
          status.textContent = '送信しました。お問い合わせありがとうございます。内容を確認のうえ、担当者からご連絡します。';
          status.focus();
        })
        .catch(function (err) {
          button.disabled = false;
          status.className = 'cf-status is-error';
          status.textContent = String(err.message) === 'email'
            ? 'メールアドレスをご確認ください。'
            : '送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。';
        });
    });
  });
})();
