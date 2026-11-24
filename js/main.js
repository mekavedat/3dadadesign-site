(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? 'Kapat' : 'Menü';
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
