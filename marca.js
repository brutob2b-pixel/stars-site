/* Marca da barbearia: cores, logotipo base, estilos de pomada e embalagens desenhadas.
   Usado pela home, pelo Estúdio de marca, pelo Marketing, pela Loja e pelo Painel.
   O logotipo é um rascunho automático por modelos (não é IA); o designer finaliza no pedido real. */

const TEMAS = [
  { id: "black", nome: "Black dourado", bg1: "#1a1712", bg2: "#050504", ring: "#D9A441", text: "#F0C46A", sub: "#C8B07A" },
  { id: "verde", nome: "Verde clássico", bg1: "#1F3A30", bg2: "#08120e", ring: "#D9A441", text: "#F0C46A", sub: "#C8B07A" },
  { id: "prata", nome: "Black prata", bg1: "#24262a", bg2: "#060607", ring: "#C9CDD3", text: "#E9EDEF", sub: "#8696A0" },
  { id: "vinho", nome: "Vinho cobre", bg1: "#3a1418", bg2: "#100506", ring: "#C98552", text: "#EDB98A", sub: "#B98C6E" },
  { id: "marfim", nome: "Marfim e preto", bg1: "#EDE6D6", bg2: "#CFC6B2", ring: "#17150F", text: "#17150F", sub: "#5A5346" }
];
const LOGOS = [
  { id: "classico", nome: "Clássico", fonte: "Playfair Display", css: '"Playfair Display", serif' },
  { id: "moderno", nome: "Moderno", fonte: "Barlow Condensed", css: '"Barlow Condensed", sans-serif' },
  { id: "emblema", nome: "Emblema", fonte: "Barlow Condensed", css: '"Barlow Condensed", sans-serif' }
];
// estilos de pomada: cor e acabamento da massa (também usados no pote 3D da home)
// fix e brilho vão de 0 a 5; descrevem o tipo de produto, não são números de fábrica
const POMADAS = [
  { id: "pasta", nome: "Pasta Modeladora", rotulo: "PASTA MODELADORA", fix: 3, brilho: 2, cor: "#E3D6BC", rough: 0.4, coat: 1, relevo: 1,
    desc: "Cremosa, acabamento natural. O coringa da bancada, serve para quase todo corte." },
  { id: "argila", nome: "Argila Matte", rotulo: "ARGILA MATTE", fix: 5, brilho: 0, cor: "#B5A893", rough: 0.97, coat: 0, relevo: 1.35,
    desc: "Fixação forte e efeito seco, sem brilho nenhum. Volume que aguenta o dia inteiro." },
  { id: "gel", nome: "Gel-Cera Brilho", rotulo: "GEL-CERA BRILHO", fix: 4, brilho: 5, cor: "#C98A2E", rough: 0.06, coat: 1, relevo: 0.35,
    desc: "Brilho espelhado e penteado alinhado. O clássico do risca-lado e do topete." },
  { id: "molhado", nome: "Efeito Molhado", rotulo: "EFEITO MOLHADO", fix: 2, brilho: 4, cor: "#8DB6C4", rough: 0.04, coat: 1, relevo: 0.5,
    desc: "Visual de cabelo molhado o dia todo. À base de água, sai fácil no banho." },
  { id: "fibra", nome: "Fibra Texturizadora", rotulo: "FIBRA", fix: 4, brilho: 1, cor: "#D2A78C", rough: 0.78, coat: 0.15, relevo: 1.6,
    desc: "Massa elástica que separa os fios. Textura despenteada, mas sob controle." },
  { id: "cera", nome: "Cera Black", rotulo: "CERA BLACK", fix: 3, brilho: 3, cor: "#2E2C29", rough: 0.32, coat: 1, relevo: 0.8,
    desc: "Pigmento escuro que disfarça falhas e fios brancos. Muito pedida na barba." }
];

/* ---- marca guardada neste navegador (vale para todas as páginas do protótipo) ---- */
const MARCA_KEY = "stars-marca";
const MARCA_PADRAO = { nome: "", tema: "black", logo: "classico", pomada: "pasta", cidade: "BARBEARIA" };
const MARCA = {
  load() {
    try { return { ...MARCA_PADRAO, ...(JSON.parse(localStorage.getItem(MARCA_KEY)) || {}) }; }
    catch { return { ...MARCA_PADRAO }; }
  },
  save(m) {
    m = { ...m, atualizado: Date.now() }; // o Estúdio usa isto para adotar a marca mais nova (ex.: vinda do briefing da home)
    try { localStorage.setItem(MARCA_KEY, JSON.stringify(m)); } catch { /* sem armazenamento: vale só nesta visita */ }
    return m;
  },
  nome: m => (m.nome || "").trim() || "Sua barbearia",
  tema: m => TEMAS.find(t => t.id === m.tema) || TEMAS[0],
  logo: m => LOGOS.find(l => l.id === m.logo) || LOGOS[0],
  pomada: m => POMADAS.find(p => p.id === m.pomada) || POMADAS[0]
};
const escHTML = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---- logotipo base em canvas ---- */
const IGNORAR = /^(barbearia|barber|barbershop|shop|salão|salao|studio|estúdio|de|da|do|das|dos|e|the)$/i;
function iniciais(nome) {
  const w = nome.split(/\s+/).filter(Boolean);
  const k = w.filter(x => !IGNORAR.test(x));
  const base = k.length ? k : w;
  return ((base[0]?.[0] || "S") + (base[1]?.[0] || "")).toUpperCase();
}
function fit(c, text, maxW, size, font, weight = 700) {
  c.font = `${weight} ${size}px ${font}`;
  return Math.min(size, size * maxW / Math.max(1, c.measureText(text).width));
}
// uma ou duas linhas, o que deixar a letra maior
function quebra(c, text, maxW, size, font) {
  const um = fit(c, text, maxW, size, font), w = text.split(/\s+/);
  if (um >= size * 0.6 || w.length < 2) return { lines: [text], size: um };
  const cut = Math.ceil(w.length / 2), lines = [w.slice(0, cut).join(" "), w.slice(cut).join(" ")];
  return { lines, size: Math.min(size * 0.85, ...lines.map(l => fit(c, l, maxW, size, font))) };
}
function arcText(c, text, cx, cy, r, top, gap) {
  const ch = [...text], ws = ch.map(x => (c.measureText(x).width + gap) / r);
  let a = (top ? -Math.PI / 2 : Math.PI / 2) + (top ? -1 : 1) * ws.reduce((s, x) => s + x, 0) / 2;
  ch.forEach((x, i) => {
    a += (top ? 1 : -1) * ws[i] / 2;
    c.save(); c.translate(cx + r * Math.cos(a), cy + r * Math.sin(a)); c.rotate(a + (top ? 1 : -1) * Math.PI / 2);
    c.fillText(x, 0, 0); c.restore();
    a += (top ? 1 : -1) * ws[i] / 2;
  });
}
// desenha o logotipo num quadrado S×S, fundo transparente; cor = {text, ring, sub}; sub = linha de baixo (cidade)
function drawLogo(c, S, nome, est, cor, sub = "BARBEARIA") {
  const m = S / 2, N = nome.toUpperCase(), F = est.css;
  c.save(); c.textAlign = "center"; c.textBaseline = "middle";
  if (est.id === "classico") {
    const { lines, size } = quebra(c, N, S * 0.86, S * 0.2, F);
    c.font = `700 ${size}px ${F}`; c.fillStyle = cor.text;
    const lh = size * 1.02, y0 = m - S * 0.06 - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => c.fillText(l, m, y0 + i * lh));
    const yb = y0 + (lines.length - 1) * lh + size * 0.75;
    c.strokeStyle = cor.ring; c.lineWidth = S * 0.006;
    c.beginPath(); c.moveTo(m - S * 0.3, yb); c.lineTo(m - S * 0.04, yb); c.moveTo(m + S * 0.04, yb); c.lineTo(m + S * 0.3, yb); c.stroke();
    c.fillStyle = cor.ring; c.beginPath(); c.moveTo(m, yb - S * 0.02); c.lineTo(m + S * 0.02, yb); c.lineTo(m, yb + S * 0.02); c.lineTo(m - S * 0.02, yb); c.fill();
    c.fillStyle = cor.sub; c.font = `600 ${S * 0.05}px "Barlow", sans-serif`; c.letterSpacing = `${S * 0.018}px`;
    c.fillText(sub, m + S * 0.009, yb + S * 0.09);
  } else if (est.id === "moderno") {
    const ini = iniciais(nome), B = S * 0.42, bx = m - B / 2, by = S * 0.12;
    c.strokeStyle = cor.ring; c.lineWidth = S * 0.012; c.strokeRect(bx, by, B, B);
    c.fillStyle = cor.text; c.font = `700 ${fit(c, ini, B * 0.78, B * 0.72, F)}px ${F}`;
    c.fillText(ini, m, by + B * 0.54);
    c.letterSpacing = `${S * 0.012}px`;
    const { lines, size } = quebra(c, N, S * 0.84, S * 0.12, F);
    c.font = `700 ${size}px ${F}`;
    lines.forEach((l, i) => c.fillText(l, m + S * 0.006, by + B + S * 0.1 + i * size * 1.02));
    c.letterSpacing = "0px";
  } else {
    const r = S * 0.45;
    c.strokeStyle = cor.ring; c.lineWidth = S * 0.012; c.beginPath(); c.arc(m, m, r, 0, 7); c.stroke();
    c.lineWidth = S * 0.005; c.beginPath(); c.arc(m, m, r * 0.7, 0, 7); c.stroke();
    c.fillStyle = cor.text; c.letterSpacing = "0px";
    let fs = S * 0.085; c.font = `700 ${fs}px ${F}`;
    // encolhe o nome até caber no arco de cima (~150°)
    while (fs > S * 0.04 && [...N].reduce((s, x) => s + c.measureText(x).width + S * 0.01, 0) / (r * 0.85) > 2.6) { fs -= 2; c.font = `700 ${fs}px ${F}`; }
    arcText(c, N, m, m, r * 0.85, true, S * 0.01);
    c.fillStyle = cor.sub; c.font = `600 ${S * 0.055}px "Barlow", sans-serif`;
    arcText(c, `★ ${sub} ★`, m, m, r * 0.85, false, S * 0.012);
    const ini = iniciais(nome);
    c.fillStyle = cor.text; c.font = `700 ${fit(c, ini, r * 1.1, S * 0.36, F)}px ${F}`;
    c.fillText(ini, m, m + S * 0.02);
  }
  c.restore();
}
const corEscura = t => ({ text: t.text, ring: t.ring, sub: t.sub });
const corClara = t => ({ text: "#17150F", ring: t.ring === "#C9CDD3" ? "#6F737A" : t.id === "marfim" ? "#17150F" : "#A8772A", sub: "#6F695F" });
const fundoTema = (cv, t) => {
  const c = cv.getContext("2d"), g = c.createRadialGradient(cv.width / 2, cv.height * 0.4, 10, cv.width / 2, cv.height / 2, cv.width * 0.7);
  g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2); return g;
};
// pinta o logotipo da marca num canvas inteiro; bg = cor/gradiente, "tema" ou null (transparente)
function pintarLogo(cv, m, { bg = "tema", cor, pad = 0.08 } = {}) {
  const t = MARCA.tema(m), c = cv.getContext("2d"), W = cv.width, H = cv.height, S = Math.min(W, H) * (1 - pad * 2);
  c.clearRect(0, 0, W, H);
  if (bg) { c.fillStyle = bg === "tema" ? fundoTema(cv, t) : bg; c.fillRect(0, 0, W, H); }
  c.save(); c.translate((W - S) / 2, (H - S) / 2); drawLogo(c, S, MARCA.nome(m), MARCA.logo(m), cor || corEscura(t), m.cidade || "BARBEARIA", m.simbolo); c.restore();
}
// salva um canvas como PNG no computador de quem está vendo
function baixarCanvas(cv, nomeArquivo) {
  cv.toBlob(b => {
    if (!b) return;
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: nomeArquivo });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, "image/png");
}
const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "marca";

/* ---- embalagens em SVG com a marca da barbearia (desenho de vitrine, não é a arte final) ---- */
let _svgId = 0;
function embalagem(tipo, m, { pomada, rotulo, largura } = {}) {
  // o pote usa o desenho realista de rotulo.js (medidas reais, tarja no cilindro); se não carregou, cai no desenho antigo abaixo
  if (tipo === "pote" && window.RotuloKit) { try { return RotuloKit.svgPote(m, { pomada: pomada || MARCA.pomada(m), largura: largura || 300 }); } catch (e) { /* desenho antigo */ } }
  const t = MARCA.tema(m), p = pomada || MARCA.pomada(m), id = "e" + (++_svgId);
  const nome = escHTML(MARCA.nome(m).toUpperCase()), sub = escHTML(rotulo || p.rotulo);
  const fz = (w, base) => Math.min(base, (w * 1.75) / Math.max(4, MARCA.nome(m).length)).toFixed(1);
  const font = MARCA.logo(m).css.replace(/"/g, "'");
  const defs = `<defs>
    <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#3a352d"/><stop offset=".28" stop-color="#15130f"/><stop offset=".72" stop-color="#0b0a08"/><stop offset="1" stop-color="#2a261f"/></linearGradient>
    <linearGradient id="${id}r" x1="0" x2="1"><stop offset="0" stop-color="${t.bg1}"/><stop offset=".5" stop-color="${t.bg2}"/><stop offset="1" stop-color="${t.bg1}"/></linearGradient>
    <radialGradient id="${id}t" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/></radialGradient>
    <linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="#6b3d14"/><stop offset=".3" stop-color="#3a1d07"/><stop offset=".75" stop-color="#2a1404"/><stop offset="1" stop-color="#5a3312"/></linearGradient>
    <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset=".18" stop-color="rgba(255,255,255,.22)"/><stop offset=".26" stop-color="rgba(255,255,255,0)"/></linearGradient>
  </defs>`;
  const sombra = `<ellipse cx="100" cy="226" rx="70" ry="9" fill="rgba(0,0,0,.55)"/>`;
  const brilho = (x, y, w, h, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id}s)"/>`;
  const rotuloRect = (x, y, w, h, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id}r)" stroke="${t.ring}" stroke-width="1"/>
    <line x1="${x + 6}" x2="${x + w - 6}" y1="${y + 6}" y2="${y + 6}" stroke="${t.ring}" stroke-opacity=".6" stroke-width=".7"/>
    <line x1="${x + 6}" x2="${x + w - 6}" y1="${y + h - 6}" y2="${y + h - 6}" stroke="${t.ring}" stroke-opacity=".6" stroke-width=".7"/>`;
  const textos = (cx, y, w, base = 16) => `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(w, base)}" fill="${t.text}" letter-spacing=".5">${nome}</text>
    <text x="${cx}" y="${y + 13}" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="6.2" letter-spacing="1.6" fill="${t.sub}">${sub}</text>`;
  let corpo = "";
  if (tipo === "pote") {
    corpo = `<path d="M38 128v66a62 18 0 0 0 124 0v-66z" fill="url(#${id}c)"/>
      ${rotuloRect(40, 146, 120, 40, 2)}${textos(100, 166, 112, 17)}
      <path d="M34 104v26a66 19 0 0 0 132 0v-26z" fill="url(#${id}c)" stroke="#4a443a" stroke-width=".6"/>
      <ellipse cx="100" cy="104" rx="66" ry="19" fill="url(#${id}t)" stroke="${t.ring}" stroke-width="1.6"/>
      <ellipse cx="100" cy="104" rx="56" ry="15.5" fill="none" stroke="${t.ring}" stroke-opacity=".7" stroke-width=".7"/>
      <text transform="translate(100 107) scale(1 .3)" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(110, 24)}" fill="${t.text}">${nome}</text>
      ${brilho(40, 108, 120, 86, 4)}`;
  } else if (tipo === "lata") {
    corpo = `<path d="M30 170v24a70 18 0 0 0 140 0v-24z" fill="url(#${id}c)"/>
      <path d="M30 166v8a70 18 0 0 0 140 0v-8z" fill="${t.ring}" opacity=".85"/>
      <ellipse cx="100" cy="166" rx="70" ry="18" fill="url(#${id}t)" stroke="${t.ring}" stroke-width="1.6"/>
      <ellipse cx="100" cy="166" rx="58" ry="14.5" fill="none" stroke="${t.ring}" stroke-opacity=".7" stroke-width=".7"/>
      <text transform="translate(100 166) scale(1 .3)" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(120, 26)}" fill="${t.text}">${nome}</text>
      <text transform="translate(100 176) scale(1 .3)" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="8" letter-spacing="2" fill="${t.sub}">${sub}</text>`;
  } else if (tipo === "frasco") {
    corpo = `<rect x="88" y="52" width="24" height="22" rx="4" fill="#111"/><path d="M90 52q10 -28 20 0z" fill="#1d1d1d"/>
      <rect x="84" y="72" width="32" height="12" rx="2" fill="${t.ring}"/>
      <path d="M72 100q0 -16 28 -16t28 16v98q0 8 -8 8h-40q-8 0 -8 -8z" fill="url(#${id}a)"/>
      ${rotuloRect(76, 126, 48, 62, 3)}
      <text x="100" y="150" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(44, 11)}" fill="${t.text}">${nome}</text>
      <text x="100" y="164" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="5" letter-spacing="1" fill="${t.sub}">${sub}</text>
      ${brilho(72, 92, 56, 112, 8)}`;
  } else if (tipo === "pump") {
    corpo = `<rect x="94" y="30" width="12" height="26" fill="#151515"/><path d="M82 30h30q8 0 8 6h-38z" fill="#151515"/>
      <rect x="86" y="54" width="28" height="14" rx="3" fill="#111"/>
      <path d="M66 92q0 -24 34 -24t34 24v108q0 8 -8 8h-52q-8 0 -8 -8z" fill="url(#${id}c)"/>
      ${rotuloRect(70, 112, 60, 74, 3)}${textos(100, 145, 52, 13)}
      ${brilho(66, 80, 68, 126, 10)}`;
  } else if (tipo === "tubo") {
    corpo = `<path d="M70 40h60l-2 6h-56z" fill="${t.ring}"/>
      <path d="M72 46h56l-12 140h-32z" fill="url(#${id}r)" stroke="${t.ring}" stroke-width=".8"/>
      <rect x="82" y="186" width="36" height="22" rx="3" fill="#121212"/>
      <text x="100" y="104" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(50, 12)}" fill="${t.text}">${nome}</text>
      <text x="100" y="118" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="5.2" letter-spacing="1.2" fill="${t.sub}">${sub}</text>
      <path d="M78 52l10 126" stroke="rgba(255,255,255,.18)" stroke-width="4"/>`;
  } else if (tipo === "spray") {
    corpo = `<path d="M86 26h22v12h-22z" fill="#1a1a1a"/><path d="M108 28h14v6h-14z" fill="#1a1a1a"/>
      <rect x="84" y="38" width="32" height="20" rx="3" fill="#111"/>
      <rect x="74" y="58" width="52" height="150" rx="10" fill="url(#${id}c)"/>
      ${rotuloRect(78, 96, 44, 80, 3)}
      <text x="100" y="130" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(40, 10)}" fill="${t.text}">${nome}</text>
      <text x="100" y="143" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="4.8" letter-spacing="1" fill="${t.sub}">${sub}</text>
      ${brilho(74, 58, 52, 150, 10)}`;
  } else { // caixa (kit)
    corpo = `<path d="M40 92l60 -22 60 22v96l-60 22 -60 -22z" fill="url(#${id}c)"/>
      <path d="M40 92l60 22 60 -22" fill="none" stroke="${t.ring}" stroke-width="1.2"/><path d="M100 114v96" stroke="${t.ring}" stroke-width="1.2"/>
      <path d="M40 92l60 -22 60 22 -60 22z" fill="url(#${id}t)" stroke="${t.ring}" stroke-width="1"/>
      <text transform="translate(100 95) scale(1 .45)" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fz(90, 20)}" fill="${t.text}">${nome}</text>
      <text x="70" y="160" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="600" font-size="6" letter-spacing="1.4" fill="${t.sub}" transform="skewY(20) translate(0 -26)">KIT</text>`;
  }
  return `<svg viewBox="0 0 200 240" class="emb" role="img" aria-label="${escHTML(tipo)} com a marca ${nome}">${defs}${sombra}${corpo}</svg>`;
}
// mini pote aberto com a cor da massa à mostra (para os cartões de estilo)
function potinhoAberto(p, t = TEMAS[0]) {
  const id = "pa" + (++_svgId);
  return `<svg viewBox="0 0 120 90" class="emb" aria-hidden="true"><defs>
    <radialGradient id="${id}m" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#fff" stop-opacity="${0.15 + p.brilho * 0.11}"/><stop offset=".35" stop-color="${p.cor}"/><stop offset="1" stop-color="${p.cor}" stop-opacity=".85"/></radialGradient>
    <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#3a352d"/><stop offset=".3" stop-color="#14120f"/><stop offset="1" stop-color="#2a261f"/></linearGradient></defs>
    <ellipse cx="60" cy="84" rx="48" ry="5" fill="rgba(0,0,0,.5)"/>
    <path d="M14 40v32a46 12 0 0 0 92 0V40z" fill="url(#${id}c)"/>
    <path d="M14 60a46 12 0 0 0 92 0" fill="none" stroke="${t.ring}" stroke-opacity=".6"/>
    <ellipse cx="60" cy="40" rx="46" ry="12" fill="#0b0a08" stroke="${t.ring}" stroke-width="1.2"/>
    <ellipse cx="60" cy="41" rx="40" ry="9.5" fill="url(#${id}m)"/>
    ${p.relevo > 1 ? `<path d="M34 42q10 -6 20 0t22 -1" stroke="rgba(0,0,0,.18)" fill="none" stroke-width="2"/>` : ""}
    ${p.brilho >= 4 ? `<ellipse cx="48" cy="38" rx="12" ry="2.6" fill="#fff" opacity=".55"/>` : ""}
  </svg>`;
}
