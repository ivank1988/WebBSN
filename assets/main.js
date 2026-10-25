(function () {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Remember the language the visitor picked
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('bsn-lang', a.getAttribute('hreflang')); } catch (e) {}
    });
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
