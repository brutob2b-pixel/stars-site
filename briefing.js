/* Briefing da marca: quiz de 5 perguntas que monta uma base de marca (logotipo, clima, pomada, slogan).
   Tudo por regras e modelos fixos, sem IA e sem rede. Depende de marca.js (carregar antes).
   API: Briefing.abrir({ marca, onAplicar(m), onSimular() }). Ao aplicar, dispara o evento "stars:marca". */
(function () {
  "use strict";

  const TOTAL = 6;

  /* ---------- conteúdo fixo ---------- */
  const SVG_ESTILO = {
    tradicao: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="15"/><path d="M32 22l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L22 29h7z"/>',
    classica: '<path d="M14 40h14M36 40h14M20 24h24M26 24v-6h12v6"/><path d="M32 35l5 5-5 5-5-5z"/>',
    urbana: '<rect x="14" y="14" width="36" height="36"/><path d="M22 42l8-20M32 42l8-20"/>'
  };
  const ESTILOS = [
    { id: "tradicao", nome: "Tradição", logo: "emblema", frase: "Barbearia raiz: ofício, navalha e história.", porque: "Emblema, porque você descreveu uma casa de tradição." },
    { id: "classica", nome: "Clássica elegante", logo: "classico", frase: "Ambiente refinado e atendimento com hora marcada.", porque: "Logotipo clássico, porque sua casa é refinada e atende com hora marcada." },
    { id: "urbana", nome: "Urbana", logo: "moderno", frase: "Street, fade e muita rede social.", porque: "Monograma moderno, porque sua casa é urbana e vive de fade e redes sociais." }
  ];
  const SIMBOLOS = [
    { id: "navalha", nome: "Navalha", frase: "Ofício, precisão e tradição." },
    { id: "tesoura", nome: "Tesoura", frase: "Corte técnico e acabamento." },
    { id: "poste", nome: "Poste", frase: "A barbearia clássica de rua." },
    { id: "bigode", nome: "Bigode", frase: "Barba, estilo e personalidade." },
    { id: "pente", nome: "Pente", frase: "Fade, risca e cabelo alinhado." },
    { id: "nenhum", nome: "Só o nome", frase: "Marca limpa, sem desenho." }
  ];
  const CLIMA = { black: "luxo discreto", verde: "tradição de bancada", prata: "frio e moderno", vinho: "acolhedor, madeira e couro", marfim: "claro, limpo, minimalista" };
  const CORTE = { pasta: "o corte social do dia a dia", argila: "volume e textura seca", gel: "risca-lado e topete", molhado: "o visual molhado", fibra: "o despenteado com textura", cera: "barba e fios brancos" };
  const PUBLICOS = [
    { id: "jovens", nome: "Jovens", frase: "Fade, visual e rede social." },
    { id: "exec", nome: "Executivos", frase: "Corte clássico e barba alinhada." },
    { id: "familia", nome: "Família", frase: "Todas as idades na mesma casa." },
    { id: "barba", nome: "Barba e tradição", frase: "Navalha, toalha quente e capricho." }
  ];
  // estilo x público: duas frases cada, a escolha entre elas depende do nome (sempre a mesma para o mesmo nome)
  const SLOGANS = {
    tradicao: {
      jovens: ["{N}: tradição com o corte de quem chega agora.", "{N}: o ofício antigo no seu visual de hoje."],
      exec: ["{N}: ofício, barba feita e corte de respeito.", "{N}: a tradição que cuida da sua imagem."],
      familia: ["{N}: gerações na mesma cadeira.", "{N}: tradição que atende a família toda."],
      barba: ["{N}: navalha, toalha quente e tradição.", "{N}: a barba feita do jeito raiz."]
    },
    classica: {
      jovens: ["{N}: elegância também é coisa de jovem.", "{N}: refinado desde o primeiro corte."],
      exec: ["{N}: o corte que a casa assina.", "{N}: elegância com hora marcada."],
      familia: ["{N}: um cuidado elegante para a família toda.", "{N}: classe que cabe em todas as idades."],
      barba: ["{N}: barba bem desenhada, acabamento impecável.", "{N}: o capricho que a sua barba merece."]
    },
    urbana: {
      jovens: ["{N}: fade na régua e visual que rende foto.", "{N}: seu corte, sua rua, sua marca."],
      exec: ["{N}: visual moderno que também fecha negócio.", "{N}: corte afiado para a rotina corrida."],
      familia: ["{N}: estilo de rua para a família toda.", "{N}: do pequeno ao avô, todo mundo sai no estilo."],
      barba: ["{N}: barba no talo, contorno na linha.", "{N}: barba desenhada, atitude de sobra."]
    }
  };

  /* ---------- funções puras ---------- */
  const MINUSCULAS = /^(de|da|do|das|dos|e)$/i;
  // "barbearia do zé" -> "Barbearia do Zé"; palavras que já têm maiúscula no meio ("JM") ficam como estão
  function nomeBonito(txt) {
    return String(txt).trim().replace(/\s+/g, " ").split(" ").map((w, i) => {
      if (/[A-ZÀ-Ý]/.test(w.slice(1))) return w;
      if (i > 0 && MINUSCULAS.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(" ");
  }
  function slogan(estilo, publico, nome) {
    const opcoes = SLOGANS[estilo][publico];
    const h = [...nome].reduce((s, c) => s + c.charCodeAt(0), 0);
    return opcoes[h % opcoes.length].replace("{N}", nome);
  }

  /* ---------- estilo (injetado uma vez) ---------- */
  const CSS = `
.bf-dlg{--bf-gold:var(--accent,#D9A441);--bf-gold2:var(--accent-2,#F0C46A);--bf-line:var(--line,#3A352C);--bf-text:var(--text,#F1ECE2);--bf-muted:var(--muted,#A39C90);
 padding:0;border:1px solid rgba(255,255,255,.14);border-radius:24px;color:var(--bf-text);font-family:var(--f-body,Barlow,sans-serif);
 width:min(880px,calc(100vw - 32px));max-height:92dvh;background:rgba(18,16,12,.96);overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.bf-dlg[open]{display:flex;flex-direction:column}
.bf-dlg::backdrop{background:rgba(0,0,0,.74)}
@media (pointer:fine) and (min-aspect-ratio:4/5){.bf-dlg{background:rgba(18,16,12,.82);-webkit-backdrop-filter:blur(22px) saturate(1.3);backdrop-filter:blur(22px) saturate(1.3)}}
.bf-dlg *{box-sizing:border-box}
.bf-top{display:flex;align-items:center;gap:14px;padding:16px 20px 0}
.bf-num{font-size:13px;letter-spacing:.18em;color:var(--bf-muted);min-width:64px}
.bf-bar{flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden}
.bf-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--bf-gold),var(--bf-gold2));transform-origin:left;transition:transform .4s ease}
.bf-x{width:44px;height:44px;border-radius:50%;border:1px solid var(--bf-line);background:transparent;color:var(--bf-text);font-size:20px;cursor:pointer}
.bf-body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:18px 20px 8px}
.bf-anim{transition:opacity .35s ease,transform .35s ease}
.bf-pre{opacity:0;transform:translateY(12px)}
.bf-t{font-family:var(--f-disp,'Barlow Condensed',sans-serif);text-transform:uppercase;font-weight:700;font-size:clamp(34px,6vw,54px);line-height:.98;margin:0 0 6px;letter-spacing:.01em;outline:0}
.bf-s{color:var(--bf-muted);margin:0 0 18px;font-size:16px}
.bf-lbl{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--bf-muted);margin:14px 0 6px}
.bf-in{width:100%;min-height:52px;padding:0 16px;border-radius:14px;border:1px solid var(--bf-line);background:rgba(255,255,255,.05);color:var(--bf-text);font:inherit;font-size:18px}
.bf-in[aria-invalid=true]{border-color:#e0705a}
.bf-err{color:#f0907c;font-size:14px;min-height:20px;margin:6px 0 0}
.bf-grid{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.bf-g2{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:720px){.bf-g3{grid-template-columns:repeat(3,minmax(0,1fr))}.bf-g5{grid-template-columns:repeat(5,minmax(0,1fr))}.bf-g4{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:719px){.bf-g5{grid-template-columns:repeat(2,minmax(0,1fr))}.bf-g4{grid-template-columns:repeat(2,minmax(0,1fr))}}
.bf-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;min-height:44px;padding:16px;border-radius:18px;cursor:pointer;color:var(--bf-text);font:inherit;
 border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.bf-card:hover{transform:translateY(-2px)}
.bf-card[aria-checked=true]{border-color:var(--bf-gold);box-shadow:0 0 0 1px var(--bf-gold),0 0 28px rgba(217,164,65,.28);background:rgba(217,164,65,.09)}
.bf-card b{font-family:var(--f-disp,'Barlow Condensed',sans-serif);text-transform:uppercase;font-size:22px;letter-spacing:.03em}
.bf-card span{color:var(--bf-muted);font-size:15px;line-height:1.35}
.bf-ico{width:64px;height:64px;fill:none;stroke:var(--bf-gold);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.bf-mini{width:100%;height:auto;aspect-ratio:1;border-radius:12px;display:block}
.bf-bars{display:grid;grid-template-columns:auto repeat(5,10px);gap:3px;align-items:center;font-size:12px;color:var(--bf-muted);letter-spacing:.06em;text-transform:uppercase}
.bf-bars i{height:6px;border-radius:3px;background:rgba(255,255,255,.14)}.bf-bars i.on{background:var(--bf-gold)}
.bf-foot{display:flex;justify-content:space-between;gap:12px;padding:12px 20px 18px}
.bf-btn{min-height:52px;padding:0 26px;border-radius:999px;border:1px solid var(--bf-gold);background:transparent;color:var(--bf-gold2);font:600 16px var(--f-body,Barlow,sans-serif);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.bf-btn.solid{background:linear-gradient(180deg,var(--bf-gold2),var(--bf-gold));color:#17150F;border-color:transparent}
.bf-btn[disabled]{opacity:.35;cursor:not-allowed}
.bf-btn[hidden],.bf-foot[hidden]{display:none}
.bf-dlg :focus-visible{outline:2px solid var(--bf-gold2);outline-offset:3px}
.bf-res{display:grid;gap:18px;grid-template-columns:minmax(0,1fr);align-items:center;padding:16px;border-radius:20px;background:radial-gradient(ellipse at 50% 30%,rgba(217,164,65,.28),rgba(217,164,65,0) 70%)}
@media (min-width:720px){.bf-res{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}}
.bf-logo{width:100%;max-width:340px;height:auto;aspect-ratio:1;border-radius:20px;border:1px solid rgba(255,255,255,.14);display:block;margin:0 auto;transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.bf-logo.bf-pre{transform:scale(.9)}
.bf-t:focus{outline:none}
.bf-pote{max-width:380px;margin:0 auto;transition:opacity .6s ease .15s,transform .6s ease .15s}
.bf-pote svg{width:100%;height:auto;display:block}
.bf-sim{width:64px;height:64px;display:block;margin-bottom:4px}
.bf-slog{font-family:var(--f-disp,'Barlow Condensed',sans-serif);text-transform:uppercase;font-size:clamp(24px,4.5vw,34px);line-height:1.05;margin:18px 0 8px;color:var(--bf-gold2)}
.bf-why{margin:6px 0 0;padding:0;list-style:none;display:grid;gap:6px}
.bf-why li{padding-left:18px;position:relative;color:var(--bf-muted);font-size:15px}
.bf-why li::before{content:"";position:absolute;left:0;top:.6em;width:7px;height:7px;background:var(--bf-gold);transform:rotate(45deg)}
.bf-why h3{font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin:18px 0 8px;color:var(--bf-text)}
.bf-acts{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}
.bf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:640px){
 .bf-dlg{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:0;margin:0}
 .bf-foot .bf-btn,.bf-acts .bf-btn{flex:1 1 100%}.bf-foot .bf-btn{flex:1}
}
@media (prefers-reduced-motion:reduce){.bf-dlg *,.bf-dlg *::before{transition:none!important;animation:none!important}}
`;

  /* ---------- estado e referências ---------- */
  let dlg, corpo, num, barra, voltarBtn, avancarBtn, aviso, opts, s, passo;

  function montar() {
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    dlg = document.createElement("dialog");
    dlg.className = "bf-dlg";
    dlg.setAttribute("aria-labelledby", "bf-titulo");
    dlg.innerHTML = `<div class="bf-top"><span class="bf-num"></span><div class="bf-bar" aria-hidden="true"><i></i></div>
      <button type="button" class="bf-x" data-acao="fechar" aria-label="Fechar">&times;</button></div>
      <div class="bf-body bf-anim"></div>
      <div class="bf-foot"><button type="button" class="bf-btn" data-acao="voltar">Voltar</button>
      <button type="button" class="bf-btn solid" data-acao="avancar">Avançar</button></div>
      <div class="bf-sr" aria-live="polite"></div>`;
    document.body.appendChild(dlg);
    corpo = dlg.querySelector(".bf-body");
    num = dlg.querySelector(".bf-num");
    barra = dlg.querySelector(".bf-bar i");
    voltarBtn = dlg.querySelector('[data-acao="voltar"]');
    avancarBtn = dlg.querySelector('[data-acao="avancar"]');
    aviso = dlg.querySelector(".bf-sr");
    dlg.addEventListener("click", aoClicar);
    dlg.addEventListener("keydown", aoTeclar);
    dlg.addEventListener("input", aoDigitar);
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // clique no fundo escuro
  }

  /* ---------- telas ---------- */
  const cartao = (grupo, id, html) => {
    const sel = s[grupo] === id;
    const primeiro = !s[grupo] && html.first;
    return `<button type="button" role="radio" class="bf-card" data-grupo="${grupo}" data-id="${id}" aria-checked="${sel}" tabindex="${sel || primeiro ? 0 : -1}">${html.txt}</button>`;
  };
  const grade = (grupo, cls, itens) => `<div class="bf-grid ${cls}" role="radiogroup" aria-labelledby="bf-titulo">${itens.map((it, i) => cartao(grupo, it.id, { txt: it.html, first: i === 0 })).join("")}</div>`;
  const barras = (rot, n) => `<span class="bf-bars">${rot}${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

  const TELAS = [
    {
      titulo: "Qual é o nome da sua barbearia?", sub: "É o que vai no logotipo e no pote.",
      html: () => `<label class="bf-lbl" for="bf-nome">Nome</label>
        <input class="bf-in" id="bf-nome" maxlength="28" autocomplete="off" value="${escHTML(s.nome)}" placeholder="Ex.: Barbearia do Zé">
        <label class="bf-lbl" for="bf-cid">Cidade ou bairro (opcional)</label>
        <input class="bf-in" id="bf-cid" maxlength="18" autocomplete="off" value="${escHTML(s.cidade)}" placeholder="Ex.: Savassi">
        <p class="bf-err" id="bf-err" role="alert"></p>`,
      valido: () => s.nome.trim().length > 0, foco: "#bf-nome"
    },
    {
      titulo: "Como é a sua casa?", sub: "Escolha a que mais parece com a sua.",
      html: () => grade("estilo", "bf-g3", ESTILOS.map(e => ({ id: e.id, html: `<svg class="bf-ico" viewBox="0 0 64 64" aria-hidden="true">${SVG_ESTILO[e.id]}</svg><b>${e.nome}</b><span>${e.frase}</span>` }))),
      valido: () => !!s.estilo
    },
    {
      titulo: "Qual símbolo combina com a sua casa?", sub: "Vai no logotipo, na tampa e na tarja do pote.",
      html: () => grade("simbolo", "bf-g3", SIMBOLOS.map(x => ({ id: x.id, html: `<canvas class="bf-sim" width="160" height="160" data-simbolo="${x.id}" aria-hidden="true"></canvas><b>${x.nome}</b><span>${x.frase}</span>` }))),
      valido: () => !!s.simbolo,
      depois: () => corpo.querySelectorAll(".bf-sim").forEach(cv => {
        const c = cv.getContext("2d");
        if (cv.dataset.simbolo === "nenhum") { c.fillStyle = "#F0C46A"; c.font = "700 44px 'Barlow Condensed',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Aa", 80, 82); return; }
        if (window.desenharIcone) window.desenharIcone(c, cv.dataset.simbolo, 80, 80, 112, "#F0C46A", 7);
      })
    },
    {
      titulo: "Qual é o clima do ambiente?", sub: "As cores do logotipo e do rótulo seguem o seu clima.",
      html: () => grade("tema", "bf-g5", TEMAS.map(t => ({ id: t.id, html: `<canvas class="bf-mini" width="160" height="160" data-tema="${t.id}" aria-hidden="true"></canvas><b>${t.nome}</b><span>${CLIMA[t.id]}</span>` }))),
      valido: () => !!s.tema,
      depois: () => corpo.querySelectorAll(".bf-mini").forEach(cv => pintarLogo(cv, marcaAtual({ tema: cv.dataset.tema, estilo: s.estilo || "classico" }), { bg: "tema" }))
    },
    {
      titulo: "Qual corte mais sai da sua cadeira?", sub: "Define a pomada principal da sua linha.",
      html: () => grade("pomada", "bf-g3", POMADAS.map(p => ({ id: p.id, html: `<b>${p.nome}</b><span>${CORTE[p.id][0].toUpperCase() + CORTE[p.id].slice(1)}.</span>${barras("Fixação", p.fix)}${barras("Brilho", p.brilho)}` }))),
      valido: () => !!s.pomada
    },
    {
      titulo: "Quem mais senta na sua cadeira?", sub: "Muda o tom do slogan, não o desenho.",
      html: () => grade("publico", "bf-g4", PUBLICOS.map(p => ({ id: p.id, html: `<b>${p.nome}</b><span>${p.frase}</span>` }))),
      valido: () => !!s.publico
    }
  ];

  // marca montada com as respostas até agora (o logo vem do estilo)
  function marcaAtual(extra) {
    const d = Object.assign({}, s, extra);
    const est = ESTILOS.find(e => e.id === d.estilo) || ESTILOS[1];
    return { nome: nomeBonito(d.nome) || "Sua barbearia", cidade: (d.cidade || "").trim().toUpperCase() || "BARBEARIA", logo: est.logo, tema: d.tema || "black", pomada: d.pomada || "pasta", simbolo: d.simbolo || "nenhum" };
  }

  function entrar(el) { // entrada animada só com transform e opacity
    el.classList.add("bf-pre");
    void el.offsetWidth;
    el.classList.remove("bf-pre");
  }

  function irPara(n) {
    passo = n;
    const resultado = n >= TOTAL;
    num.textContent = resultado ? "PRONTO" : `${String(n + 1).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;
    barra.style.transform = `scaleX(${resultado ? 1 : (n + 1) / TOTAL})`;
    dlg.querySelector(".bf-foot").hidden = resultado;
    voltarBtn.hidden = n === 0;
    avancarBtn.textContent = n === TOTAL - 1 ? "Ver minha base" : "Avançar";
    if (resultado) corpo.innerHTML = telaResultado();
    else {
      const t = TELAS[n];
      corpo.innerHTML = `<h2 class="bf-t" id="bf-titulo" tabindex="-1">${t.titulo}</h2><p class="bf-s">${t.sub}</p>${t.html()}`;
      if (t.depois) t.depois();
      avancarBtn.disabled = !t.valido();
    }
    aviso.textContent = resultado ? "Sua base de marca está pronta." : `Pergunta ${n + 1} de ${TOTAL}. ${TELAS[n].titulo}`;
    entrar(corpo);
    corpo.scrollTop = 0;
    if (resultado) {
      pintarResultado();
      corpo.querySelector("#bf-titulo").focus();
    } else {
      const alvo = TELAS[n].foco ? corpo.querySelector(TELAS[n].foco) : corpo.querySelector('.bf-card[tabindex="0"]');
      (alvo || corpo.querySelector("#bf-titulo")).focus();
    }
  }

  /* ---------- resultado ---------- */
  function resultadoMarca() {
    const m = marcaAtual();
    m.vibe = s.estilo; m.publico = s.publico; m.slogan = slogan(s.estilo, s.publico, m.nome);
    return m;
  }
  function telaResultado() {
    const m = resultadoMarca(), est = ESTILOS.find(e => e.id === s.estilo), t = TEMAS.find(x => x.id === s.tema);
    const p = POMADAS.find(x => x.id === s.pomada), pub = PUBLICOS.find(x => x.id === s.publico);
    const sim = SIMBOLOS.find(x => x.id === s.simbolo);
    const porques = [est.porque, sim.id === "nenhum" ? "Só o nome, porque você prefere uma marca limpa, sem desenho." : `${sim.nome} como símbolo: ${sim.frase.toLowerCase().replace(/\.$/, "")}.`, `${t.nome}, porque o clima da sua casa é ${CLIMA[t.id]}.`, `${p.nome} como pomada principal, porque o que mais sai da sua cadeira é ${CORTE[p.id]}.`, `Slogan no tom de quem mais senta na sua cadeira: ${pub.nome.toLowerCase()}.`];
    return `<h2 class="bf-t" id="bf-titulo" tabindex="-1">Sua base de marca</h2><p class="bf-s">Um rascunho feito com as suas respostas. O designer refina no pedido real.</p>
      <div class="bf-res"><canvas class="bf-logo bf-pre" width="840" height="840" role="img" aria-label="Logotipo de ${escHTML(m.nome)}"></canvas>
      <div class="bf-pote bf-anim bf-pre">${embalagem("pote", m, { pomada: p, largura: 460 })}</div></div>
      <p class="bf-slog">${escHTML(m.slogan)}</p>
      <div class="bf-why"><h3>Por que escolhemos isso</h3><ul class="bf-why">${porques.map(x => `<li>${escHTML(x)}</li>`).join("")}</ul></div>
      <div class="bf-acts"><button type="button" class="bf-btn solid" data-acao="aplicar">Aplicar no pote</button>
      ${opts.onSimular ? '<button type="button" class="bf-btn" data-acao="simular">Simular pedido com esta base</button>' : ""}
      <button type="button" class="bf-btn" data-acao="refazer">Refazer</button></div>`;
  }
  function pintarResultado() { // desenha uma vez só; a entrada é transição de CSS
    const cv = corpo.querySelector(".bf-logo"), pote = corpo.querySelector(".bf-pote");
    pintarLogo(cv, resultadoMarca(), { bg: "tema" });
    requestAnimationFrame(() => { cv.classList.remove("bf-pre"); pote.classList.remove("bf-pre"); }); // um quadro só, sem loop
  }

  function aplicar(simular) {
    const m = Object.assign({}, MARCA.load(), resultadoMarca());
    MARCA.save(m);
    window.dispatchEvent(new CustomEvent("stars:marca", { detail: m }));
    if (opts.onAplicar) opts.onAplicar(m);
    dlg.close();
    if (simular && opts.onSimular) opts.onSimular();
  }

  /* ---------- eventos ---------- */
  function avancar() {
    if (passo >= TOTAL || !TELAS[passo].valido()) {
      const err = corpo.querySelector("#bf-err"), inp = corpo.querySelector("#bf-nome");
      if (err && passo === 0) { err.textContent = "Digite o nome da barbearia para continuar."; inp.setAttribute("aria-invalid", "true"); inp.focus(); }
      return;
    }
    irPara(passo + 1);
  }
  function aoClicar(e) {
    const card = e.target.closest(".bf-card");
    if (card) return escolher(card);
    const b = e.target.closest("[data-acao]");
    if (!b) return;
    const a = b.dataset.acao;
    if (a === "fechar") dlg.close();
    else if (a === "voltar") irPara(passo - 1);
    else if (a === "avancar") avancar();
    else if (a === "aplicar") aplicar(false);
    else if (a === "simular") aplicar(true);
    else if (a === "refazer") { s = estadoInicial(); irPara(0); }
  }
  function escolher(card) {
    s[card.dataset.grupo] = card.dataset.id;
    card.parentElement.querySelectorAll(".bf-card").forEach(c => {
      const on = c === card;
      c.setAttribute("aria-checked", on);
      c.tabIndex = on ? 0 : -1;
    });
    avancarBtn.disabled = !TELAS[passo].valido();
  }
  function aoDigitar(e) {
    if (e.target.id === "bf-nome") { s.nome = e.target.value; e.target.removeAttribute("aria-invalid"); corpo.querySelector("#bf-err").textContent = ""; }
    else if (e.target.id === "bf-cid") s.cidade = e.target.value;
    else return;
    avancarBtn.disabled = !TELAS[passo].valido();
  }
  function aoTeclar(e) {
    if (e.key === "Enter" && e.target.classList.contains("bf-in")) { e.preventDefault(); avancar(); return; }
    const card = e.target.closest && e.target.closest(".bf-card");
    const sentido = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!card || !sentido) return;
    e.preventDefault();
    const todos = [...card.parentElement.querySelectorAll(".bf-card")];
    const prox = todos[(todos.indexOf(card) + sentido + todos.length) % todos.length];
    escolher(prox);
    prox.focus();
  }

  const estadoInicial = () => ({ nome: "", cidade: "", estilo: "", simbolo: "", tema: "", pomada: "", publico: "" });

  window.Briefing = {
    abrir(o) {
      opts = o || {};
      if (!dlg) montar();
      s = estadoInicial();
      const n = opts.marca && opts.marca.nome && opts.marca.nome.trim();
      if (n) s.nome = n.slice(0, 28);
      irPara(0);
      if (!dlg.open) dlg.showModal();
      const alvo = corpo.querySelector("#bf-nome"); // showModal pode ter movido o foco
      if (alvo) alvo.focus();
    },
    _interno: { SLOGANS, ESTILOS, PUBLICOS, nomeBonito, slogan } // usado só pelo teste em Node
  };
})();
