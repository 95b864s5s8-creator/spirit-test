// ==================== i18n Engine ====================
// 用法：
//   i18n.t('key')         → 返回当前语言的文本
//   i18n.setLang('en')    → 切换语言（自动刷新所有 data-i18n 节点）
//   i18n.getLang()        → 返回当前语言 'zh' | 'en'
//
// HTML 写法：
//   <span data-i18n="landing.cta"></span>
//   <input data-i18n-placeholder="email.placeholder">
// =====================================================

var i18n = (function() {
  var _lang = 'zh';
  var _dict = {};
  var _loaded = {};

  // 语言检测：URL 参数优先 → localStorage 记忆 → 默认中文
  // 不做浏览器语言自动检测，语言由用户主动选择
  function detectLang() {
    var params = new URLSearchParams(window.location.search);
    var urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'zh') return urlLang;
    var stored = localStorage.getItem('soul_lang');
    if (stored === 'en' || stored === 'zh') return stored;
    return 'zh'; // 默认中文
  }

  function loadDict(lang, cb) {
    if (_loaded[lang]) { _dict = _loaded[lang]; cb && cb(); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/i18n/' + lang + '.json?v=' + Date.now(), true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          _loaded[lang] = JSON.parse(xhr.responseText);
          _dict = _loaded[lang];
        } catch(e) { console.warn('[i18n] parse error', e); }
      }
      cb && cb();
    };
    xhr.onerror = function() { cb && cb(); };
    xhr.send();
  }

  // 替换所有 data-i18n 节点
  function applyToDOM() {
    // textContent 替换
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = _dict[key];
      if (val !== undefined) {
        // 支持 <br> 等 HTML 标签
        if (val.indexOf('<') !== -1) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });
    // placeholder 替换
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var val = _dict[key];
      if (val !== undefined) el.placeholder = val;
    });
    // html lang 属性
    document.documentElement.lang = _lang === 'zh' ? 'zh-CN' : 'en';
    // 更新语言切换按钮状态
    document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === _lang);
    });
  }

  function setLang(lang, cb) {
    if (lang !== 'zh' && lang !== 'en') return;
    _lang = lang;
    localStorage.setItem('soul_lang', lang);
    loadDict(lang, function() {
      applyToDOM();
      cb && cb();
    });
  }

  function t(key) {
    return _dict[key] !== undefined ? _dict[key] : key;
  }

  function getLang() { return _lang; }

  // 初始化：自动检测语言并加载
  function init(cb) {
    _lang = detectLang();
    loadDict(_lang, function() {
      applyToDOM();
      cb && cb(_lang);
    });
  }

  return { init: init, setLang: setLang, t: t, getLang: getLang, applyToDOM: applyToDOM };
})();
