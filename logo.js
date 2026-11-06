/* Desenhista de logotipos da Stars (canvas 2D, sem dependências).
   Define (globais): drawLogo(c,S,nome,est,cor,sub,simbolo) e desenharIcone(c,id,cx,cy,tam,cor,esp).
   Carregar DEPOIS de marca.js: esta versão substitui a antiga.
   Tudo aqui usa o prefixo _lg para não colidir com marca.js. Sem estado global, sem animação. */

var _LG_PLAY = '"Playfair Display", Georgia, serif';
var _LG_BAR = '"Barlow", "Helvetica Neue", Arial, sans-serif';
var _LG_COND = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
var _LG_CAP = 0.7; // altura das maiúsculas / corpo, nas três famílias
var _LG_LIG = { DO: 1, DA: 1, DE: 1, DOS: 1, DAS: 1, E: 1, "&": 1, O: 1, A: 1, OS: 1, AS: 1 };
var _LG_GEN = /^(BARBEARIA|BARBER|BARBERSHOP|SALÃO|SALAO|STUDIO|ESTÚDIO|ESTUDIO)$/;
var _LG_GENSUB = /^(BARBEARIA|BARBER ?SHOP|BARBER|SALÃO|SALAO|STUDIO|ESTÚDIO|ESTUDIO)$/;
var _LG_SIMB = { navalha: 1, tesoura: 1, poste: 1, bigode: 1, pente: 1, cruzado: 1, nenhum: 1 };
var _LG_LS = typeof CanvasRenderingContext2D !== "undefined" && "letterSpacing" in CanvasRenderingContext2D.prototype;

/* ---------------- texto ---------------- */
// largura visual (sem o espaço que o letterSpacing deixa depois da última letra)
function _lgW(c, s, size, fam, wt, tr) {
  c.font = wt + " " + size + "px " + fam;
  var px = tr * size, w;
  if (_LG_LS) { c.letterSpacing = px + "px"; w = c.measureText(s).width - px; c.letterSpacing = "0px"; }
  else { w = 0; var a = Array.from(s); a.forEach(function (ch) { w += c.measureText(ch).width; }); w += px * (a.length - 1); }
  return Math.max(0, w);
}
// desenha na linha de base y; align: "c" centro, "l" esquerda em x
function _lgT(c, s, x, y, size, fam, wt, tr, fill, align) {
  var w = _lgW(c, s, size, fam, wt, tr), x0 = align === "l" ? x : x - w / 2, px = tr * size;
  c.fillStyle = fill; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.font = wt + " " + size + "px " + fam;
  if (_LG_LS) { c.letterSpacing = px + "px"; c.fillText(s, x0, y); c.letterSpacing = "0px"; }
  else { var cx = x0; Array.from(s).forEach(function (ch) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + px; }); }
  return w;
}

/* ---------------- nome: normaliza, separa descritor, palavras de ligação, iniciais ---------------- */
function _lgParse(nome, sub) {
  var raw = String(nome == null ? "" : nome).replace(/\s+/g, " ").trim().toLocaleUpperCase("pt-BR");
  if (!raw) raw = "SUA MARCA";
  var tk = raw.split(" "), n0 = 0, prefix = "", rest = tk;
  if (tk.length > 1 && _LG_GEN.test(tk[0])) {
    n0 = tk[0] === "BARBER" && tk[1] === "SHOP" ? 2 : 1;
    rest = tk.slice(n0);
  }
  function temForte(a) { return a.some(function (t) { return !_LG_LIG[t]; }); }
  if (n0 && temForte(rest)) prefix = tk.slice(0, n0).join(" "); else rest = tk;
  var allow = temForte(rest);
  var hero = rest.map(function (t) { return { s: t, lig: allow && !!_LG_LIG[t] }; });
  var s = String(sub == null ? "" : sub).replace(/\s+/g, " ").trim().toLocaleUpperCase("pt-BR");
  var generico = !s || _LG_GENSUB.test(s);
  var desc = prefix || (generico ? s || "BARBEARIA" : "BARBEARIA");
  var base = generico ? "" : s;
  var letters = hero.map(function (t) { return t.s; }).join("").replace(/[\s&]/g, "");
  var fortes = hero.filter(function (t) { return !t.lig; }).map(function (t) { return Array.from(t.s); });
  var ini = fortes.length > 1 ? fortes[0][0] + fortes[1][0] : fortes[0].length <= 2 ? fortes[0].join("") : fortes[0][0];
  return { hero: hero, desc: desc, base: base, mono: letters.length > 0 && letters.length <= 2, letters: letters,
    ini: ini, nfortes: fortes.length, full: raw, longo: raw.length > 24 };
}
function _lgSym(simbolo, id) {
  var s = String(simbolo == null ? "" : simbolo).toLowerCase();
  if (!_LG_SIMB[s]) s = "";
  if (id === "classico") return s === "nenhum" ? null : s || "navalha";
  if (id === "emblema") return s === "nenhum" ? null : s || "cruzado";
  return !s || s === "nenhum" ? null : s; // moderno: sem símbolo => monograma
}

/* ---------------- quebra do nome pela LARGURA medida ----------------
   Testa todas as divisões em até maxLines linhas; palavras de ligação podem virar linha própria menor.
   Pontua pelo tamanho final da letra, equilíbrio entre linhas e linha órfã. */
function _lgLayout(c, toks, o) {
  var T = toks, n = toks.length;
  if (n > 10) { T = toks.slice(0, 9).concat([{ s: toks.slice(9).map(function (t) { return t.s; }).join(" "), lig: false }]); n = 10; }
  var cache = {};
  function w100(s, lig) {
    var k = (lig ? "L" : "B") + s;
    if (cache[k] == null) cache[k] = _lgW(c, s, 100, o.fam, o.wt, lig ? o.ligTr : o.tr) / 100;
    return cache[k];
  }
  var best = null, N = 1 << (n - 1);
  for (var m = 0; m < N; m++) {
    var groups = [], cur = [T[0]], i;
    for (i = 1; i < n; i++) { if ((m >> (i - 1)) & 1) { groups.push(cur); cur = [T[i]]; } else cur.push(T[i]); }
    groups.push(cur);
    var k = groups.length;
    if (k > o.maxLines) continue;
    var lines = [], ok = true, prevLig = false;
    for (i = 0; i < k; i++) {
      var isL = groups[i].length === 1 && groups[i][0].lig && k > 1;
      if (isL && (i === k - 1 || prevLig)) { ok = false; break; }
      lines.push({ t: groups[i].map(function (t) { return t.s; }).join(" "), lig: isL });
      prevLig = isL;
    }
    if (!ok) continue;
    var hc = 0, sizeW = 1e9, wmin = 1e9, wmax = 0, nBig = 0, nLig = 0;
    lines.forEach(function (l, j) {
      if (j) hc += l.lig || lines[j - 1].lig ? 0.26 : 0.3;
      hc += _LG_CAP * (l.lig ? o.ligK : 1);
      if (l.lig) { nLig++; return; }
      var w1 = w100(l.t, false);
      sizeW = Math.min(sizeW, o.W / w1); wmin = Math.min(wmin, w1); wmax = Math.max(wmax, w1); nBig++;
    });
    var sz = Math.min(o.max, sizeW, o.H / hc);
    var ratio = nBig > 1 ? wmin / wmax : 1;
    var score = sz * (0.75 + 0.25 * ratio) * (nBig > 1 && ratio < 0.34 ? 0.7 : 1) * (1 - 0.03 * (k - 1)) * (nLig ? 1.05 : 1);
    if (!best || score > best.score) best = { score: score, lines: lines, sz: sz };
  }
  var cursor = 0;
  best.lines.forEach(function (l, j) {
    var size = best.sz * (l.lig ? o.ligK : 1);
    if (j) cursor += (l.lig || best.lines[j - 1].lig ? 0.26 : 0.3) * best.sz;
    cursor += _LG_CAP * size;
    l.size = size; l.by = cursor; l.w = _lgW(c, l.t, size, o.fam, o.wt, l.lig ? o.ligTr : o.tr);
  });
  best.h = cursor;
  return best;
}
// desenha as linhas do layout: ax = x do eixo (centro, ou borda esquerda se align "l"); top = topo das maiúsculas da 1ª linha
function _lgDrawLines(c, L, ax, top, o, fill, ligFill, align) {
  L.lines.forEach(function (l) {
    var x = ax - (align === "l" ? L.sz * 0.03 : 0); // compensa o respiro lateral da letra
    _lgT(c, l.t, x, top + l.by, l.size, o.fam, l.lig ? o.ligWt : o.wt, l.lig ? o.ligTr : o.tr, l.lig ? ligFill : fill, align);
  });
}

/* ---------------- peças gráficas ---------------- */
function _lgChamfer(c, x, y, w, h, k) {
  c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.lineTo(x + w, y + k); c.lineTo(x + w, y + h - k);
  c.lineTo(x + w - k, y + h); c.lineTo(x + k, y + h); c.lineTo(x, y + h - k); c.lineTo(x, y + k); c.closePath();
}
function _lgDiamond(c, x, y, r, fill) {
  c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath();
  c.fillStyle = fill; c.fill();
}
function _lgStar(c, x, y, r, fill) {
  c.beginPath();
  for (var i = 0; i < 10; i++) {
    var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
    c.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  c.closePath(); c.fillStyle = fill; c.fill();
}
function _lgLine(c, x1, y1, x2, y2, w, col) {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = col; c.lineCap = "butt"; c.stroke();
}
// texto em arco; top = true: lê no topo (letras para fora); false: lê embaixo (letras para dentro). Devolve o tamanho usado.
function _lgArc(c, text, cx, cy, rBase, top, size, fam, wt, tr, fill, spanMax) {
  var chars = Array.from(text);
  function total(sz) {
    c.font = wt + " " + sz + "px " + fam;
    var rr = top ? rBase + _LG_CAP * sz / 2 : rBase - _LG_CAP * sz / 2, t = 0;
    chars.forEach(function (ch) { t += c.measureText(ch).width + tr * sz; });
    return (t - tr * sz) / rr;
  }
  var tt = total(size);
  for (var k = 0; k < 3 && tt > spanMax; k++) { size *= spanMax / tt; tt = total(size); }
  var rr = top ? rBase + _LG_CAP * size / 2 : rBase - _LG_CAP * size / 2, a = -tt / 2;
  c.fillStyle = fill; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.font = wt + " " + size + "px " + fam;
  chars.forEach(function (ch) {
    var w = c.measureText(ch).width, ang = a + w / 2 / rr;
    c.save();
    c.translate(cx + rBase * Math.sin(ang), cy + (top ? -1 : 1) * rBase * Math.cos(ang));
    c.rotate(top ? ang : -ang);
    c.fillText(ch, 0, 0); c.restore();
    a += (w + tr * size) / rr;
  });
  return size;
}

/* =================== ÍCONES (coordenadas unitárias, -0.5..0.5) =================== */
function _lgDot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function _lgBez(p, t) {
  var u = 1 - t;
  return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]];
}
var _LG_ICONES = {
  // navalha aberta: lâmina com dorso reto, fio chanfrado e ponta em ângulo; cabo com leve curva, pino e articulação
  navalha: function (c, lw, rot) {
    if (rot == null) { c.scale(1.08, 1.08); rot = -0.44; }
    var halo = c.globalCompositeOperation === "destination-out"; // no modo "respiro" também preenche, para limpar o miolo
    c.rotate(rot);
    c.beginPath(); c.moveTo(0, -0.1); c.lineTo(0.48, -0.1); c.lineTo(0.39, 0.08); c.lineTo(0.09, 0.08);
    c.quadraticCurveTo(0.03, 0.08, 0.0, 0.04); c.closePath();
    if (halo) c.fill();
    c.stroke();
    c.beginPath(); c.moveTo(0.12, 0.03); c.lineTo(0.37, 0.03); c.save(); c.lineWidth = lw * 0.6; c.stroke(); c.restore();
    // cabo: eixo curvo (desce no fim), largura que cresce um pouco
    var ctr = [[-0.03, 0], [-0.2, 0], [-0.36, 0.01], [-0.47, 0.075]], up = [], dn = [], i, N = 20;
    for (i = 0; i <= N; i++) {
      var t = i / N, p = _lgBez(ctr, t), q = _lgBez(ctr, Math.min(1, t + 0.02)), r = _lgBez(ctr, Math.max(0, t - 0.02));
      var dx = q[0] - r[0], dy = q[1] - r[1], L = Math.hypot(dx, dy) || 1, w = 0.058 + 0.014 * t;
      up.push([p[0] + dy / L * w, p[1] - dx / L * w]); dn.push([p[0] - dy / L * w, p[1] + dx / L * w]);
    }
    c.beginPath();
    up.forEach(function (p, j) { j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
    for (i = N; i >= 0; i--) c.lineTo(dn[i][0], dn[i][1]);
    c.closePath();
    if (halo) c.fill();
    c.stroke();
    _lgDot(c, ctr[3][0] + 0.035, ctr[3][1] - 0.012, lw * 0.6);
    _lgDot(c, 0, 0, lw * 1.2);
  },
  // tesoura profissional: lâminas cruzadas, haste e dois anéis
  tesoura: function (c, lw, rot) {
    if (rot) c.rotate(rot);
    var O = [0, -0.07];
    [-1, 1].forEach(function (sx) {
      var tip = [sx * 0.21, -0.5], dx = O[0] - tip[0], dy = O[1] - tip[1], L = Math.hypot(dx, dy);
      var n = [-dy / L * 0.05, dx / L * 0.05]; // normal à lâmina (largura da base)
      c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(O[0] + n[0], O[1] + n[1]); c.lineTo(O[0] - n[0], O[1] - n[1]); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(O[0], O[1]); c.lineTo(-sx * 0.155, 0.185); c.stroke();
      c.beginPath(); c.ellipse(-sx * 0.19, 0.31, 0.115, 0.13, 0, 0, Math.PI * 2); c.stroke();
    });
    _lgDot(c, O[0], O[1], lw * 1.1);
  },
  // poste de barbeiro: cilindro com listras diagonais, tampa e base
  poste: function (c, lw) {
    var x = 0.15, t = -0.33, b = 0.33;
    c.save();
    c.beginPath(); c.rect(-x, t, 2 * x, b - t); c.clip();
    c.beginPath();
    for (var y = -0.62; y < 0.5; y += 0.2) { c.moveTo(-0.2, y + 0.1); c.lineTo(0.2, y - 0.08); c.lineTo(0.2, y + 0.02); c.lineTo(-0.2, y + 0.2); c.closePath(); }
    c.fill(); c.restore();
    c.beginPath(); c.rect(-x, t, 2 * x, b - t); c.stroke();
    c.beginPath(); c.moveTo(-0.19, t); c.lineTo(-0.19, t - 0.07); c.lineTo(0.19, t - 0.07); c.lineTo(0.19, t); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.07, t - 0.07); c.quadraticCurveTo(-0.07, -0.5, 0, -0.5); c.quadraticCurveTo(0.07, -0.5, 0.07, t - 0.07); c.stroke();
    c.beginPath(); c.moveTo(-0.19, b); c.lineTo(-0.19, b + 0.07); c.lineTo(0.19, b + 0.07); c.lineTo(0.19, b); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.12, b + 0.07); c.lineTo(-0.12, 0.5); c.lineTo(0.12, 0.5); c.lineTo(0.12, b + 0.07); c.stroke();
  },
  // bigode de guidão: traço que afina e enrola nas pontas
  bigode: function (c, lw) {
    c.save(); c.translate(0, 0.07);
    [1, -1].forEach(function (sx) {
      var a = [[-0.01, 0], [0.14, -0.01], [0.26, 0.06], [0.36, 0.03]], b = [[0.36, 0.03], [0.44, 0], [0.5, -0.1], [0.45, -0.2]];
      var pts = [], up = [], dn = [], i, N = 36;
      for (i = 0; i <= N; i++) pts.push(_lgBez(i < N / 2 + 0 ? a : b, i < N / 2 ? i / (N / 2) : (i - N / 2) / (N / 2)));
      for (i = 0; i <= N; i++) {
        var p = pts[i], q = pts[Math.min(N, i + 1)], r = pts[Math.max(0, i - 1)], dx = q[0] - r[0], dy = q[1] - r[1], L = Math.hypot(dx, dy) || 1;
        var w = 0.012 + 0.078 * Math.pow(1 - i / N, 1.25);
        up.push([sx * (p[0] + dy / L * w), p[1] - dx / L * w]); dn.push([sx * (p[0] - dy / L * w), p[1] + dx / L * w]);
      }
      c.beginPath();
      up.forEach(function (p, j) { j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
      for (i = N; i >= 0; i--) c.lineTo(dn[i][0], dn[i][1]);
      c.closePath(); c.fill(); c.lineWidth = lw * 0.4; c.stroke();
    });
    c.restore();
  },
  // pente: dorso com sulco, dentes largos de um lado e finos do outro
  pente: function (c, lw) {
    c.translate(0, -0.02);
    c.beginPath(); c.moveTo(-0.4, -0.25); c.lineTo(0.4, -0.25); c.quadraticCurveTo(0.47, -0.25, 0.47, -0.18); c.lineTo(0.47, -0.08);
    c.quadraticCurveTo(0.47, -0.02, 0.4, -0.02); c.lineTo(-0.4, -0.02); c.quadraticCurveTo(-0.47, -0.02, -0.47, -0.08); c.lineTo(-0.47, -0.18);
    c.quadraticCurveTo(-0.47, -0.25, -0.4, -0.25); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.33, -0.135); c.lineTo(0.33, -0.135); c.save(); c.lineWidth = lw * 0.55; c.stroke(); c.restore();
    c.lineWidth = lw * 0.85; c.beginPath();
    [-0.39, -0.27, -0.15, -0.03].forEach(function (x) { c.moveTo(x, 0.0); c.lineTo(x, 0.27); });
    [0.08, 0.165, 0.25, 0.335, 0.42].forEach(function (x) { c.moveTo(x, 0.0); c.lineTo(x, 0.27); });
    c.stroke();
  },
  // navalha + tesoura cruzadas; a navalha ganha um "respiro" que apaga a tesoura embaixo (num canvas à parte, sem furar o fundo)
  cruzado: function (c, lw) {
    var k = 1; try { var m = c.getTransform(); k = Math.max(1, Math.hypot(m.a, m.b)); } catch (e) { /* sem getTransform: 1x */ }
    var px = Math.max(8, Math.ceil(k)), off = null;
    try { off = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(px, px) : document.createElement("canvas"); off.width = px; off.height = px; } catch (e2) { off = null; }
    var g = off && off.getContext("2d"), col = c.strokeStyle;
    if (!g) { c.save(); c.scale(0.9, 0.9); _LG_ICONES.tesoura(c, lw, -0.785); c.restore(); return; }
    g.scale(px, px); g.translate(0.5, 0.5);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw;
    // duas navalhas em X de brasão (lâminas para cima, cabos para baixo); a da frente apaga um respiro na de trás
    function par(front, mirror) {
      g.save(); g.translate(0, -0.08); if (mirror) g.scale(-1, 1);
      g.scale(0.92, 0.92); g.rotate(0); g.translate(0, 0);
      g.save(); g.rotate(-0.96); g.translate(-0.1, 0);
      if (front) { g.save(); g.globalCompositeOperation = "destination-out"; g.lineWidth = lw * 2.8; _LG_ICONES.navalha(g, lw * 0.1, 0); g.restore(); }
      _LG_ICONES.navalha(g, lw, 0); g.restore(); g.restore();
    }
    par(false, true); par(true, false);
    c.drawImage(off, -0.5, -0.5, 1, 1);
  }
};
// desenha um símbolo de barbearia com paths; tam = lado da caixa, esp = espessura do traço
function desenharIcone(c, id, cx, cy, tam, cor, esp) {
  var f = _LG_ICONES[id]; if (!f || !(tam > 0)) return;
  var lw = (esp > 0 ? esp : tam * 0.06) / tam;
  c.save(); c.translate(cx, cy); c.scale(tam, tam);
  c.lineWidth = lw; c.lineJoin = "round"; c.lineCap = "round"; c.strokeStyle = cor; c.fillStyle = cor;
  f(c, lw);
  c.restore();
}

/* =================== CLÁSSICO =================== */
function _lgClassico(c, S, P, est, K, sym) {
  var u = S / 96, cx = S / 2, fam = est.css || _LG_PLAY;
  var lwF = Math.max(1, S * 0.006), lwH = Math.max(0.75, S * 0.0026);
  // moldura dupla com cantos chanfrados
  c.strokeStyle = K.ring; c.lineWidth = lwF; _lgChamfer(c, 6 * u, 6 * u, S - 12 * u, S - 12 * u, 3.4 * u); c.stroke();
  if (S >= 80) { c.lineWidth = lwH; _lgChamfer(c, 8.6 * u, 8.6 * u, S - 17.2 * u, S - 17.2 * u, 2.2 * u); c.stroke(); }
  var X0 = 14 * u, W = 68 * u, AH = 68 * u;
  // selo do topo e linha de baixo (apoio)
  var dsz = 4.4 * u, bsz = 4.2 * u, showD = dsz >= 5.5, showB = !!P.base && bsz >= 5.5;
  var dw = _lgW(c, P.desc, dsz, _LG_BAR, 600, 0.28);
  if (dw > W * 0.6) { dsz *= W * 0.6 / dw; dw = W * 0.6; }
  if (showB) { var bw = _lgW(c, P.base, bsz, _LG_BAR, 600, 0.3); if (bw > W) bsz *= W / bw; }
  var capD = _LG_CAP * dsz, capB = _LG_CAP * bsz;
  var gap = 5 * u, gDiv = 4 * u, hDiv = 3 * u;
  var fixed = (showD ? capD + gap : 0) + (sym ? gap : 0) + gDiv + hDiv + (showB ? gDiv + capB : 0);
  var symMin = sym ? (P.mono ? 10 * u : 13 * u) : 0;
  var o = { fam: fam, wt: 700, tr: P.mono ? 0.12 : P.longo ? 0 : 0.02, ligTr: 0.22, ligWt: 700, ligK: 0.42, W: W,
    H: AH - fixed - symMin, max: P.mono ? 30 * u : (P.letters.length <= 8 ? 21 : 17) * u, maxLines: 3 };
  var toks = P.mono ? [{ s: P.letters, lig: false }] : P.hero;
  var L = _lgLayout(c, toks, o);
  if (P.mono) L.h += L.sz * 0.12; // o J desce abaixo da linha de base
  var symH = sym ? symMin + Math.min(Math.max(0, AH - fixed - L.h - symMin) * 0.7, 9 * u) : 0;
  var y = 14 * u + (AH - (fixed + L.h + symH)) / 2;
  if (showD) {
    var by = y + capD, my = y + capD / 2, gp = 3.2 * u;
    _lgT(c, P.desc, cx, by, dsz, _LG_BAR, 600, 0.28, K.sub, "c");
    _lgLine(c, X0, my, cx - dw / 2 - gp, my, lwH * 1.3, K.ring); _lgLine(c, cx + dw / 2 + gp, my, X0 + W, my, lwH * 1.3, K.ring);
    _lgDiamond(c, X0, my, 1.2 * u, K.ring); _lgDiamond(c, X0 + W, my, 1.2 * u, K.ring);
    y += capD + gap;
  }
  if (sym) { desenharIcone(c, sym, cx, y + symH / 2, symH, K.ring, Math.max(1.2, symH * 0.055)); y += symH + gap; }
  _lgDrawLines(c, L, cx, y, o, K.text, K.text, "c");
  y += L.h + gDiv;
  // divisor: filete duplo + losango
  var dy = y + hDiv / 2, r = 1.8 * u;
  _lgDiamond(c, cx, dy, r, K.ring);
  [-1, 1].forEach(function (s) {
    _lgLine(c, cx + s * (r + 3 * u), dy - 0.9 * u, cx + s * (r + 17 * u), dy - 0.9 * u, lwH * 1.3, K.ring);
    _lgLine(c, cx + s * (r + 3 * u), dy + 0.9 * u, cx + s * (r + 12 * u), dy + 0.9 * u, lwH * 1.3, K.ring);
    _lgDiamond(c, cx + s * (r + 20 * u), dy - 0.9 * u, 0.8 * u, K.ring);
  });
  y += hDiv;
  if (showB) _lgT(c, P.base, cx, y + gDiv + capB, bsz, _LG_BAR, 600, 0.3, K.sub, "c");
}

/* =================== MODERNO =================== */
function _lgModerno(c, S, P, est, K, sym) {
  if (!sym && !P.mono && P.nfortes < 2) sym = "navalha"; // uma palavra forte só: o bloco leva o símbolo, não repete o nome
  var u = S / 96, fam = est.css || _LG_COND, X0 = 8 * u, W = 80 * u;
  var lwH = Math.max(1, S * 0.0032), lwT = Math.max(2, S * 0.011);
  var B = (P.mono ? 46 : 28) * u, x1 = X0 + B + 5 * u, Wr = X0 + W - x1;
  var dsz = 6.2 * u, bsz = 5.6 * u, showB = !!P.base;
  var dw = _lgW(c, P.desc, dsz, fam, 600, 0.26);
  if (dw > Wr * 0.95) dsz *= Wr * 0.95 / dw;
  if (showB) { var bw = _lgW(c, P.base, bsz, fam, 600, 0.26); if (bw > Wr * 0.95) bsz *= Wr * 0.95 / bw; }
  var gapN = 7 * u, gapF = 6 * u;
  var o = { fam: fam, wt: 700, tr: P.longo ? 0 : 0.015, ligTr: 0.2, ligWt: 600, ligK: 0.45, W: W,
    H: 82 * u - B - gapN - gapF - lwH, max: 30 * u, maxLines: 3 };
  var L = P.mono ? { h: 0, lines: [] } : _lgLayout(c, P.hero, o);
  var total = B + (P.mono ? 0 : gapN + L.h + gapF + lwH);
  var y0 = Math.max(6 * u, (S - total) / 2);
  // bloco sólido com símbolo/monograma recortado (offscreen, para não furar o fundo do chamador)
  var k = 1; try { var m = c.getTransform(); k = Math.max(1, Math.hypot(m.a, m.b)); } catch (e) { /* sem getTransform: 1x */ }
  var px = Math.max(1, Math.ceil(B * k)), off = null;
  try { off = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(px, px) : document.createElement("canvas"); off.width = px; off.height = px; } catch (e2) { off = null; }
  var g = off && off.getContext("2d");
  if (g) {
    var q = px / B;
    g.fillStyle = K.ring; g.fillRect(0, 0, px, px);
    g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000"; g.strokeStyle = "#000"; g.lineJoin = "round"; g.lineCap = "round";
    if (sym) { var t = B * 0.64 * q; desenharIcone(g, sym, px / 2, px / 2, t, "#000", t * 0.085); }
    else {
      var ini = P.ini, f = Math.min(B * 0.8 * q / (_lgW(g, ini, 100, fam, 700, 0.02) / 100), B * 0.74 * q / _LG_CAP * 0.82);
      var w = _lgW(g, ini, f, fam, 700, 0.02);
      _lgT(g, ini, px / 2, px / 2 + _LG_CAP * f / 2, f, fam, 700, 0.02, "#000", "c"); void w;
    }
    c.drawImage(off, X0, y0, B, B);
  } else { c.fillStyle = K.ring; c.fillRect(X0, y0, B, B); }
  // coluna ao lado do bloco: filete grosso+fino no topo, descritor e linha de baixo
  _lgLine(c, x1, y0 + lwT / 2, x1 + 10 * u, y0 + lwT / 2, lwT, K.ring);
  _lgLine(c, x1 + 10 * u, y0 + lwH / 2, X0 + W, y0 + lwH / 2, lwH, K.ring);
  var capD = _LG_CAP * dsz;
  if (showB) {
    _lgT(c, P.desc, x1, y0 + 5 * u + capD, dsz, fam, 600, 0.26, K.sub, "l");
    _lgT(c, P.base, x1, y0 + B, bsz, fam, 600, 0.26, K.text, "l");
  } else _lgT(c, P.desc, x1, y0 + B, dsz, fam, 600, 0.26, K.sub, "l");
  if (P.mono) return;
  var ny = y0 + B + gapN;
  _lgDrawLines(c, L, X0, ny, o, K.text, K.sub, "l");
  _lgLine(c, X0, ny + L.h + gapF + lwH / 2, X0 + W, ny + L.h + gapF + lwH / 2, lwH, K.ring);
}

/* =================== EMBLEMA =================== */
function _lgEmblema(c, S, P, est, K, sym) {
  var u = S / 96, fam = est.css || _LG_COND, cx = S / 2, cy = S / 2, tiny = S < 80;
  var R = 0.44 * S, rOut = R - 0.052 * S, rIn = R - 0.14 * S, band = rOut - rIn;
  var lwA = Math.max(1.5, S * 0.02), lwB = Math.max(1, S * 0.0055), lwC = Math.max(0.75, S * 0.003);
  c.strokeStyle = K.ring;
  c.lineWidth = lwA; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  if (!tiny) {
    c.fillStyle = K.ring;
    var n = 96, dr = Math.max(0.6, S * 0.0034);
    for (var i = 0; i < n; i++) { var a = i * 2 * Math.PI / n; _lgDot(c, cx + (R - 0.03 * S) * Math.cos(a), cy + (R - 0.03 * S) * Math.sin(a), dr); }
    c.lineWidth = lwC; c.beginPath(); c.arc(cx, cy, rOut, 0, Math.PI * 2); c.stroke();
  }
  c.lineWidth = lwB; c.beginPath(); c.arc(cx, cy, rIn, 0, Math.PI * 2); c.stroke();
  // textos em arco: nome em cima, apoio embaixo (monograma: o arco de cima leva o descritor)
  var topTxt = P.mono ? P.desc : P.hero[0].lig && P.desc !== "BARBEARIA" ? P.full : P.hero[0].lig ? P.full : P.hero.map(function (t) { return t.s; }).join(" ");
  var botTxt = P.base || (P.mono || topTxt.indexOf(P.desc) >= 0 ? "" : P.desc);
  var tsz = 0.078 * S, span = 2.7, pad = (band - _LG_CAP * tsz) / 2;
  if (!tiny) {
    var tr = P.longo ? 0.02 : 0.1;
    _lgArc(c, topTxt, cx, cy, rIn + pad, true, tsz, fam, 700, tr, K.text, span);
    if (botTxt) _lgArc(c, botTxt, cx, cy, rOut - pad, false, tsz * 0.82, fam, 600, 0.22, K.sub, span);
    else { var rm = (rIn + rOut) / 2; [-0.16, 0, 0.16].forEach(function (a) { _lgStar(c, cx + rm * Math.sin(a), cy + rm * Math.cos(a), S * 0.017, K.ring); }); }
    var rmid = (rIn + rOut) / 2;
    [-1, 1].forEach(function (s) { _lgStar(c, cx + s * rmid, cy, S * 0.022, K.ring); });
  }
  // centro: símbolo grande + faixa com iniciais
  var Wb = 0.44 * S, hb = 0.072 * S, ry = cy + 0.15 * S;
  if (sym) {
    var ts = tiny ? 0.5 * S : 0.33 * S;
    desenharIcone(c, sym, cx, tiny ? cy : cy - 0.07 * S, ts, K.text, Math.max(1.2, ts * 0.06));
    if (!tiny) {
      var nb = Math.min(hb * 0.45, S * 0.018);
      c.beginPath(); c.moveTo(cx - Wb / 2, ry - hb / 2); c.lineTo(cx + Wb / 2, ry - hb / 2); c.lineTo(cx + Wb / 2 - nb * 1.4, ry); c.lineTo(cx + Wb / 2, ry + hb / 2);
      c.lineTo(cx - Wb / 2, ry + hb / 2); c.lineTo(cx - Wb / 2 + nb * 1.4, ry); c.closePath();
      c.lineWidth = lwB; c.strokeStyle = K.ring; c.stroke();
      var isz = hb * 0.66 / _LG_CAP * (P.mono ? 1.15 : 1);
      var iw = _lgW(c, P.ini, isz, fam, 700, 0.3);
      if (iw > Wb * 0.7) isz *= Wb * 0.7 / iw;
      _lgT(c, P.ini, cx, ry + _LG_CAP * isz / 2, isz, fam, 700, 0.3, K.text, "c");
    }
  } else {
    var fs = rIn * 1.0, fw = _lgW(c, P.ini, 100, fam, 700, 0.04) / 100;
    fs = Math.min(fs, rIn * 1.5 / fw);
    _lgT(c, P.ini, cx, cy + _LG_CAP * fs / 2, fs, fam, 700, 0.04, K.text, "c");
  }
}

/* =================== API =================== */
// desenha num quadrado S×S (origem 0,0), fundo transparente, margem de segurança ~6%
function drawLogo(c, S, nome, est, cor, sub, simbolo) {
  est = est || {};
  var id = est.id === "moderno" || est.id === "emblema" ? est.id : "classico";
  cor = cor || {};
  var K = { text: cor.text || "#fff", ring: cor.ring || cor.text || "#fff", sub: cor.sub || cor.ring || cor.text || "#fff" };
  var P = _lgParse(nome, sub), sym = _lgSym(simbolo, id);
  c.save();
  c.textBaseline = "alphabetic"; c.textAlign = "left"; c.lineJoin = "round"; c.lineCap = "round";
  if (_LG_LS) c.letterSpacing = "0px";
  (id === "moderno" ? _lgModerno : id === "emblema" ? _lgEmblema : _lgClassico)(c, S, P, est, K, sym);
  c.restore();
}
