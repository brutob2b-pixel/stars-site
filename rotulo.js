/* RotuloKit: tarja, tampa e pote de pomada (vista frontal levemente de cima) gerados pela marca.
   Depende de marca.js (TEMAS, LOGOS, POMADAS, MARCA, escHTML, iniciais, drawLogo, corEscura).
   Medidas oficiais: pote Ø89,1 mm; corpo 22 mm; tampa 19 mm; tarja 190x17 mm (cobre ~68% da volta). */
const RotuloKit = (() => {
  const D_MM = 89.1, CORPO_MM = 22, TAMPA_MM = 19, TARJA_L = 190, TARJA_A = 17;
  const MARGEM_V = (CORPO_MM - TARJA_A) / 2;          // 2,5 mm em cima e embaixo
  const ELEV = 0.30, COS_E = Math.sqrt(1 - ELEV * ELEV); // eixo menor / maior da elipse (câmera ~17,5° acima)
  const SS = 1;                                        // supersampling do pote (suaviza as pontas do cilindro)
  const FAM = { legal: '"Barlow", "Helvetica Neue", Arial, sans-serif', cond: '"Barlow Condensed", "Arial Narrow", sans-serif' };
  const FRAG = { pasta: "Amadeirada suave", argila: "Cítrica e amadeirada", gel: "Clássica de barbearia",
    molhado: "Fresca, notas marinhas", fibra: "Cedro e especiarias", cera: "Âmbar e couro" };
  const PI = Math.PI;

  /* ---------- utilidades ---------- */
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const hex = h => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(x => x + x).join(""); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const lum = h => { const [r, g, b] = hex(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function fontesOk() {
    try {
      const f = document.fonts;
      if (!f) return true;
      const q = ['700 20px "Playfair Display"', '600 20px "Barlow"', '700 20px "Barlow Condensed"'];
      q.forEach(s => f.load(s).catch(() => {})); // pede as fontes; a página chama de novo quando chegarem
      return f.status === "loaded" || q.every(s => f.check(s));
    } catch { return true; }
  }

  function info(m, pomada) {
    const pom = typeof pomada === "string" ? POMADAS.find(p => p.id === pomada) : pomada;
    return { nome: MARCA.nome(m), tema: MARCA.tema(m), logo: MARCA.logo(m), pom: pom || MARCA.pomada(m),
      sub: (m.cidade || "BARBEARIA"), simbolo: m.simbolo };
  }
  const chaveArte = (tipo, I, tam) => [tipo, I.nome, I.tema.id, I.logo.id, I.pom.id, I.simbolo || "", I.sub, tam].join("|");

  const cacheArte = new Map(), cacheSvg = new Map();
  function lembrar(cache, chave, fazer, max, valido) {
    if (cache.has(chave)) return cache.get(chave);
    const v = fazer();
    if (valido) { cache.set(chave, v); if (cache.size > max) cache.delete(cache.keys().next().value); }
    return v;
  }

  /* ---------- TARJA (arte plana 190x17 mm) ---------- */
  function desenharTarja(m, pomada, w) {
    const I = info(m, pomada), t = I.tema, h = Math.round(w * TARJA_A / TARJA_L), cv = mk(w, h), c = cv.getContext("2d");
    const u = w / TARJA_L, X = s => w / 2 + s * u, escuro = lum(t.bg1) < 0.5;
    const H = (s, sx, y, sz, o = {}) => { // texto: s, x (mm do centro), baseline y (mm), tamanho (mm)
      const { fam = FAM.legal, wt = 400, cor = t.sub, al = "center", tr = 0, maxW } = o;
      c.font = `${wt} ${sz * u}px ${fam}`; c.letterSpacing = `${tr * sz * u}px`;
      c.fillStyle = cor; c.textAlign = al; c.textBaseline = "alphabetic";
      c.fillText(s, X(sx) + (al === "center" ? tr * sz * u / 2 : 0), y * u, maxW ? maxW * u : undefined);
    };
    const larg = (s, sz, fam, wt, tr) => { c.font = `${wt} ${sz * u}px ${fam}`; c.letterSpacing = `${tr * sz * u}px`; return c.measureText(s).width / u; };
    const linha = (x0, x1, y, esp, cor = t.ring, a = 1) => { c.globalAlpha = a; c.fillStyle = cor; c.fillRect(X(x0), (y - esp / 2) * u, (x1 - x0) * u, esp * u); c.globalAlpha = 1; };
    const losango = (sx, y, r, cor = t.ring) => { c.fillStyle = cor; c.beginPath(); c.moveTo(X(sx), (y - r) * u); c.lineTo(X(sx + r), y * u); c.lineTo(X(sx), (y + r) * u); c.lineTo(X(sx - r), y * u); c.fill(); };

    // fundo: gradiente do tema + leve escurecimento nas pontas (dá volume quando enrola)
    let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    g = c.createLinearGradient(0, 0, w, 0);
    const ve = escuro ? 0.28 : 0.12; g.addColorStop(0, `rgba(0,0,0,${ve})`); g.addColorStop(0.2, "rgba(0,0,0,0)"); g.addColorStop(0.8, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${ve})`);
    c.fillStyle = g; c.fillRect(0, 0, w, h);

    // filetes duplos (margem de segurança 1,5 mm)
    linha(-93.5, 93.5, 1.7, 0.4); linha(-93.5, 93.5, 2.4, 0.15, t.ring, 0.8);
    linha(-93.5, 93.5, 15.3, 0.4); linha(-93.5, 93.5, 14.6, 0.15, t.ring, 0.8);

    // NOME (centro): 1 linha, ou 2 se ficar pequeno demais
    const nm = I.nome.toUpperCase(), fam = I.logo.css, tr = I.logo.id === "classico" ? 0.04 : 0.08, LARG_NOME = 60;
    const wN = (s, sz) => larg(s, sz, fam, 700, tr);
    let linhas = [nm], sz = Math.min(7.9, 7.9 * LARG_NOME / wN(nm, 7.9));
    if (sz < 4.8 && nm.includes(" ")) {
      const pal = nm.split(" "); let best = null;
      for (let k = 1; k < pal.length; k++) {
        const ls = [pal.slice(0, k).join(" "), pal.slice(k).join(" ")], mx = Math.max(...ls.map(l => wN(l, 10)));
        if (!best || mx < best.mx) best = { ls, mx };
      }
      const sz2 = Math.min(4.3, 10 * LARG_NOME / best.mx);
      if (sz2 > sz) { linhas = best.ls; sz = sz2; }
    }
    const cap = 0.7 * sz, gap = 0.4 * cap, n = linhas.length, blocoH = n * cap + (n - 1) * gap, cy = n > 1 ? 6.8 : 6.9;
    const topo = cy - blocoH / 2;
    const gn = c.createLinearGradient(0, topo * u, 0, (topo + blocoH) * u);
    if (escuro) { gn.addColorStop(0, mix(t.text, "#ffffff", 0.32)); gn.addColorStop(0.55, t.text); gn.addColorStop(1, mix(t.text, "#000000", 0.14)); }
    else { gn.addColorStop(0, t.text); gn.addColorStop(1, t.text); }
    linhas.forEach((l, i) => H(l, 0, topo + cap * (i + 1) + gap * i, sz, { fam, wt: 700, cor: gn, tr }));

    // descritor + gramatura (tracking largo) numa linha só
    let dz = 2.3; const rot = I.pom.rotulo, gr = "150 g", sep = 3.4;
    const wd = s => larg(s, dz, FAM.legal, 600, 0.3);
    let tot = wd(rot) + sep + wd(gr); if (tot > 58) { dz = Math.max(1.95, dz * 58 / tot); tot = wd(rot) + sep + wd(gr); }
    const x0 = -tot / 2, yD = 13.0;
    H(rot, x0, yD, dz, { wt: 600, cor: t.text, al: "left", tr: 0.3 });
    losango(x0 + wd(rot) + sep / 2 - 0.15, yD - 0.6 * dz * 0.7, 0.55);
    H(gr, x0 + wd(rot) + sep, yD, dz, { wt: 600, cor: t.sub, al: "left", tr: 0.3 });

    // lateral dos blocos centrais
    for (const sg of [-1, 1]) linha(sg * 32.5 - 0.08, sg * 32.5 + 0.08, 8.5, 8.4, t.ring, 0.55);

    // monograma (esquerda)
    const mx = -41.5, my = 8.5;
    c.strokeStyle = t.ring; c.lineWidth = 0.35 * u; c.beginPath(); c.arc(X(mx), my * u, 5.5 * u, 0, 7); c.stroke();
    c.lineWidth = 0.14 * u; c.beginPath(); c.arc(X(mx), my * u, 4.75 * u, 0, 7); c.stroke();
    c.globalAlpha = 0.1; c.fillStyle = t.ring; c.beginPath(); c.arc(X(mx), my * u, 4.7 * u, 0, 7); c.fill(); c.globalAlpha = 1;
    const ini = iniciais(I.nome); let isz = 4.6;
    isz = Math.min(isz, isz * 6.6 / larg(ini, isz, fam, 700, 0.02));
    H(ini, mx, my + 0.7 * isz / 2, isz, { fam, wt: 700, cor: t.text, tr: 0.02 });

    // fixação / brilho (direita)
    const fx = 41.5, pontos = (y, v) => { for (let i = 0; i < 5; i++) {
      const px = X(fx + (i - 2) * 2.0), py = y * u; c.beginPath(); c.arc(px, py, 0.62 * u, 0, 7);
      if (i < v) { c.fillStyle = t.ring; c.fill(); } else { c.strokeStyle = rgba(t.ring, 0.55); c.lineWidth = 0.14 * u; c.stroke(); } } };
    H("FIXAÇÃO", fx, 6.2, 2.2, { wt: 600, cor: t.sub, tr: 0.22 }); pontos(8.1, I.pom.fix);
    H("BRILHO", fx, 11.0, 2.2, { wt: 600, cor: t.sub, tr: 0.22 }); pontos(12.8, I.pom.brilho);

    // ornamentos
    for (const sg of [-1, 1]) {
      const a = sg * 53.5; linha(Math.min(sg * 49.5, sg * 52), Math.max(sg * 49.5, sg * 52), 8.5, 0.18); linha(Math.min(sg * 55, sg * 57.5), Math.max(sg * 55, sg * 57.5), 8.5, 0.18);
      losango(a, 8.5, 1.15); losango(a, 5.2, 0.45); losango(a, 11.8, 0.45);
    }

    // texto legal e fragrância
    const leg = ["Pomada capilar profissional.", "Uso externo. Evite os olhos.", "Lote e validade no fundo.", "Indústria brasileira."];
    leg.forEach((l, i) => H(l, -84, [5.3, 8.1, 10.9, 13.5][i], 2.2, { al: "left", maxW: 25, cor: t.sub }));
    H("FRAGRÂNCIA", 59, 5.3, 2.2, { al: "left", wt: 600, tr: 0.2, cor: t.text, maxW: 25 });
    H(FRAG[I.pom.id] || "Clássica", 59, 8.1, 2.2, { al: "left", maxW: 25 });
    H("Aplique em cabelo seco", 59, 10.9, 2.2, { al: "left", maxW: 25 });
    H("ou levemente úmido.", 59, 13.5, 2.2, { al: "left", maxW: 25 });
    return cv;
  }

  /* ---------- TAMPA (disco Ø89,1 inscrito) ---------- */
  function desenharTampa(m, pomada, s) {
    const I = info(m, pomada), t = I.tema, cv = mk(s, s), c = cv.getContext("2d"), R = s / 2;
    c.save(); c.beginPath(); c.arc(R, R, R, 0, 7); c.clip();
    const g = c.createRadialGradient(R, R * 0.75, R * 0.05, R, R, R * 1.05); g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2);
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    c.strokeStyle = t.ring;
    c.lineWidth = 0.026 * R; c.beginPath(); c.arc(R, R, 0.945 * R, 0, 7); c.stroke();
    c.lineWidth = 0.008 * R; c.beginPath(); c.arc(R, R, 0.9 * R, 0, 7); c.stroke();
    c.fillStyle = t.ring; c.globalAlpha = 0.85;
    for (let i = 0; i < 120; i++) { const a = i / 120 * 2 * PI; c.beginPath(); c.arc(R + 0.865 * R * Math.cos(a), R + 0.865 * R * Math.sin(a), (i % 5 ? 0.0055 : 0.009) * R, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    // logotipo: ~62% do diâmetro, levemente acima do centro para abrir espaço ao descritor
    const S = 0.62 * s; c.save(); c.translate(R - S / 2, R - S / 2 - 0.03 * s);
    drawLogo(c, S, I.nome, I.logo, corEscura(t), I.sub, I.simbolo); c.restore();
    // descritor em arco embaixo (dentro do círculo de segurança 0,83R)
    const txt = `•  ${I.pom.rotulo}  •`, rb = 0.775 * R, sz = 0.07 * R, gap = 0.2 * sz;
    c.font = `600 ${sz}px ${FAM.legal}`; c.fillStyle = t.text; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.letterSpacing = "0px";
    let ch = [...txt], ws = ch.map(x => (c.measureText(x).width + gap) / rb), tot = ws.reduce((a, b) => a + b, 0);
    if (tot > 1.9) { const f = 1.9 / tot; c.font = `600 ${sz * f}px ${FAM.legal}`; ws = ws.map(x => x * f); tot = 1.9; }
    let a = PI / 2 + tot / 2;
    ch.forEach((x, i) => { a -= ws[i] / 2; c.save(); c.translate(R + rb * Math.cos(a), R + rb * Math.sin(a)); c.rotate(a - PI / 2); c.fillText(x, 0, 0); c.restore(); a -= ws[i] / 2; });
    c.restore();
    return cv;
  }

  /* ---------- POTE ---------- */
  const lateral = (c, cx, y0, h, R, ry) => { // lateral visível de um cilindro: de y0 (arco frontal de cima) a y0+h (arco frontal de baixo)
    c.beginPath(); c.moveTo(cx - R, y0); c.ellipse(cx, y0, R, ry, 0, PI, 0, true);
    c.lineTo(cx + R, y0 + h); c.ellipse(cx, y0 + h, R, ry, 0, 0, PI, false); c.closePath();
  };
  const arco = (c, cx, y, R, ry) => { c.beginPath(); c.ellipse(cx, y, R, ry, 0, 0, PI, false); };

  // luz cilíndrica (de cima à esquerda) + faixa de reflexo vertical (clearcoat)
  function luz(c, cx, R, y0, y1, spec) {
    const gd = c.createLinearGradient(cx - R, 0, cx + R, 0), gl = c.createLinearGradient(cx - R, 0, cx + R, 0), L = [-0.52, 0.855];
    for (let i = 0; i <= 40; i++) {
      const f = i / 40, dx = -1 + 2 * f, nz = Math.sqrt(Math.max(0, 1 - dx * dx)), dif = clamp(dx * L[0] + nz * L[1], 0, 1);
      gd.addColorStop(f, `rgba(0,0,0,${(0.6 * Math.pow(1 - dif, 1.3)).toFixed(3)})`);
      const faixa = spec * Math.exp(-(((dx + 0.4) / 0.075) ** 2)) + spec * 0.4 * Math.exp(-(((dx + 0.2) / 0.22) ** 2)) + spec * 0.55 * Math.exp(-(((dx - 0.86) / 0.05) ** 2));
      gl.addColorStop(f, `rgba(255,255,255,${clamp(faixa + 0.07 * dif, 0, 1).toFixed(3)})`);
    }
    c.fillStyle = gd; c.fillRect(cx - R, y0, 2 * R, y1 - y0);
    c.fillStyle = gl; c.fillRect(cx - R, y0, 2 * R, y1 - y0);
  }

  function corpo(c, cx, yt, G, tj, giro, aberto) {
    const { R, ry, k, kv, bodyH } = G, yb = yt + bodyH;
    c.save(); lateral(c, cx, yt, bodyH, R, ry); c.clip();
    c.fillStyle = "#19181b"; c.fillRect(cx - R, yt, 2 * R, bodyH + ry + 1);
    const tw = tj.width, th = tj.height, Rmm = D_MM / 2, ppm = tw / TARJA_L;
    for (let x = Math.ceil(cx - R); x < cx + R; x++) {
      const dx = (x + 0.5 - cx) / R, cosT = Math.sqrt(1 - dx * dx); if (cosT < 0.02) continue;
      const s = Rmm * (Math.asin(dx) - giro), u = TARJA_L / 2 + s;           // posição na tarja (mm): proporcional ao ângulo
      if (u < 0 || u > TARJA_L) continue;                                   // fora da tarja: corpo liso
      const sw = clamp(Rmm / (R * cosT) * ppm, 1, 48), sx = clamp(u * ppm - sw / 2, 0, tw - sw);
      c.drawImage(tj, sx, 0, sw, th, x, yt + ry * cosT + MARGEM_V * kv, 1, TARJA_A * kv);
    }
    // sombra da tampa no topo do corpo e escurecimento junto ao chão (seguem a curvatura)
    c.lineCap = "butt";
    for (let i = 0; i < 8; i++) { c.strokeStyle = `rgba(0,0,0,${(0.5 * Math.pow(1 - i / 8, 2)).toFixed(3)})`; c.lineWidth = 0.55 * k; arco(c, cx, yt + (i + 0.5) * 0.5 * k, R, ry); c.stroke(); }
    for (let i = 0; i < 8; i++) { c.strokeStyle = `rgba(0,0,0,${(0.3 * Math.pow(1 - i / 8, 2)).toFixed(3)})`; c.lineWidth = 0.55 * k; arco(c, cx, yb - (i + 0.5) * 0.5 * k, R, ry); c.stroke(); }
    luz(c, cx, R, yt, yb + ry + 1, 0.16);
    c.restore();
  }

  function tampa(c, cx, yl, G, tp) {
    const { R, ry, k, lidH } = G;
    c.save(); lateral(c, cx, yl, lidH, R, ry); c.clip();
    c.fillStyle = "#151417"; c.fillRect(cx - R, yl, 2 * R, lidH + ry + 1);
    const N = 64; // serrilhado vertical da lateral
    for (let i = 0; i < N; i++) {
      const th = -PI / 2 + (i + 0.5) * PI / N, x = cx + R * Math.sin(th), e = ry * Math.cos(th), a = Math.cos(th);
      c.strokeStyle = `rgba(0,0,0,${0.35 * a})`; c.lineWidth = 0.5 * k * Math.max(0.3, a); c.beginPath(); c.moveTo(x, yl + e); c.lineTo(x, yl + lidH + e); c.stroke();
      c.strokeStyle = `rgba(255,255,255,${0.07 * a})`; c.beginPath(); c.moveTo(x + 0.45 * k * a, yl + e); c.lineTo(x + 0.45 * k * a, yl + lidH + e); c.stroke();
    }
    for (let i = 0; i < 6; i++) { c.strokeStyle = `rgba(0,0,0,${(0.4 * Math.pow(1 - i / 6, 2)).toFixed(3)})`; c.lineWidth = 0.55 * k; arco(c, cx, yl + lidH - (i + 0.5) * 0.5 * k, R, ry); c.stroke(); }
    luz(c, cx, R, yl, yl + lidH + ry + 1, 0.3);
    c.restore();
    // fresta entre tampa e corpo
    c.strokeStyle = "rgba(0,0,0,0.85)"; c.lineWidth = 0.5 * k; arco(c, cx, yl + lidH, R, ry); c.stroke();
    // topo: rebordo + arte em perspectiva
    const rg = c.createLinearGradient(cx - R, yl - ry, cx + R, yl + ry); rg.addColorStop(0, "#4a484d"); rg.addColorStop(0.5, "#252328"); rg.addColorStop(1, "#38363b");
    c.fillStyle = rg; c.beginPath(); c.ellipse(cx, yl, R, ry, 0, 0, 2 * PI); c.fill();
    const Rr = R * 0.972;
    c.save(); c.translate(cx, yl); c.scale(1, ELEV); c.beginPath(); c.arc(0, 0, Rr, 0, 2 * PI); c.clip();
    c.drawImage(tp, -Rr, -Rr, 2 * Rr, 2 * Rr);
    const gg = c.createLinearGradient(-Rr, -Rr, Rr, Rr); gg.addColorStop(0, "rgba(255,255,255,0.24)"); gg.addColorStop(0.45, "rgba(255,255,255,0)"); gg.addColorStop(1, "rgba(0,0,0,0.2)");
    c.fillStyle = gg; c.fillRect(-Rr, -Rr, 2 * Rr, 2 * Rr); c.restore();
    const bg = c.createLinearGradient(cx - R, yl - ry, cx + R, yl + ry);
    bg.addColorStop(0, "rgba(255,255,255,0.95)"); bg.addColorStop(0.35, "rgba(255,255,255,0.35)"); bg.addColorStop(0.7, "rgba(255,255,255,0.1)"); bg.addColorStop(1, "rgba(255,255,255,0.4)");
    c.strokeStyle = bg; c.lineWidth = 0.9 * k; c.beginPath(); c.ellipse(cx, yl, R * 0.992, ry * 0.992, 0, 0, 2 * PI); c.stroke();
    c.strokeStyle = "rgba(0,0,0,0.55)"; c.lineWidth = 0.35 * k; c.beginPath(); c.ellipse(cx, yl, R * 0.998, ry * 0.998, 0, 0, 2 * PI); c.stroke();
    // brilho do aro na frente da lateral
    const fg = c.createLinearGradient(cx - R, 0, cx + R, 0); fg.addColorStop(0, "rgba(255,255,255,0.05)"); fg.addColorStop(0.3, "rgba(255,255,255,0.4)"); fg.addColorStop(1, "rgba(255,255,255,0.06)");
    c.strokeStyle = fg; c.lineWidth = 0.55 * k; arco(c, cx, yl + 0.35 * k, R * 0.998, ry); c.stroke();
  }

  // massa de pomada (pote aberto): borda do pote + superfície com ondulação
  function massa(c, cx, yt, G, pom) {
    const { R, ry, k, kv } = G, wall = 1.8 * k, Ri = R - wall, ryi = ry * Ri / R, depth = 2.4 * kv;
    const rg = c.createLinearGradient(cx - R, yt - ry, cx + R, yt + ry); rg.addColorStop(0, "#55535a"); rg.addColorStop(0.5, "#2a282d"); rg.addColorStop(1, "#3b393f");
    c.fillStyle = rg; c.beginPath(); c.ellipse(cx, yt, R, ry, 0, 0, 2 * PI); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 0.5 * k; c.beginPath(); c.ellipse(cx, yt, R * 0.992, ry * 0.992, 0, 0, 2 * PI); c.stroke();
    c.save(); c.beginPath(); c.ellipse(cx, yt, Ri, ryi, 0, 0, 2 * PI); c.clip();
    c.fillStyle = "#0b0a0b"; c.fillRect(cx - R, yt - ry, 2 * R, 2 * ry);
    c.translate(cx, yt + depth); c.scale(1, ELEV);
    const cor = pom.cor, relevo = pom.relevo, br = pom.brilho / 5;
    let g = c.createRadialGradient(-0.3 * Ri, -0.35 * Ri, Ri * 0.05, 0, 0, Ri * 1.05);
    g.addColorStop(0, mix(cor, "#ffffff", 0.28)); g.addColorStop(0.55, cor); g.addColorStop(1, mix(cor, "#000000", 0.32));
    c.fillStyle = g; c.fillRect(-Ri, -Ri, 2 * Ri, 2 * Ri);
    // espiral de ondulações (relevo claro/escuro deslocados)
    const voltas = 3.3, pts = 220;
    for (const [dx, dy, col, a] of [[0.012, 0.012, "0,0,0", 0.26 * Math.min(1.4, relevo)], [-0.01, -0.01, "255,255,255", (0.1 + 0.22 * br) * Math.min(1.4, relevo)]]) {
      c.strokeStyle = `rgba(${col},${a.toFixed(3)})`; c.lineWidth = Ri * 0.05 * (0.6 + relevo * 0.5); c.beginPath();
      for (let i = 0; i <= pts; i++) {
        const tt = i / pts, r = Ri * (0.95 - 0.86 * tt) * (1 + 0.03 * Math.sin(tt * 41)), an = tt * voltas * 2 * PI + 0.6;
        const px = r * Math.cos(an) + dx * Ri, py = r * Math.sin(an) + dy * Ri; i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.stroke();
    }
    if (pom.rough > 0.5) { // grão (massa fosca/fibrosa)
      c.fillStyle = "rgba(0,0,0,0.12)";
      for (let i = 0; i < 160; i++) { const a1 = i * 2.399, r1 = Ri * 0.95 * Math.sqrt((i + 0.5) / 160); c.fillRect(r1 * Math.cos(a1), r1 * Math.sin(a1), Ri * 0.012, Ri * 0.012); }
    }
    if (br > 0) { // brilho em gel/molhado
      g = c.createRadialGradient(-0.35 * Ri, -0.4 * Ri, 0, -0.35 * Ri, -0.4 * Ri, Ri * 0.5);
      g.addColorStop(0, `rgba(255,255,255,${(0.5 * br).toFixed(3)})`); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.fillRect(-Ri, -Ri, 2 * Ri, 2 * Ri);
    }
    g = c.createRadialGradient(0, 0, Ri * 0.7, 0, 0, Ri * 1.02); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.38)");
    c.fillStyle = g; c.fillRect(-Ri, -Ri, 2 * Ri, 2 * Ri);
    c.restore();
  }

  function sombra(c, cx, yb, G) {
    const { R, ry } = G;
    c.save(); c.globalCompositeOperation = "destination-over";
    c.translate(cx + R * 0.07, yb + ry * 0.2); c.scale(1, ry / R * 1.08);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, R * 1.3);
    g.addColorStop(0, "rgba(0,0,0,0.75)"); g.addColorStop(0.72, "rgba(0,0,0,0.5)"); g.addColorStop(0.88, "rgba(0,0,0,0.16)"); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.3, 0, 2 * PI); c.fill(); c.restore();
  }

  // reflexo leve no chão: cada coluna é espelhada a partir do arco frontal da base
  function reflexo(c, cx, yb, G, refH, alfa) {
    const { R, ry } = G, x0 = Math.floor(cx - R), x1 = Math.ceil(cx + R), rc = mk(x1 - x0, Math.ceil(refH)), r = rc.getContext("2d");
    for (let x = x0; x < x1; x++) {
      const dx = (x + 0.5 - cx) / R; if (Math.abs(dx) >= 1) continue;
      const e = ry * Math.sqrt(1 - dx * dx);
      r.save(); r.translate(x - x0, 0); r.scale(1, -1); r.drawImage(c.canvas, x, yb + e - refH, 1, refH, 0, -refH, 1, refH); r.restore();
    }
    r.globalCompositeOperation = "destination-in";
    const g = r.createLinearGradient(0, 0, 0, refH); g.addColorStop(0, `rgba(0,0,0,${alfa})`); g.addColorStop(1, "rgba(0,0,0,0)");
    r.fillStyle = g; r.fillRect(0, 0, rc.width, rc.height);
    c.save(); c.globalCompositeOperation = "destination-over";
    for (let x = x0; x < x1; x++) { const dx = (x + 0.5 - cx) / R; if (Math.abs(dx) >= 1) continue; c.drawImage(rc, x - x0, 0, 1, refH, x, yb + ry * Math.sqrt(1 - dx * dx), 1, refH); }
    c.restore();
  }

  function desenharPote(m, pom, W, aberto, giro) {
    const Wp = W * SS, D = Wp * (aberto ? 0.56 : 0.86), R = D / 2, k = D / D_MM, kv = k * COS_E, ry = R * ELEV;
    const G = { R, ry, k, kv, bodyH: CORPO_MM * kv, lidH: TAMPA_MM * kv };
    const subida = aberto ? 0.11 * D : 0, mt = 0.04 * D, refH = 0.45 * G.bodyH;
    const cxB = aberto ? Wp / 2 - 0.36 * D : Wp / 2, cxL = cxB + 0.72 * D;
    const yb = mt + ry + (aberto ? Math.max(G.bodyH, G.lidH + subida) : G.bodyH + G.lidH), yt = yb - G.bodyH;
    const Hp = Math.ceil(yb + ry + refH + 0.02 * D);
    const mm = { ...m, pomada: pom.id }, I = info(mm, pom), ok = fontesOk();
    const tj = lembrar(cacheArte, chaveArte("tarja", I, Math.round(k * TARJA_L)), () => desenharTarja(mm, pom, Math.round(k * TARJA_L)), 24, ok);
    const tp = lembrar(cacheArte, chaveArte("tampa", I, Math.round(D)), () => desenharTampa(mm, pom, Math.round(D)), 24, ok);
    const big = mk(Wp, Hp), c = big.getContext("2d"); c.imageSmoothingQuality = "high";
    if (aberto) {
      const ybL = yb - subida, ylL = ybL - G.lidH;
      tampa(c, cxL, ylL, G, tp); reflexo(c, cxL, ybL, G, refH, 0.16); sombra(c, cxL, ybL, G);
      corpo(c, cxB, yt, G, tj, giro, true); massa(c, cxB, yt, G, pom);
    } else {
      corpo(c, cxB, yt, G, tj, giro, false); tampa(c, cxB, yt - G.lidH, G, tp);
    }
    reflexo(c, cxB, yb, G, refH, 0.2); sombra(c, cxB, yb, G);
    const out = mk(W, Hp / SS), o = out.getContext("2d"); o.imageSmoothingQuality = "high";
    o.drawImage(big, 0, 0, out.width, out.height);
    return out;
  }

  /* ---------- API ---------- */
  const resolver = (m, pomada) => info(m, pomada).pom;
  return {
    tarja: (m, { w = 4096, pomada } = {}) => desenharTarja(m, resolver(m, pomada), w),
    tampa: (m, { s = 1024, pomada } = {}) => desenharTampa(m, resolver(m, pomada), s),
    pote: (m, { pomada, largura = 520, aberto = false, giro = 0 } = {}) => desenharPote(m, resolver(m, pomada), largura, aberto, giro * PI / 180),
    svgPote(m, o = {}) {
      const I = info(m, o.pomada), largura = o.largura || 440, aberto = !!o.aberto;
      const chave = [I.nome, I.tema.id, I.logo.id, I.pom.id, I.simbolo || "", I.sub, aberto, largura].join("|");
      return lembrar(cacheSvg, chave, () => {
        const cv = desenharPote(m, I.pom, largura, aberto, (o.giro || 0) * PI / 180), s = Math.min(200 / cv.width, 240 / cv.height), w = cv.width * s, h = cv.height * s;
        return `<svg viewBox="0 0 200 240" class="emb" role="img" aria-label="Pote de pomada com a marca ${escHTML(I.nome)}">` +
          `<image href="${cv.toDataURL("image/webp", 0.92)}" x="${((200 - w) / 2).toFixed(2)}" y="${((240 - h) / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"/></svg>`;
      }, 40, fontesOk());
    },
    limparCache() { cacheArte.clear(); cacheSvg.clear(); },
    fontesProntas: fontesOk
  };
})();

/* const de script clássico não vira window.RotuloKit: as páginas testam window.RotuloKit */
window.RotuloKit = RotuloKit;
