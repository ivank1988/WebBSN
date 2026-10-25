(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Header background after scrolling
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Remember the language the visitor picked
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('bsn-lang', a.getAttribute('hreflang')); } catch (e) {}
    });
  });

  // Split headings into words so they can slide up
  document.querySelectorAll('.split').forEach(function (el) {
    var html = '';
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          html += /^\s+$/.test(part) ? ' ' : '<span class="w"><span>' + part + '</span></span>';
        });
      } else {
        html += '<span class="w"><span>' + node.outerHTML + '</span></span>';
      }
    });
    el.innerHTML = html;
    el.querySelectorAll('.w > span').forEach(function (s, i) { s.style.transitionDelay = (i * 0.07) + 's'; });
  });

  // Reveal elements as they scroll into view
  var targets = document.querySelectorAll('.reveal, .split, .e2e-track');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  // Live local time for each office
  var clocks = document.querySelectorAll('[data-tz]');
  function tick() {
    clocks.forEach(function (c) {
      try {
        c.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.getAttribute('data-tz') });
      } catch (e) {}
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 15000); }

  // Animated network background
  document.querySelectorAll('canvas.net').forEach(function (canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, nodes = [], mouse = { x: -9999, y: -9999 }, visible = true;
    var host = canvas.parentElement;

    function resize() {
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, (w * h) / 16000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6, hub: Math.random() < 0.08
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var max = 150;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        var mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 160) { a.x += mdx / md * 0.6; a.y += mdy / md * 0.6; }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < max) {
            ctx.strokeStyle = 'rgba(143,180,255,' + (1 - d / max) * 0.22 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hub ? 3.2 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hub ? 'rgba(111,227,255,.9)' : 'rgba(200,215,245,.7)';
        if (n.hub) { ctx.shadowColor = '#6fe3ff'; ctx.shadowBlur = 14; } else { ctx.shadowBlur = 0; }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function loop() { if (visible) draw(); requestAnimationFrame(loop); }

    resize();
    window.addEventListener('resize', resize);
    host.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    }
    if (reduce) draw(); else loop();
  });

  // Contact form opens the visitor's email app with the message filled in
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = (d.get('topic') || '') + ' | ' + (d.get('name') || '');
      var body = d.get('message') + '\n\n' + d.get('name') +
        (d.get('company') ? '\n' + d.get('company') : '') +
        (d.get('email') ? '\n' + d.get('email') : '');
      window.location.href = 'mailto:info@bsnsolution.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
