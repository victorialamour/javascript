/* Studio M'man — comportamentos do site
   Tudo aqui é progressivo: sem JS a página continua legível e navegável. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. tema claro / escuro ---------- */
  var themeBtn = document.getElementById('theme-toggle');

  function readTheme() {
    try {
      var saved = localStorage.getItem('mman:theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    var dark = mode === 'dark';
    if (themeBtn) {
      themeBtn.textContent = dark ? 'Modo claro' : 'Modo escuro';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0D0D10' : '#F0F0EC');
  }

  applyTheme(readTheme());

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('mman:theme', next); } catch (e) {}
    });
  }

  /* ---------- 2. relógio de Recife ---------- */
  var clock = document.getElementById('clock');

  if (clock) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Recife',
        hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) { fmt = null; }

    var tick = function () {
      var d = new Date();
      clock.textContent = fmt ? fmt.format(d).replace(/^24/, '00') : d.toTimeString().slice(0, 8);
      clock.setAttribute('datetime', d.toISOString());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 3. menu tela cheia ---------- */
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menu-toggle');

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    // deixa o browser aplicar o hidden antes de animar
    requestAnimationFrame(function () { menu.classList.toggle('is-open', open); });
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Fechar' : 'Menu';
    document.body.classList.toggle('is-locked', open);
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      menuBtn.focus();
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
  }

  if (menu) {
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  /* ---------- 4. entrada dos blocos ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- 5. prévia dos projetos ---------- */
  var preview = document.getElementById('preview');
  var projects = document.querySelectorAll('.project');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (preview && projects.length && fine && !reduced) {
    var px = 0, py = 0, cx = 0, cy = 0, raf = null;

    var loop = function () {
      cx += (px - cx) * 0.16;
      cy += (py - cy) * 0.16;
      preview.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(loop);
    };

    Array.prototype.forEach.call(projects, function (item) {
      item.addEventListener('mouseenter', function () {
        preview.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      item.addEventListener('mouseleave', function () {
        preview.classList.remove('is-on');
      });
    });

    document.addEventListener('mousemove', function (ev) {
      px = ev.clientX + 26;
      py = ev.clientY - 90;
      if (!cx && !cy) { cx = px; cy = py; }
    }, { passive: true });
  }

  /* ---------- 6. formulário ---------- */
  var form = document.getElementById('form');
  var status = document.getElementById('form-status');
  var WHATS = '5581973047976';

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var data = new FormData(form);
      var nome = (data.get('nome') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();

      if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) {
          status.textContent = 'Falta o nome ou o e-mail está incompleto.';
          status.dataset.state = 'erro';
        }
        (nome ? form.querySelector('#email') : form.querySelector('#nome')).focus();
        return;
      }

      var linhas = [
        'Olá! Meu nome é ' + nome + '.',
        'Interesse: ' + (data.get('interesse') || '—'),
        'E-mail: ' + email,
        data.get('whatsapp') ? 'WhatsApp: ' + data.get('whatsapp') : '',
        data.get('mensagem') ? '' + data.get('mensagem') : ''
      ].filter(Boolean);

      // Sem back-end: o envio abre o WhatsApp com a mensagem pronta.
      // Para trocar por um endpoint (Formspree, Basin, função serverless),
      // substitua as duas linhas abaixo por um fetch() para a sua URL.
      window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');

      if (status) {
        status.textContent = 'Recebido. Respondo em até um dia útil.';
        status.dataset.state = 'ok';
      }
      form.reset();
    });
  }

  /* ---------- 7. rolagem suave nas âncoras ---------- */
  document.addEventListener('click', function (ev) {
    var link = ev.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
})();
