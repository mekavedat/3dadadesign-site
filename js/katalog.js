// Ürün ve site bilgilerini data/ klasöründeki JSON dosyalarından çizer.
// Yönetim paneli (/admin) bu dosyaları günceller. Metinler textContent ile yazılır (HTML enjeksiyonu yok).
(function () {
  var KATEGORI = {
    'masa-duzeni': 'Masa düzeni',
    'ev-dekorasyonu': 'Ev dekorasyonu',
    'sunum': 'Sunum',
    'kisiye-ozel': 'Kişiye özel',
    'banyo': 'Banyo',
    'oyuncak-hobi': 'Oyuncak ve hobi'
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function urunKarti(u) {
    var art = el('article', 'item');
    var frame = el('div', 'frame');
    var img = el('img');
    img.src = u.gorsel;
    img.alt = u.ad;
    img.loading = 'lazy';
    img.width = 471;
    img.height = 500;
    frame.appendChild(img);
    if (u.one_cikan || u.yeni) {
      var rozetler = el('div', 'badges');
      if (u.one_cikan) rozetler.appendChild(el('span', 'badge', 'Öne çıkan'));
      if (u.yeni) rozetler.appendChild(el('span', 'badge', 'Yeni'));
      frame.appendChild(rozetler);
    }
    art.appendChild(frame);
    art.appendChild(el('p', 'tag', KATEGORI[u.kategori] || ''));
    art.appendChild(el('h3', null, u.ad));
    if (u.aciklama) art.appendChild(el('p', 'desc', u.aciklama));
    if (u.renkler && u.renkler.length) {
      art.appendChild(el('p', 'desc renkler', 'Renkler: ' + u.renkler.join(', ')));
    }
    if (u.fiyat) art.appendChild(el('p', 'price', u.fiyat));
    if (u.galeri && u.galeri.length) {
      var gal = el('div', 'thumbs');
      u.galeri.forEach(function (g) {
        var gi = el('img');
        gi.src = g.gorsel;
        gi.alt = g.alt || u.ad;
        gi.loading = 'lazy';
        gi.width = 96;
        gi.height = 96;
        gal.appendChild(gi);
      });
      art.appendChild(gal);
    }
    return art;
  }

  function filtreKur(urunler, aktif) {
    var kap = document.getElementById('kategori-filtre');
    kap.textContent = '';
    var kategoriler = ['tumu'].concat(Object.keys(KATEGORI).filter(function (k) {
      return urunler.some(function (u) { return u.kategori === k; });
    }));
    kategoriler.forEach(function (k) {
      var b = el('button', null, k === 'tumu' ? 'Tümü' : KATEGORI[k]);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(aktif === k));
      b.addEventListener('click', function () { urunleriCiz(urunler, k); filtreKur(urunler, k); });
      kap.appendChild(b);
    });
  }

  function urunleriCiz(urunler, filtre) {
    var liste = document.getElementById('urun-listesi');
    var durum = document.getElementById('urun-durum');
    liste.textContent = '';
    var secilen = urunler.filter(function (u) { return filtre === 'tumu' || u.kategori === filtre; });
    secilen.forEach(function (u) { liste.appendChild(urunKarti(u)); });
    durum.textContent = secilen.length ? '' : 'Bu kategoride henüz ürün yok.';
  }

  function siteBilgisiniUygula(s) {
    var h1 = document.querySelector('[data-alan="hero_baslik"]');
    var lead = document.querySelector('[data-alan="hero_aciklama"]');
    var adres = document.querySelector('[data-alan="adres"]');
    if (s.hero_baslik && h1) h1.textContent = s.hero_baslik;
    if (s.hero_aciklama && lead) lead.textContent = s.hero_aciklama;
    if (s.adres && adres) adres.textContent = s.adres;
    if (s.whatsapp) {
      document.querySelectorAll('[data-wa]').forEach(function (a) {
        a.href = 'https://wa.me/' + s.whatsapp.replace(/\D/g, '');
      });
    }
    if (s.telefon) {
      document.querySelectorAll('[data-tel]').forEach(function (a) {
        a.href = 'tel:+' + s.telefon.replace(/\D/g, '');
        a.textContent = s.telefon;
      });
    }
    if (s.eposta) {
      document.querySelectorAll('[data-mail]').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        a.href = 'mailto:' + s.eposta + (href.indexOf('?') > -1 ? href.slice(href.indexOf('?')) : '');
        if (a.tagName === 'A' && a.textContent.indexOf('@') > -1) a.textContent = s.eposta;
      });
    }
  }

  function kaydirmaAnimasyonu() {
    if (!('IntersectionObserver' in window)) return;
    var gozlemci = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add('is-in'); gozlemci.unobserve(g.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('#urun-listesi .item').forEach(function (k, i) {
      k.classList.add('reveal');
      k.style.transitionDelay = (i % 3) * 80 + 'ms';
      gozlemci.observe(k);
    });
  }

  function json(yol) {
    return fetch(yol, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(yol + ' ' + r.status);
      return r.json();
    });
  }

  json('data/site.json').then(siteBilgisiniUygula).catch(function () { /* varsayılan metinler kalır */ });

  json('data/urunler.json').then(function (veri) {
    var urunler = (veri.items || []).filter(function (u) { return u && u.ad && u.gorsel; });
    if (!urunler.length) {
      document.getElementById('urun-durum').textContent = 'Ürünler yakında eklenecek.';
      return;
    }
    filtreKur(urunler, 'tumu');
    urunleriCiz(urunler, 'tumu');
    kaydirmaAnimasyonu();
  }).catch(function () {
    document.getElementById('urun-durum').textContent =
      'Ürünler şu an yüklenemedi. Lütfen sayfayı yenileyin ya da WhatsApp üzerinden bize ulaşın.';
  });
})();
