/* =========================================================
   Studio M'man — camada de movimento
   Um único requestAnimationFrame conduz tudo: rolagem com
   inércia, paralaxe, texto que acende, lista grande e
   wordmark. Sem dependências externas.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var motion = !reduced;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* =======================================================
     1. tema, relógio, menu, formulário
     ======================================================= */

  var themeBtns = document.querySelectorAll('[data-theme-toggle]');

  function readTheme() {
    try {
      var saved = localStorage.getItem('mman:theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(mode) {
    html.setAttribute('data-theme', mode);
    var dark = mode === 'dark';
    Array.prototype.forEach.call(themeBtns, function (b) {
      b.textContent = dark ? 'Modo claro' : 'Modo escuro';
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0C0C0F' : '#E9E9E5');
  }

  applyTheme(readTheme());

  Array.prototype.forEach.call(themeBtns, function (b) {
    b.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('mman:theme', next); } catch (e) {}
    });
  });

  var clock = document.getElementById('clock');
  if (clock) {
    var fmt = null;
    try {
      fmt = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Recife', hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) {}
    var tick = function () {
      var d = new Date();
      clock.textContent = fmt ? fmt.format(d).replace(/^24/, '00') : d.toTimeString().slice(0, 8);
      clock.setAttribute('datetime', d.toISOString());
    };
    tick();
    setInterval(tick, 1000);
  }

  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menu-toggle');
  var menuOpen = false;

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menuOpen = open;
    if (open) menu.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.toggle('is-open', open);
      if (!open) setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 800);
    });
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

  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
  if (menu) menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && menuOpen) setMenu(false);
  });

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
      // substitua a linha abaixo por um fetch() para a sua URL.
      window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');

      if (status) {
        status.textContent = 'Recebido. Respondo em até um dia útil.';
        status.dataset.state = 'ok';
      }
      form.reset();
    });
  }

  /* =======================================================
     2. divisão de texto (linhas, palavras, caracteres)
     ======================================================= */

  // <h2 data-lines>Faça do jeito<br>mais simples</h2>
  Array.prototype.forEach.call(document.querySelectorAll('[data-lines]'), function (el) {
    var linhas = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = linhas.map(function (t) {
      return '<span class="line"><span>' + t.trim() + '</span></span>';
    }).join('');
  });

  // <p data-words>…</p>  →  um span por palavra, para acender na rolagem
  var wordBlocks = [];
  Array.prototype.forEach.call(document.querySelectorAll('[data-words]'), function (el) {
    var palavras = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var spans = palavras.map(function (p, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = p;
      el.appendChild(s);
      if (i < palavras.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    wordBlocks.push({ el: el, spans: spans });
  });

  /* =======================================================
     3. entrada dos blocos (IntersectionObserver)
     ======================================================= */

  var toWatch = document.querySelectorAll('.reveal, [data-lines], .takeover, .contato__title');

  if (!motion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(toWatch, function (el) {
      el.classList.add('is-in', 'is-ready');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in', 'is-ready');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(toWatch, function (el) { io.observe(el); });
  }

  /* =======================================================
     4. rolagem com inércia
     ======================================================= */

  var scr = { target: window.scrollY, current: window.scrollY, active: false, self: 0 };

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  if (motion && fine) {
    html.classList.add('has-lerp');
    scr.active = true;

    window.addEventListener('wheel', function (ev) {
      if (menuOpen || ev.ctrlKey) return;
      ev.preventDefault();
      var mult = ev.deltaMode === 1 ? 18 : ev.deltaMode === 2 ? window.innerHeight : 1;
      scr.target = clamp(scr.target + ev.deltaY * mult, 0, maxScroll());
    }, { passive: false });

    // teclado, barra de rolagem e âncoras nativas voltam a mandar
    window.addEventListener('scroll', function () {
      if (Math.abs(window.scrollY - scr.self) > 2) {
        scr.target = scr.current = window.scrollY;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      scr.target = clamp(scr.target, 0, maxScroll());
    });
  }

  function scrollToEl(el) {
    var y = clamp(window.scrollY + el.getBoundingClientRect().top - 12, 0, maxScroll());
    if (scr.active) { scr.target = y; }
    else { window.scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' }); }
  }

  document.addEventListener('click', function (ev) {
    var link = ev.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    scrollToEl(target);
    history.replaceState(null, '', id);
  });

  /* =======================================================
     5. cursor e rastro de imagens
     ======================================================= */

  var cursor = document.getElementById('cursor');
  var mouse = { x: 0, y: 0, px: 0, py: 0, has: false };

  if (cursor && fine && motion) {
    document.addEventListener('mousemove', function (ev) {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
      if (!mouse.has) { mouse.px = mouse.x; mouse.py = mouse.y; mouse.has = true; }
      cursor.classList.add('is-on');
    }, { passive: true });

    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });

    var grow = 'a, button, .pill, input, textarea, .biglist__item, .project';
    document.addEventListener('mouseover', function (ev) {
      if (ev.target.closest(grow)) cursor.classList.add('is-big');
    });
    document.addEventListener('mouseout', function (ev) {
      if (ev.target.closest(grow)) cursor.classList.remove('is-big');
    });
  }

  // rastro: ladrilhos que nascem no cursor dentro do manifesto
  var statement = document.getElementById('statement');

  if (statement && fine && motion) {
    var VARIANTES = [
      ['tile--a', "M'man"], ['tile--b', '°2026'], ['tile--c', 'Recife'],
      ['tile--d', 'Olá'], ['tile--a', 'Ousado'], ['tile--c', 'Só seu'],
      ['tile--b', 'Sob<br>medida'], ['tile--d', 'PE']
    ];

    var trail = document.createElement('div');
    trail.className = 'trail';
    trail.setAttribute('aria-hidden', 'true');
    document.body.appendChild(trail);

    var pool = VARIANTES.map(function (v) {
      var t = document.createElement('div');
      t.className = 'tile ' + v[0];
      t.innerHTML = '<span class="tile__word">' + v[1] + '</span>';
      trail.appendChild(t);
      return t;
    });

    var next = 0, lastX = 0, lastY = 0, armed = false;
    var zona = statement.closest('section');

    zona.addEventListener('mousemove', function (ev) {
      if (!armed) { lastX = ev.clientX; lastY = ev.clientY; armed = true; return; }
      var dx = ev.clientX - lastX, dy = ev.clientY - lastY;
      if (Math.sqrt(dx * dx + dy * dy) < 130) return;
      lastX = ev.clientX; lastY = ev.clientY;

      var tile = pool[next % pool.length];
      next++;
      tile.style.left = ev.clientX + 'px';
      tile.style.top = ev.clientY + 'px';
      tile.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(1) + 'deg');
      tile.classList.remove('is-off');
      // reinicia a transição
      void tile.offsetWidth;
      tile.classList.add('is-on');

      clearTimeout(tile._t);
      tile._t = setTimeout(function () {
        tile.classList.remove('is-on');
        tile.classList.add('is-off');
      }, 620);
    }, { passive: true });

    zona.addEventListener('mouseleave', function () {
      armed = false;
      pool.forEach(function (t) { t.classList.remove('is-on'); t.classList.add('is-off'); });
    });
  }

  /* =======================================================
     6. marquee do contato
     ======================================================= */

  var marquee = document.getElementById('marquee');
  if (marquee) {
    var MARCAS = [
      ['tile--a', "M'man"], ['tile--shot', 'Confiança'], ['tile--b', 'Landing'],
      ['tile--c', 'Site<br>completo'], ['tile--d', 'Manutenção'], ['tile--shot', 'Recife'],
      ['tile--b', '°2026'], ['tile--a', 'Sob<br>medida']
    ];
    var linha = MARCAS.map(function (m) {
      return '<div class="tile ' + m[0] + '"><span class="tile__word">' + m[1] + '</span></div>';
    }).join('');
    marquee.innerHTML = linha + linha; // duplicado para o loop fechar
  }

  /* =======================================================
     7. motor de rolagem — paralaxe, acender, lista, wordmark
     ======================================================= */

  var parallax = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (el) {
    return { el: el, f: parseFloat(el.getAttribute('data-parallax')) || 0 };
  });
  var scalers = document.querySelectorAll('[data-scale]');
  var growers = document.querySelectorAll('[data-grow]');
  var wordmark = document.querySelector('[data-wordmark] span');
  var biglists = Array.prototype.map.call(document.querySelectorAll('[data-biglist]'), function (sec) {
    return {
      sec: sec,
      items: sec.querySelectorAll('.biglist__item'),
      tiles: sec.querySelectorAll('.biglist__media .tile'),
      active: -1
    };
  });
  var chromes = document.querySelectorAll('.chrome');
  var takeover = document.querySelector('.takeover');

  function frame() {
    // --- rolagem com inércia ---
    if (scr.active) {
      scr.current = lerp(scr.current, scr.target, 0.098);
      if (Math.abs(scr.target - scr.current) < 0.08) scr.current = scr.target;
      if (Math.abs(window.scrollY - scr.current) > 0.4) {
        scr.self = scr.current;
        window.scrollTo(0, scr.current);
      }
    }

    var vh = window.innerHeight;

    // --- cursor ---
    if (cursor && mouse.has) {
      mouse.px = lerp(mouse.px, mouse.x, 0.22);
      mouse.py = lerp(mouse.py, mouse.y, 0.22);
      cursor.style.transform = 'translate3d(' + mouse.px.toFixed(1) + 'px,' + mouse.py.toFixed(1) + 'px,0)';
    }

    if (motion) {
      // --- paralaxe (o cartão atravessa a manchete) ---
      parallax.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        var mid = (r.top + r.height / 2 - vh / 2) / vh;   // -1 … 1
        p.el.style.transform = 'translate3d(0,' + (mid * p.f * 100).toFixed(1) + 'px,0)';
      });

      // --- mídia que cresce ao entrar ---
      Array.prototype.forEach.call(scalers, function (el) {
        var r = el.getBoundingClientRect();
        var t = clamp(1 - (r.top - vh * 0.15) / (vh * 0.85), 0, 1);
        el.style.transform = 'scale(' + (0.84 + t * 0.16).toFixed(4) + ')';
      });

      // --- ladrilho que abre no meio da frase ---
      Array.prototype.forEach.call(growers, function (el) {
        var r = el.getBoundingClientRect();
        var t = clamp(1 - (r.top - vh * 0.3) / (vh * 0.6), 0, 1);
        var alvo = el.firstElementChild ? el.firstElementChild.offsetWidth : 0;
        el.style.width = (alvo * t).toFixed(1) + 'px';
        el.style.marginRight = (t * 0.14).toFixed(3) + 'em';
      });

      // --- palavras que acendem ---
      wordBlocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        var t = clamp((vh * 0.82 - r.top) / (vh * 0.42 + r.height * 0.5), 0, 1);
        var acesas = Math.round(t * b.spans.length);
        for (var i = 0; i < b.spans.length; i++) {
          var lit = i < acesas;
          if (b.spans[i]._lit !== lit) {
            b.spans[i].classList.toggle('is-lit', lit);
            b.spans[i]._lit = lit;
          }
        }
      });

      // --- wordmark que sobe da base ---
      if (wordmark) {
        // a revelação fecha exatamente quando a base do bloco alcança
        // a base da janela — que é o fim da página
        var wr = wordmark.parentElement.getBoundingClientRect();
        var wt = clamp((vh - wr.top) / (wr.height * 0.9), 0, 1);
        pintarWordmark((1 - wt) * 46);
      }
    }

    // --- lista grande: o item mais próximo do centro acende ---
    biglists.forEach(function (bl) {
      var alvo = -1, melhor = Infinity;
      for (var i = 0; i < bl.items.length; i++) {
        var r = bl.items[i].getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        var d = Math.abs(r.top + r.height / 2 - vh * 0.5);
        if (d < melhor) { melhor = d; alvo = i; }
      }
      if (alvo !== bl.active) {
        if (bl.items[bl.active]) bl.items[bl.active].classList.remove('is-active');
        if (bl.tiles[bl.active]) bl.tiles[bl.active].classList.remove('is-on');
        if (alvo > -1) {
          bl.items[alvo].classList.add('is-active');
          if (bl.tiles[alvo]) bl.tiles[alvo].classList.add('is-on');
        }
        bl.active = alvo;
      }
    });

    // --- chrome sobre o painel colorido ---
    // A virada segue a linha média da barra, não a faixa inteira: assim o
    // texto só fica branco quando de fato está por cima do azul.
    if (takeover) {
      var tr = takeover.getBoundingClientRect();
      Array.prototype.forEach.call(chromes, function (c) {
        var meio = c.classList.contains('chrome--top') ? 21 : vh - 21;
        c.classList.toggle('is-over', tr.top <= meio && tr.bottom >= meio);
      });
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  /* =======================================================
     8. wordmark medido para encher a largura exata
     ======================================================= */

  // A altura vem de um orçamento vertical; a largura é fechada com um
  // scaleX medido. Anton é estreita demais para encher a linha sozinha —
  // o esticão horizontal é o que dá o bloco cheio de ponta a ponta.
  var markX = 1;

  function pintarWordmark(desloc) {
    if (!wordmark) return;
    wordmark.style.transform =
      'translate3d(0,' + desloc.toFixed(1) + '%,0) scaleX(' + markX.toFixed(4) + ')';
  }

  function ajustarWordmark() {
    if (!wordmark) return;
    var largura = wordmark.parentElement.clientWidth;
    if (!largura) return;

    wordmark.style.transform = 'none';
    wordmark.style.fontSize = '200px';
    var porPx = wordmark.scrollWidth / 200;              // largura do texto por px de corpo
    if (!porPx) return;

    var porLargura = largura / porPx;                    // corpo que enche a linha sem esticar
    var porAltura = clamp(window.innerHeight * 0.3, 96, 300) / 0.727;  // 0.727em ≈ caixa alta da Anton
    var corpo = Math.min(porLargura, porAltura);

    wordmark.style.fontSize = corpo.toFixed(1) + 'px';
    markX = clamp(largura / (corpo * porPx), 1, 2.2);    // o resto fecha esticando na horizontal
    pintarWordmark(motion ? 46 : 0);
  }

  ajustarWordmark();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarWordmark);
  window.addEventListener('load', ajustarWordmark);

  var reTimer;
  window.addEventListener('resize', function () {
    clearTimeout(reTimer);
    reTimer = setTimeout(ajustarWordmark, 120);
  });

  /* =======================================================
     9. cortina de entrada
     ======================================================= */

  var intro = document.getElementById('intro');

  function abrir() {
    document.body.classList.remove('is-loading');
    var hero = document.querySelector('.hero__title');
    if (intro) {
      intro.classList.add('is-out');
      setTimeout(function () { intro.classList.add('is-gone'); }, 950);
    }
    if (hero) hero.classList.add('is-ready');
  }

  if (!motion) {
    if (intro) intro.classList.add('is-gone');
    document.body.classList.remove('is-loading');
    var h = document.querySelector('.hero__title');
    if (h) h.classList.add('is-ready');
  } else {
    window.addEventListener('load', function () { setTimeout(abrir, 520); });
    // rede de segurança: se algo travar o load, a cortina sai assim mesmo
    setTimeout(abrir, 2600);
  }
})();
