/* Ilustrações próprias dos itens de revenda da loja (desenhadas para este protótipo, sem fotos nem marcas de terceiros).
   Mesma linguagem das embalagens: corpo escuro, metal escovado e detalhes dourados. Uso: ilustracao(id) -> SVG ou null. */
(() => {
  const M = "url(#ilM)", G = "url(#ilG)", D = "url(#ilD)", S = "#0e0d0b";
  const o = `stroke="${S}" stroke-opacity=".55" stroke-width="1.5" stroke-linejoin="round"`;
  const sh = `<ellipse cx="100" cy="184" rx="62" ry="6" fill="#000" opacity=".35"/>`;
  const R = (x, y, w, h, r, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${o}/>`;
  const C = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`;
  const P = (d, f) => `<path d="${d}" fill="${f}" ${o}/>`;
  const L = (d, c = "#d9a441", w = 3) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const maquina = (alt, cab) => sh + R(78, 20 + alt, 44, 120 - alt, 20, D) + R(84, 14 + alt, 32, 26, 6, M) + `<g stroke="${S}" stroke-opacity=".5">${[0,1,2,3,4,5].map(i => `<line x1="${88 + i * 5}" y1="${16 + alt}" x2="${88 + i * 5}" y2="${34 + alt}"/>`).join("")}</g>` + C(100, 90, 9, G) + R(90, 130, 20, 40, 8, M) + (cab ? L("M100 158v10", "#d9a441", 4) : "");
  const tesoura = d => sh + P("M92 100L58 30c-6-12 6-20 14-12l34 70z", M) + P("M108 100l34-70c6-12-6-20-14-12l-34 70z", M) + `<circle cx="78" cy="144" r="22" fill="none" stroke="${G}" stroke-width="9"/><circle cx="122" cy="144" r="22" fill="none" stroke="${G}" stroke-width="9"/>` + C(100, 98, 5, D) + (d ? L("M70 40l16 34", "#fff", 2) : "");
  const frasco = (cor, cap) => sh + R(66, 62, 68, 116, 14, cor) + R(80, 36, 40, 30, 5, cap) + R(86, 24, 28, 16, 4, D) + R(76, 92, 48, 54, 6, "#f1e7cf") + L("M84 108h32M84 120h24M84 132h30", "#7a6a4a", 2.5);
  const I = {
    "maquina-corte": maquina(0, true), "maquina-acab": maquina(20, false), shaver: maquina(10, true),
    "laminas-maq": sh + [0, 1, 2].map(i => P(`M${52 + i * 8} ${60 + i * 22}h96l-8 16h-80z`, M)).join("") + [0, 1, 2].map(i => `<g stroke="${S}" stroke-opacity=".5">${[0,1,2,3,4,5,6,7].map(k => `<line x1="${62 + k * 11 + i * 8}" y1="${60 + i * 22}" x2="${62 + k * 11 + i * 8}" y2="${70 + i * 22}"/>`).join("")}</g>`).join(""),
    "oleo-maq": sh + R(70, 90, 60, 86, 12, D) + R(88, 56, 24, 38, 4, M) + P("M100 56l-14-34h16z", M) + L("M78 124h44M78 138h30", "#d9a441", 3),
    "tesoura-laser": tesoura(true), "tesoura-desbaste": tesoura(false),
    pentes: sh + R(30, 80, 140, 34, 8, D) + [...Array(14)].map((_, i) => `<rect x="${36 + i * 9.6}" y="112" width="5" height="38" rx="2" fill="${M}" ${o}/>`).join("") + R(30, 70, 140, 14, 7, G),
    "pentes-encaixe": sh + [0, 1, 2].map(i => R(50 + i * 34, 40, 28, 120, 8, i === 1 ? G : D) + L(`M${58 + i * 34} 60v80`, "#f1e7cf", 2)).join(""),
    navalhete: sh + R(40, 96, 110, 24, 10, D) + P("M130 100l40-44 6 6-30 52z", M) + L("M60 108h60", "#d9a441", 3),
    "laminas-navalhete": sh + R(44, 70, 112, 60, 6, D) + [0, 1, 2].map(i => P(`M${60 + i * 28} 82h22v36h-22z`, M)).join("") + L("M52 140h96", "#d9a441", 3),
    pincel: sh + P("M70 24c30-8 60-8 60 0l-6 72h-48z", "#e8dcc2") + R(72, 92, 56, 16, 4, G) + P("M78 108h44l-6 70h-32z", D),
    toalhas: sh + [0, 1, 2].map(i => R(44, 128 - i * 26, 112, 24, 8, i % 2 ? "#e8dcc2" : "#f4efe3") + L(`M52 ${140 - i * 26}h96`, "#d9a441", 2)).join(""),
    "gel-barbear": sh + P("M72 30h56l8 140h-72z", "rgba(180,225,235,.55)") + R(76, 18, 48, 18, 4, G) + L("M82 90h36M82 104h26", "#fff", 3),
    borrifador: sh + R(60, 86, 74, 90, 14, "rgba(160,210,225,.55)") + R(72, 58, 30, 32, 4, D) + P("M72 58h50l12 10v10h-62z", D) + C(150, 70, 3, "#9fd6e6") + C(160, 60, 3, "#9fd6e6") + C(160, 78, 3, "#9fd6e6"),
    capa: sh + P("M62 36h76l36 130H26z", D) + P("M76 36c10 16 38 16 48 0z", M) + L("M44 150h112", "#d9a441", 3) + C(100, 40, 5, G),
    espanador: sh + P("M100 24c-30 0-52 24-48 56 3 20 24 30 48 30s45-10 48-30c4-32-18-56-48-56z", "#f1e7cf") + R(86, 104, 28, 70, 12, D) + R(86, 104, 28, 12, 4, G),
    secador: sh + P("M30 56h88a22 22 0 0 1 0 44H80l-6 12H30z", D) + R(118, 62, 36, 32, 4, M) + P("M80 100h28l-10 70H72z", D) + C(52, 78, 8, G),
    espelho: sh + `<circle cx="100" cy="76" r="48" fill="${M}" ${o}/><circle cx="100" cy="76" r="40" fill="#cfe6ee"/>` + L("M80 56c10-10 24-10 32-4", "#fff", 4) + R(90, 122, 20, 54, 9, G),
    carrinho: sh + R(40, 50, 120, 10, 3, M) + R(40, 100, 120, 10, 3, M) + R(40, 150, 120, 10, 3, M) + R(44, 36, 8, 126, 3, D) + R(148, 36, 8, 126, 3, D) + C(52, 172, 6, D) + C(148, 172, 6, D) + R(70, 24, 24, 26, 4, G) + R(110, 78, 22, 22, 4, "#e8dcc2"),
    "papel-pescoco": sh + [0, 1].map(i => R(40 + i * 62, 70, 56, 90, 10, "#f4efe3") + `<ellipse cx="${68 + i * 62}" cy="70" rx="28" ry="9" fill="#ddd2b6" ${o}/><ellipse cx="${68 + i * 62}" cy="70" rx="8" ry="3" fill="${D}"/>`).join("") + L("M50 120h36M112 120h36", "#d9a441", 3),
    luvas: sh + R(46, 60, 108, 100, 8, D) + R(46, 60, 108, 18, 8, G) + P("M100 90c18 0 26 14 26 30s-8 30-26 30-26-14-26-30 8-30 26-30z", "#8fb7d9") + L("M84 112h32", "#fff", 3),
    alcool: frasco("rgba(235,240,243,.9)", G),
    esterilizador: sh + R(40, 60, 120, 110, 12, D) + R(52, 76, 96, 70, 8, "#1c2a38") + L("M64 120h72M64 100h72", "#7fd1ff", 4) + C(100, 66, 4, "#7fd1ff") + L("M72 160h56", "#d9a441", 3),
    bacia: sh + P("M30 80h140c0 46-28 86-70 86S30 126 30 80z", D) + `<ellipse cx="100" cy="80" rx="70" ry="14" fill="#2c5a6e" ${o}/>` + L("M62 80c12 6 24-6 38 0s26 6 38 0", "#9fd6e6", 3),
    cadeira: sh + R(66, 26, 68, 72, 22, D) + R(48, 92, 104, 30, 12, "#3a342b") + R(40, 104, 18, 36, 8, G) + R(142, 104, 18, 36, 8, G) + R(94, 122, 12, 36, 4, M) + P("M52 176l48-18 48 18z", M),
    poltrona: sh + R(50, 40, 100, 70, 22, "#3a342b") + R(34, 90, 132, 50, 18, D) + R(34, 96, 22, 50, 10, "#3a342b") + R(144, 96, 22, 50, 10, "#3a342b") + R(54, 150, 8, 24, 3, G) + R(138, 150, 8, 24, 3, G),
    luminaria: sh + L("M100 10v40", "#8d8a83", 3) + P("M60 100c0-30 18-50 40-50s40 20 40 50z", D) + `<ellipse cx="100" cy="104" rx="40" ry="8" fill="#ffd98a" opacity=".9"/>` + P("M70 108h60l24 60H46z", "rgba(255,217,138,.16)"),
    display: sh + R(44, 28, 112, 144, 8, D) + [0, 1, 2].map(i => R(52, 40 + i * 44, 96, 4, 2, G) + R(62, 12 + i * 44 + 14, 22, 28, 4, "#e8dcc2") + R(96, 12 + i * 44 + 14, 22, 28, 4, "#3a342b") + R(124, 12 + i * 44 + 14, 16, 28, 4, M)).join(""),
    sacolas: sh + P("M52 64h96l8 108H44z", "#b9915a") + L("M76 64c0-30 48-30 48 0", "#8a6a3a", 5) + R(78, 104, 44, 34, 4, "#e8dcc2") + L("M86 120h28", "#7a6a4a", 3),
    fidelidade: sh + R(26, 52, 148, 96, 10, D) + R(26, 52, 148, 20, 10, G) + [...Array(10)].map((_, i) => `<circle cx="${50 + (i % 5) * 25}" cy="${96 + Math.floor(i / 5) * 28}" r="9" fill="${i < 6 ? G : "none"}" stroke="#d9a441" stroke-width="2"/>`).join(""),
    vale: sh + R(36, 60, 128, 100, 8, "#f1e7cf") + R(92, 60, 16, 100, 0, G) + R(36, 98, 128, 16, 0, G) + P("M100 60c-26-34-52-8-26 4zM100 60c26-34 52-8 26 4z", G)
  };
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="ilM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efece4"/><stop offset=".5" stop-color="#b9b5ab"/><stop offset="1" stop-color="#7d7a72"/></linearGradient>
<linearGradient id="ilG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1c869"/><stop offset="1" stop-color="#a97a1f"/></linearGradient>
<linearGradient id="ilD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a443a"/><stop offset="1" stop-color="#1b1915"/></linearGradient></defs></svg>`;
  let pronto = false;
  window.ilustracao = id => {
    if (!I[id]) return null;
    if (!pronto) { pronto = true; document.body.insertAdjacentHTML("afterbegin", defs); }
    return `<svg class="emb ilu" viewBox="0 0 200 200" aria-hidden="true">${I[id]}</svg>`;
  };
  console.assert(Object.keys(I).length >= 32, "ilustrações: um desenho por item de revenda");
})();
