/* Cartões em carrossel (pílula/folha) — componente genérico dirigido por marcação.
   Uso: <div class="cartoes" data-cartoes data-forma="pilula" data-auto="4500" aria-label="..."> <article class="cartao" data-glow="217,164,65" data-rotulo="Nome">…</article> … </div>
   API: window.Cartoes.iniciar(el, {auto, onFoco, inicio}) -> {ir, proximo, anterior, indice, destruir}; window.Cartoes.iniciarTodos(root).
   Desempenho: sem requestAnimationFrame; só um setTimeout por vez, e só com o carrossel visível, aba ativa e sem pausa.
   Decisão de auto-avanço: qualquer interação manual (toque, clique, tecla, arrasto) DESLIGA o auto para sempre naquela instância (o mais simples). Hover/foco só pausam. */
(function () {
  'use strict';

  var LIMIAR = 40; // px de arrasto para trocar de cartão
  var instancias = new WeakMap();
  var mqReduz = window.matchMedia('(prefers-reduced-motion: reduce)');

  function criar(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    return e;
  }

  function iniciar(el, opts) {
    if (!el) return null;
    if (instancias.has(el)) return instancias.get(el);
    opts = opts || {};

    var cartoes = Array.prototype.filter.call(el.children, function (c) { return c.classList.contains('cartao'); });
    var n = cartoes.length;
    if (!n) return null;

    var auto = opts.auto != null ? Number(opts.auto) : parseInt(el.getAttribute('data-auto'), 10);
    if (!(auto > 0)) auto = 0;
    var multi = n > 1;

    /* ---------- montagem (os .cartao só mudam de lugar; o conteúdo não é tocado) ---------- */
    var palco = criar('div', 'cartoes__palco');
    var trilho = criar('div', 'cartoes__trilho');
    var piso = criar('div', 'cartoes__piso', { 'aria-hidden': 'true' });
    var live = criar('div', 'cartoes__sr', { 'aria-live': 'polite', 'aria-atomic': 'true' });
    var chaos = [];
    var botoes = [];
    var ctl = null, ant = null, prox = null, pontos = null;

    cartoes.forEach(function (c, k) {
      var g = c.getAttribute('data-glow');
      if (g) c.style.setProperty('--glow', g);
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'slide');
      c.setAttribute('aria-label', (k + 1) + ' de ' + n);
      trilho.appendChild(c);
      var chao = criar('i', 'cartoes__chao');
      if (g) chao.style.setProperty('--glow', g);
      piso.appendChild(chao);
      chaos.push(chao);
    });
    palco.appendChild(trilho);
    palco.appendChild(piso);

    if (multi) {
      ctl = criar('div', 'cartoes__ctl');
      ant = criar('button', 'cartoes__seta', { type: 'button', 'aria-label': 'Cartão anterior' });
      ant.innerHTML = '<span aria-hidden="true">&#8249;</span>';
      prox = criar('button', 'cartoes__seta', { type: 'button', 'aria-label': 'Próximo cartão' });
      prox.innerHTML = '<span aria-hidden="true">&#8250;</span>';
      pontos = criar('div', 'cartoes__pontos');
      cartoes.forEach(function (c, k) {
        var b = criar('button', 'cartoes__ponto', { type: 'button', 'data-i': k, 'aria-label': 'Ir para o cartão ' + (k + 1) + ' de ' + n });
        pontos.appendChild(b);
        botoes.push(b);
      });
      ctl.appendChild(ant); ctl.appendChild(pontos); ctl.appendChild(prox);
    }

    el.appendChild(palco);
    if (ctl) el.appendChild(ctl);
    el.appendChild(live);
    el.classList.add('cartoes--pronto');
    if (el.getAttribute('aria-label')) {
      el.setAttribute('role', 'region');
      el.setAttribute('aria-roledescription', 'carrossel');
    }
    if (multi) el.setAttribute('tabindex', '0'); // para receber as setas do teclado

    /* ---------- estado ---------- */
    var atual = -1;
    var distancias = [];
    var timer = 0;
    var interagiu = false, pausado = false, visivel = true, abaAtiva = document.visibilityState !== 'hidden';
    var ls = [];
    function on(t, ev, fn, op) { t.addEventListener(ev, fn, op); ls.push([t, ev, fn, op]); }

    function aplicar(i, anunciar) {
      i = ((i % n) + n) % n;
      if (i === atual) return;
      atual = i;
      cartoes.forEach(function (c, k) {
        var d = k - i;
        if (d > n / 2) d -= n; else if (d < -n / 2) d += n;
        var antes = distancias[k];
        distancias[k] = d;
        // cartão distante que troca de lado: reposiciona sem animar, para não atravessar a fileira
        var salto = antes !== undefined && Math.abs(antes) >= 2 && Math.abs(d) >= 2 && (antes < 0) !== (d < 0);
        if (salto) c.style.transition = 'none';
        c.style.setProperty('--d', Math.max(-3, Math.min(3, d)));
        c.style.zIndex = 10 - Math.min(Math.abs(d), 9);
        c.classList.toggle('em-foco', d === 0);
        c.classList.toggle('a-esq', d < 0);
        c.classList.toggle('a-dir', d > 0);
        c.classList.toggle('longe', Math.abs(d) >= 2);
        c.classList.toggle('oculto', Math.abs(d) > 2);
        if (d === 0) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
        chaos[k].classList.toggle('ativo', d === 0);
        if (botoes[k]) { if (d === 0) botoes[k].setAttribute('aria-current', 'true'); else botoes[k].removeAttribute('aria-current'); }
        if (salto) { void c.offsetWidth; c.style.transition = ''; }
      });
      if (mqReduz.matches) { // modo sem movimento: o trilho é uma fileira com scroll-snap; só centraliza o ativo
        var c = cartoes[i];
        trilho.scrollTo({ left: c.offsetLeft - (trilho.clientWidth - c.offsetWidth) / 2, behavior: 'auto' });
      }
      if (anunciar) live.textContent = 'Cartão ' + (i + 1) + ' de ' + n + ': ' + (cartoes[i].getAttribute('data-rotulo') || '');
      if (typeof opts.onFoco === 'function') {
        try { opts.onFoco(i, cartoes[i]); } catch (e) { if (window.console) console.error(e); }
      }
    }

    /* ---------- auto-avanço ---------- */
    function agendar() {
      clearTimeout(timer);
      var ativo = auto > 0 && multi && !interagiu && !pausado && visivel && abaAtiva && !mqReduz.matches;
      el.classList.toggle('cartoes--parado', !(visivel && abaAtiva));
      if (!ativo) return;
      timer = setTimeout(function () { aplicar(atual + 1, false); agendar(); }, auto);
    }
    // navegação feita pelo usuário: para o auto de vez
    function manual(i) { interagiu = true; clearTimeout(timer); aplicar(i, true); }

    /* ---------- eventos ---------- */
    if (multi) {
      on(ant, 'click', function () { manual(atual - 1); });
      on(prox, 'click', function () { manual(atual + 1); });
      on(pontos, 'click', function (e) {
        var b = e.target.closest('.cartoes__ponto');
        if (b) manual(Number(b.getAttribute('data-i')));
      });

      on(el, 'keydown', function (e) {
        var t = e.target;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
        var i = null;
        if (e.key === 'ArrowLeft') i = atual - 1;
        else if (e.key === 'ArrowRight') i = atual + 1;
        else if (e.key === 'Home') i = 0;
        else if (e.key === 'End') i = n - 1;
        if (i === null) return;
        e.preventDefault();
        manual(i);
      });

      // arrastar/deslizar (touch-action: pan-y no CSS mantém a rolagem vertical livre)
      var ptr = null, arrastou = false;
      on(trilho, 'pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        ptr = { id: e.pointerId, x: e.clientX, y: e.clientY };
        arrastou = false;
        interagiu = true; clearTimeout(timer);
      });
      on(trilho, 'pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id || arrastou || mqReduz.matches) return;
        if (e.pointerType === 'mouse' && !e.buttons) { ptr = null; return; }
        var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
        if (Math.abs(dx) >= LIMIAR && Math.abs(dx) > Math.abs(dy)) {
          arrastou = true;
          manual(atual + (dx < 0 ? 1 : -1));
        }
      });
      on(document, 'pointerup', function () { ptr = null; });
      on(document, 'pointercancel', function () { ptr = null; });
      on(trilho, 'dragstart', function (e) { e.preventDefault(); });

      // clique no vizinho traz ao foco (captura: o conteúdo do vizinho não dispara)
      on(trilho, 'click', function (e) {
        if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; return; }
        var c = e.target.closest('.cartao');
        var k = c ? cartoes.indexOf(c) : -1;
        if (k > -1 && k !== atual) { e.preventDefault(); e.stopPropagation(); manual(k); }
      }, true);

      // foco por Tab dentro de um cartão fora de foco o traz ao centro
      on(trilho, 'focusin', function (e) {
        var c = e.target.closest('.cartao');
        var k = c ? cartoes.indexOf(c) : -1;
        if (k > -1 && k !== atual) aplicar(k, true);
      });

      // pausas (não desligam o auto, só suspendem)
      on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { pausado = true; agendar(); } });
      on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') { pausado = false; agendar(); } });
      on(el, 'focusin', function () { pausado = true; agendar(); });
      on(el, 'focusout', function () { pausado = false; agendar(); });
      on(document, 'visibilitychange', function () { abaAtiva = document.visibilityState !== 'hidden'; agendar(); });
      if (mqReduz.addEventListener) on(mqReduz, 'change', agendar);
    }

    var io = null;
    if (multi && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        visivel = es[es.length - 1].isIntersecting;
        agendar();
      }, { threshold: 0.2 });
      io.observe(el);
    }

    /* ---------- API ---------- */
    aplicar(opts.inicio || 0, false);
    agendar();

    var api = {
      ir: function (i) { aplicar(i, true); agendar(); },
      proximo: function () { aplicar(atual + 1, true); agendar(); },
      anterior: function () { aplicar(atual - 1, true); agendar(); },
      indice: function () { return atual; },
      destruir: function () {
        clearTimeout(timer);
        if (io) io.disconnect();
        ls.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
        cartoes.forEach(function (c) {
          el.insertBefore(c, palco);
          ['role', 'aria-roledescription', 'aria-label', 'aria-current'].forEach(function (a) { c.removeAttribute(a); });
          c.classList.remove('em-foco', 'a-esq', 'a-dir', 'longe', 'oculto');
          c.style.removeProperty('--d'); c.style.removeProperty('--glow');
          c.style.zIndex = ''; c.style.transition = '';
        });
        palco.remove(); if (ctl) ctl.remove(); live.remove();
        el.classList.remove('cartoes--pronto', 'cartoes--parado');
        ['role', 'aria-roledescription', 'tabindex'].forEach(function (a) { el.removeAttribute(a); });
        instancias.delete(el);
      }
    };
    instancias.set(el, api);
    return api;
  }

  function iniciarTodos(root) {
    return Array.prototype.map.call((root || document).querySelectorAll('[data-cartoes]'), function (el) { return iniciar(el); });
  }

  window.Cartoes = { iniciar: iniciar, iniciarTodos: iniciarTodos };
})();
