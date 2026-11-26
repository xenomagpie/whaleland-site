// The copy button. Without the script, the address stays visible as text and a mailto link.
(function () {
  var button = document.querySelector('.copy');
  if (!button) return;
  var status = document.getElementById('copy-status');
  var link = document.getElementById('address');
  var text = button.getAttribute('data-copy');
  var timer;
  button.hidden = false;

  function show(ok) {
    clearTimeout(timer);
    if (ok) {
      button.setAttribute('data-state', 'copied');
      status.textContent = 'The email address is on your clipboard.';
    } else {
      button.removeAttribute('data-state');          // never 'Copied' when it didn't
      var range = document.createRange();
      range.selectNodeContents(link);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Copying didn’t work here. The email address is selected, so you can copy it yourself.';
    }
    timer = setTimeout(function () {
      button.removeAttribute('data-state');
      status.textContent = '';
    }, ok ? 2500 : 8000);
  }

  function fallback() {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    area.style.fontSize = '16px';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    button.focus();
    return ok;
  }

  button.addEventListener('click', function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(fallback()); });
    } else {
      show(fallback());
    }
  });
})();

// The opening. With motion welcome, the first screen is the opening alone, and the header gathers itself from it:
// 「Inc.」 greys and becomes the header's line, 「Whaleland」 becomes the wordmark, the facts give way to the nav, and the
// whale falls: the mark's arcs sink into their own shadow while the same arcs rise out of a shadow beside the wordmark.
// At the end the same portal runs the other way. This script measures where those meetings happen and hands the numbers
// to the stylesheet. Where CSS scroll timelines or timeline-scope are missing, it also drives every animation itself.
(function () {
  var root = document.documentElement;
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: no-preference)') : null;
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 61.99rem)') : null;
  var timelines = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()') && CSS.supports('timeline-scope: --close'));
  var scrub = !timelines && !!Element.prototype.getAnimations;
  var q = function (s) { return document.querySelector(s); };
  var head = q('.site-head'), lock = q('.lockup'), kicker = q('.kicker'), word = q('.k-word'), inc = q('.k-inc'), mark = q('.hero-mark');
  var items = [];
  var queued = false;

  function on() { return !!(motion && motion.matches); }
  function px(name, v) { root.style.setProperty(name, (Math.round(v * 10) / 10) + 'px'); }
  function num(name, v) { root.style.setProperty(name, String(Math.round(v * 10000) / 10000)); }
  function box(el) {
    var x = 0, y = 0;
    for (var e = el; e; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };   // layout boxes: the animations' own transforms don't count
  }

  function measure() {
    if (!on() || !head || !lock || !kicker || !word || !inc || !mark) return;
    var hh = head.offsetHeight, W = head.offsetWidth;
    px('--hh-real', hh);                                 // the jump offset: the header as it is, wrapped or not
    var k = box(kicker), n = box(inc), kw = word.offsetWidth;
    var L = lock.getBoundingClientRect();                // the header is fixed: its place is the same at any scroll
    var S = L.width / 732;                               // the kit lockup's units → px
    var wx = L.left + 144 * S, wy = L.top + S, ww = 587 * S, wh = 83 * S;

    // 1. 「Inc.」 flattens in place onto a bar at 60 % of its box; the bar rides up with the page, and when it meets the
    //    header's lower edge (i1) the header's line takes over at exactly the same box, then stretches across.
    var i1 = Math.max(12, n.y + 0.6 * n.h - (hh - 0.5));
    var s0 = Math.min(0.99, n.w / W);
    px('--i1', i1); px('--i1a', i1 - 1); px('--i1b', i1 + 60);
    px('--l-x', n.x / (1 - s0)); num('--l-s', s0);              // scaleX(s0) about l-x lands exactly on 「Inc.」's box
    // 2. 「Whaleland」 goes into the same edge, and the wordmark comes up in the header as it does.
    px('--wo0', Math.max(0, i1 - 22)); px('--wo1', Math.max(1, i1 - 2));
    px('--wi0', Math.max(0, i1 - 4)); px('--wi1', i1 + 26);
    px('--bg0', Math.max(0, i1 - 24)); px('--bg1', i1 + 10);
    void kw; void wx; void wy; void ww; void wh;

    // 3. The fall starts within the first wheel step. The arcs sink 394 of the mark's 594 units, a little faster than the page
    //    rises, so they visibly go down into the shadow. It never starts before the whole source mark, shadow included, is
    //    in view, and it ends while the waterline still is.
    var V = root.clientHeight, m = box(mark), sink = 394 * m.w / 594, wl = m.y + m.h, eh = 12.843 * m.w / 594;
    var f0 = Math.max(8, i1 - 20, wl + eh - V + 8);
    var f1 = f0 + Math.max(150, Math.min(340, sink / 1.4));
    f1 = Math.max(f0 + 110, Math.min(f1, wl - hh - 24));
    px('--fold0', f0); px('--fold1', f1);
    // 5. The closing rise ends at 78 % of the footer's entry; it starts early enough to take at least 112 px of scroll,
    //    so the arcs may first come up from below the window's edge, and the footer needs no empty band to make room.
    var foot = q('.foot'), em = q('.end-mark');
    if (foot && em) {
      var fH = foot.offsetHeight, eb = box(em), span = V + eb.h, lineOff = eb.h * 383.504 / 399;   // the line sits at the shadow's centre
      var endAt = lineOff + 0.78 * fH, startAt = Math.max(0, endAt - Math.max(112, 0.78 * fH));     // px past the mark's cover start
      root.style.setProperty('--end0', 'cover ' + (Math.round(startAt / span * 10000) / 100) + '%');
      root.style.setProperty('--end1', 'cover ' + (Math.round(endAt / span * 10000) / 100) + '%');
      closeFrom = eb.y - V + startAt;                     // where the header's mark starts handing over to the footer
    }

    // 4. On a narrow screen each fact hands over to its nav item as it slides under the header.
    if (narrow && narrow.matches) {
      var at = function (s) { return box(q(s)).y - hh; };
      var hand = [at('.f1'), at('.f3'), at('.f4') + 16];
      for (var i = 0; i < 3; i++) { px('--n' + (i + 1) + '-0', hand[i] - 44); px('--n' + (i + 1) + '-1', hand[i] - 4); }   // the label is in before its fact goes
    }
  }

  // ----- the fallback scrubber -----
  function parse(value) {
    var m = /^\s*(cover|contain|entry|exit)\s+(-?[\d.]+)%\s*$/.exec(value || '');
    if (m) return [m[1], parseFloat(m[2]) / 100];
    m = /^\s*(-?[\d.]+)px\s*$/.exec(value || '');
    return m ? ['px', parseFloat(m[1])] : null;
  }
  // Where the subject's top edge is when a range point is reached, as CSS view timelines define it.
  function edge(point, view, height) {
    var from, to;
    if (point[0] === 'entry') { from = view; to = Math.max(view - height, 0); }
    else if (point[0] === 'exit') { from = Math.min(view - height, 0); to = -height; }
    else if (point[0] === 'contain') { from = Math.max(view - height, 0); to = Math.min(view - height, 0); }
    else { from = view; to = -height; }
    return from + (to - from) * point[1];
  }
  function collect() {
    items = [];
    if (!scrub || !on()) { root.classList.remove('sd-js'); return; }
    root.classList.add('sd-js');
    var subjects = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-tl]'), function (el) { subjects[el.getAttribute('data-tl')] = el; });
    Array.prototype.forEach.call(document.querySelectorAll('.sd'), function (el) {
      var style = getComputedStyle(el);
      var tl = style.getPropertyValue('--tl').trim();
      var byScroll = tl.indexOf('scroll(') === 0;
      var subject = byScroll ? null : subjects[tl];
      var start = parse(style.getPropertyValue('--r0')), end = parse(style.getPropertyValue('--r1'));
      var animation = el.getAnimations().filter(function (a) { return a.animationName; })[0];
      if ((byScroll || subject) && start && end && animation) items.push({ byScroll: byScroll, subject: subject, start: start, end: end, animation: animation });
    });
  }
  function update() {
    queued = false;
    var view = root.clientHeight, y = window.scrollY;
    var boxes = new Map();
    for (var i = 0; i < items.length; i++) {
      var it = items[i], p;
      if (it.byScroll) {
        p = it.end[1] === it.start[1] ? (y >= it.end[1] ? 1 : 0) : (y - it.start[1]) / (it.end[1] - it.start[1]);
      } else {
        var r = boxes.get(it.subject);
        if (!r) { r = it.subject.getBoundingClientRect(); boxes.set(it.subject, r); }
        if (!r.height && !r.width) continue;
        var a = edge(it.start, view, r.height), b = edge(it.end, view, r.height);
        p = a === b ? (r.top <= b ? 1 : 0) : (a - r.top) / (a - b);
      }
      it.animation.currentTime = Math.min(1, Math.max(0, p)) * 1000;
    }
    hits();                                            // hit regions from this frame's progress, not the last one's
  }
  function queue() { if (!queued) { queued = true; window.requestAnimationFrame(update); } }
  function reset() { measure(); collect(); update(); queueHits(); if (risen === null && on()) risen = window.scrollY >= parseFloat(getComputedStyle(root).getPropertyValue('--fold1')); }

  // The header's mark hops once each time its rise completes on the way down (never on load, never with reduced motion).
  var hmark = q('.hmark'), risen = null, closeFrom = Infinity;
  function watchRise() {
    if (!on() || !hmark) return;
    var done = window.scrollY >= parseFloat(getComputedStyle(root).getPropertyValue('--fold1'));
    var closing = window.scrollY >= closeFrom - 1;     // once the hand-over to the footer has begun, the mark is going down: no hop
    if (done && risen === false && !closing) { hmark.classList.remove('bob'); void hmark.getBoundingClientRect(); hmark.classList.add('bob'); }
    if (!done || closing) hmark.classList.remove('bob');   // going back up, or into the hand-over, cancels it at once
    risen = done;
  }
  if (hmark) hmark.addEventListener('animationend', function (e) { if (e.target.classList.contains('hm-bob-1')) hmark.classList.remove('bob'); });

  // Whatever is mostly transparent leaves pointer and touch hit-testing; keyboard focus still reaches it and shows it.
  var brand = q('.brand'), hword = q('.hword'), navs = [q('.n1'), q('.n2'), q('.n3')], facts = [q('.f1'), q('.f2'), q('.f3'), q('.f4')];
  var hitQueued = false;
  function hits() {
    hitQueued = false;
    var live = on();
    var set = function (el, by) { if (el) el.style.pointerEvents = live && +getComputedStyle(by || el).opacity < 0.5 ? 'none' : ''; };
    set(brand, hword);
    navs.forEach(function (el) { set(el); });
    facts.forEach(function (el) { set(el); });
  }
  function queueHits() { if (!hitQueued) { hitQueued = true; window.requestAnimationFrame(hits); } }

  window.addEventListener('scroll', function () { watchRise(); if (items.length) queue(); else queueHits(); }, { passive: true });
  document.addEventListener('focusin', queueHits);
  document.addEventListener('focusout', queueHits);
  window.addEventListener('resize', function () { window.requestAnimationFrame(reset); });
  window.addEventListener('pageshow', reset);
  window.addEventListener('load', reset);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reset);
  if (motion && motion.addEventListener) motion.addEventListener('change', reset);
  if (narrow && narrow.addEventListener) narrow.addEventListener('change', reset);
  document.addEventListener('focusin', function () { if (scrub) window.requestAnimationFrame(reset); });
  document.addEventListener('focusout', function () { if (scrub) window.requestAnimationFrame(reset); });
  reset();
})();
