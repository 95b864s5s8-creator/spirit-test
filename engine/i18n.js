// ==================== i18n Engine ====================
// 用法：
//   i18n.t('key')         → 返回当前语言的文本（UI 静态文案）
//   i18n.setLang('en')    → 切换语言（自动刷新所有 data-i18n 节点）
//   i18n.getLang()        → 返回当前语言 'zh' | 'en'
//
// 动态翻译（问卷/结果页）：
//   i18n.tf('0_1','name') → 形态名称翻译
//   i18n.ts('NT_木')      → 叠加态英文名 / i18n.ts('NT_木','name') 同上
//   i18n.ts('NT_木','summary') → 叠加态摘要
//   i18n.ts('NT_木','mask')    → {title,text} 对象
//   i18n.td('guanyin','name')  → 守护神名字/字段翻译
//   i18n.tc('0_NT','act1')    → 三幕结论翻译
//
// HTML 写法：
//   <span data-i18n="landing.cta"></span>
//   <input data-i18n-placeholder="email.placeholder">
// =====================================================

var i18n = (function() {
  var _lang = 'zh';
  var _dict = {};
  var _loaded = {};
  // 扩展词典（仅英文需要加载，中文直接用原数据）
  var _forms = null;
  var _superpositions = null;
  var _deities = null;
  var _questions = null;

  // 语言检测：URL 参数优先 → localStorage 记忆 → 默认中文
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

  // 加载英文扩展词典
  function loadExtended(cb) {
    if (_lang !== 'zh') {
      var pending = 4;
      var done = function() { if (--pending === 0) cb && cb(); };
      loadJSON('/i18n/forms-en.json', function(d){ _forms = d; done(); });
      loadJSON('/i18n/superpositions-en.json', function(d){ _superpositions = d; done(); });
      loadJSON('/i18n/deities-en.json', function(d){ _deities = d; done(); });
      loadJSON('/i18n/questions-en.json', function(d){ _questions = d; done(); });
    } else {
      _forms = null; _superpositions = null; _deities = null; _questions = null;
      cb && cb();
    }
  }

  function loadJSON(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url + '?v=' + Date.now(), true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try { cb(JSON.parse(xhr.responseText)); } catch(e) { cb(null); }
      } else { cb(null); }
    };
    xhr.onerror = function() { cb(null); };
    xhr.send();
  }

  // 替换所有 data-i18n 节点
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = _dict[key];
      if (val !== undefined) {
        if (val.indexOf('<') !== -1) el.innerHTML = val;
        else el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var val = _dict[key];
      if (val !== undefined) el.placeholder = val;
    });
    document.documentElement.lang = _lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === _lang);
    });
  }

  function setLang(lang, cb) {
    if (lang !== 'zh' && lang !== 'en') return;
    _lang = lang;
    localStorage.setItem('soul_lang', lang);
    loadDict(lang, function() {
      loadExtended(function() {
        applyToDOM();
        // 触发自定义事件，让引擎知道语言切换了
        window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: _lang } }));
        cb && cb();
      });
    });
  }

  function t(key) {
    return _dict[key] !== undefined ? _dict[key] : key;
  }

  function getLang() { return _lang; }

  // ===== 形态翻译 (form-data.js) =====
  // tf(formKey, field?) — formKey 如 '0_1', field 如 'name'|'traditional'|'explanation'
  function tf(key, field) {
    if (_lang === 'zh' || !_forms) return null; // 中文返回null，调用方用原数据
    var entry = _forms[key];
    if (!entry) return null;
    if (field) return entry[field] || null;
    return entry;
  }

  // ===== 叠加态翻译 (superposition-engine.js) =====
  // ts(superKey, field?) — superKey 如 'NT_木'
  //   无 field → 返回英文名 (NAMES 映射)
  //   field='summary'/'mask'/'deficit'/'collision'/'s_result'/'w_result' → 对应字段
  function ts(key, field) {
    if (_lang === 'zh' || !_superpositions) return null;
    if (!field) return _superpositions.NAMES ? (_superpositions.NAMES[key] || null) : null;
    var prof = _superpositions.PROFILES ? _superpositions.PROFILES[key] : null;
    if (!prof) return null;
    if (field === 'name') return prof.name || null;
    if (field === 'summary') return prof.summary || null;
    // 结构化字段：mask, deficit, collision, s_result, w_result
    return prof[field] || null;
  }

  // ===== 守护神翻译 (deity-matrix.js) =====
  // td(deityId, field) — deityId 如 'guanyin', field 如 'name'|'position'|'quote'|'product'
  function td(id, field) {
    if (_lang === 'zh' || !_deities) return null;
    var d = _deities.DEITIES ? _deities.DEITIES[id] : null;
    if (!d) return null;
    return field ? (d[field] || null) : d;
  }

  // ===== 结论翻译 (三幕剧) =====
  // tc(matrixKey, act) — matrixKey 如 '0_NT', act 如 'act1'|'act2'|'act3'
  function tc(key, act) {
    if (_lang === 'zh' || !_deities) return null;
    var c = _deities.CONCLUSIONS ? _deities.CONCLUSIONS[key] : null;
    if (!c) return null;
    return act ? (c[act] || null) : c;
  }

  // ===== 问卷题目翻译 =====
  // tq(qid, field?) — qid 如 '0' (string), field: 'number'|'title'|'subtitle'
  function tq(qid, field) {
    if (_lang === 'zh' || !_questions) return null;
    var q = _questions.QUESTIONS ? _questions.QUESTIONS[qid] : null;
    if (!q) return null;
    if (field) return (q[field] !== undefined ? q[field] : null);
    return q;
  }

  // 进度文案翻译
  function tpl(idx) {
    if (_lang === 'zh' || !_questions) return null;
    var labels = _questions.PROGRESS_LABELS;
    return (labels && labels[idx] !== undefined) ? labels[idx] : null;
  }

  // 彩蛋文案翻译
  function tsq(qid) {
    if (_lang === 'zh' || !_questions) return null;
    var snacks = _questions.SOUL_SNACKS;
    return (snacks && snacks[qid] !== undefined) ? snacks[qid] : null;
  }

  // 初始化
  function init(cb) {
    _lang = detectLang();
    loadDict(_lang, function() {
      loadExtended(function() {
        applyToDOM();
        cb && cb(_lang);
      });
    });
  }

  return {
    init: init,
    setLang: setLang,
    t: t,
    getLang: getLang,
    applyToDOM: applyToDOM,
    tf: tf,       // form translation
    ts: ts,       // superposition translation
    td: td,       // deity translation
    tc: tc,       // conclusion translation
    tq: tq,       // question translation
    tpl: tpl,     // progress label translation
    tsq: tsq      // soul snack (easter egg) translation
  };
})();
