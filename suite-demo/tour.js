// ============================================================
// UP Co. Suite — Tour guiado da demonstração
// ============================================================
// Carregado por nav.js só quando DEMO_MODE = true.
// Painel flutuante que percorre os 11 módulos, destaca o ponto
// importante de cada tela e muda de página sozinho.
// Também: botões "Tour guiado" / "Restaurar dados" no menu e
// bloqueio de WhatsApp (na demo nada é enviado a ninguém).
// ============================================================
(function () {
  if (typeof DEMO_MODE === 'undefined' || !DEMO_MODE) return;

  const KEY = 'upco_tour_step';
  const page = location.pathname.split('/').pop() || 'index.html';
  const leadTab = n => `switchTab('${n}', document.querySelectorAll('.lead-tab')[${['conversas', 'contatos', 'pipeline'].indexOf(n)}])`;

  // page: arquivo · sel: o que destacar · run: o que fazer ao entrar no passo
  const STEPS = [
    { page: 'up-dash.html', title: 'Bem-vindo à UP Co. Suite',
      text: 'Você está vendo a suíte de uma empresa <b>fictícia</b>: o <b>Studio Prisma</b>, escritório de arquitetura com 7 pessoas e cerca de R$ 170 mil/mês. É o perfil de PME de serviços que a UP Co. atende. Tudo aqui funciona — dá para clicar, cadastrar e editar.' },
    { page: 'up-dash.html', sel: '#gos-num', title: 'UP·Dash — a semana em uma tela',
      text: 'O dono abre uma tela só. O <b>Health Score</b> é calculado com os dados reais dos outros módulos — não é número digitado.' },
    { page: 'up-dash.html', sel: '#kpis-grid', title: 'Indicadores que importam',
      text: 'Receita do mês contra a meta, pipeline aberto e projetos em dia. Cada número vem do módulo de origem (Vault, Lead e Flow).' },
    { page: 'up-dash.html', sel: '#btn-narrative', title: 'Mensagem da semana com IA',
      text: 'Clique no botão destacado: a IA escreve a mensagem que o consultor envia à dona, usando só os números da semana.' },
    { page: 'up-lead.html', sel: '#conv-items-list', run: leadTab('conversas'), title: 'UP·Lead — todas as conversas num lugar',
      text: 'WhatsApp, Instagram, formulário e indicação entram aqui com temperatura e score. Clique em uma conversa: a IA sugere a resposta e o próximo passo.' },
    { page: 'up-lead.html', sel: '#pipeline-board', run: leadTab('pipeline'), title: 'Funil de vendas',
      text: 'Cada proposta tem etapa, valor e data do último movimento. Proposta parada vira alerta automático no UP·Voice.' },
    { page: 'up-post.html', sel: '#visao-rankings', run: "switchTab('visao')", title: 'UP·Post — o que funciona no Instagram',
      text: 'Cada post é comparado com o normal <b>da própria conta</b>. Aqui fica claro: "antes e depois" rende muito mais que "bastidor".' },
    { page: 'up-post.html', sel: '#vendas-tbody', run: "switchTab('vendas')", title: 'Qual post gerou venda',
      text: 'Cada post tem um código (P-016). Quando o cliente chega no WhatsApp com o código, a venda é atribuída ao post. Curtida vira receita mensurável.' },
    { page: 'up-vault.html', sel: '#card-saldo', title: 'UP·Vault — caixa em tempo real',
      text: 'Saldo, receitas, despesas e resultado do mês, em regime de caixa. A dona deixa de esperar o contador para saber como foi o mês.' },
    { page: 'up-vault.html', sel: '#meta-bar', title: 'Meta do mês e contas a pagar',
      text: 'Quanto falta para a meta e o que vence nos próximos 7 dias. Se uma conta vencer sem saldo, o Voice avisa antes.' },
    { page: 'up-flow.html', sel: '#projects-list', after: "toggleProject('p1')", title: 'UP·Flow — projetos e obras',
      text: 'Status calculado pelo prazo: ninguém consegue esconder atraso. Veja a <b>Casa Fontes</b> atrasada, com o gargalo e a ação sugerida.' },
    { page: 'up-team.html', sel: '#members-grid', title: 'UP·Team — a equipe na semana',
      text: 'Tarefas concluídas, abertas, atrasos e ausências por pessoa. O relatório da IA aponta padrões sem virar cobrança.' },
    { page: 'up-base.html', sel: '#base-list', after: "selectDoc('d3')", title: 'UP·Base — o jeito de fazer, escrito',
      text: 'SOPs e políticas da empresa. O conhecimento sai da cabeça da dona e fica disponível para a equipe.' },
    { page: 'up-core.html', sel: '#processes-list', after: "toggleProcess('bp1')", title: 'UP·Core — processos medidos',
      text: 'Cada processo crítico tem tempo padrão, tempo real e conformidade. Ex.: do primeiro contato à proposta caiu de 15 para 9 dias.' },
    { page: 'up-gos.html', sel: '#dimensions-list', title: 'UP·GOS — o Health Score explicado',
      text: 'Financeiro, comercial, operacional, equipe e processos, com pesos fixos e regras claras. Sem nota inventada: dimensão sem dado sai da conta.' },
    { page: 'up-gos.html', sel: '#historico-list', title: 'Evolução semana a semana',
      text: 'Uma foto por semana. O Studio Prisma saiu de <b>55</b> para a casa dos <b>70</b> em 8 semanas de uso.' },
    { page: 'up-mind.html', sel: '#btn-run', title: 'UP·Mind — o analista da semana',
      text: 'Clique no botão destacado: a IA cruza todos os módulos e as próprias análises anteriores, e aponta padrões que se repetem.' },
    { page: 'up-voice.html', sel: '#btn-check', title: 'UP·Voice — a suíte avisa antes',
      text: 'Clique em <b>Verificar agora</b>. Regras objetivas detectam lead quente esfriando, proposta parada, conta sem saldo e padrão de atraso.' },
    { page: 'up-voice.html', sel: '#alerts-feed', title: 'Humano no circuito',
      text: 'Cada alerta vira uma mensagem de WhatsApp pronta. O consultor da UP Co. aprova antes de chegar à dona. Na demonstração nada é enviado.' },
    { page: 'up-dash.html', title: 'Isso é a UP Co. Suite',
      text: '11 módulos, uma base de dados, um Health Score. A UP Co. configura, opera junto no começo e a empresa ganha autonomia. Fique à vontade para explorar — <b>Restaurar dados</b>, no menu, volta tudo ao início.' },
  ];

  const css = `
    .tour-panel { position:fixed; right:24px; bottom:24px; width:360px; max-width:calc(100vw - 32px); z-index:10000;
      background:var(--bg2); border:1px solid var(--teal); border-radius:12px; padding:18px 20px 16px;
      box-shadow:0 12px 40px rgba(0,0,0,.6); color:var(--text); animation:tourIn .25s ease; }
    @keyframes tourIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
    .tour-pill { width:auto; padding:10px 16px; font:inherit; font-size:12px; color:var(--teal); cursor:pointer; border-radius:20px; }
    .tour-min { all:unset; position:absolute; top:10px; right:12px; width:24px; height:24px; text-align:center; line-height:22px;
      font-size:18px; color:var(--muted); cursor:pointer; border-radius:4px; }
    .tour-min:hover, .tour-min:focus-visible { color:var(--text); background:var(--bg3); }
    .tour-step { font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--teal); margin-bottom:6px; }
    .tour-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; margin-bottom:8px; }
    .tour-text { font-size:13px; line-height:1.55; color:var(--muted); }
    .tour-text b { color:var(--text); font-weight:600; }
    .tour-bar { height:3px; background:var(--bg3); border-radius:2px; margin:14px 0 12px; overflow:hidden; }
    .tour-bar span { display:block; height:100%; background:var(--teal); transition:width .3s; }
    .tour-actions { display:flex; gap:8px; justify-content:space-between; align-items:center; }
    .tour-hl { outline:2px solid var(--teal) !important; outline-offset:4px; border-radius:6px; animation:tourPulse 1.6s ease-in-out infinite; }
    @keyframes tourPulse { 50% { outline-color:transparent; } }
    .tour-side { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
    .tour-side button { all:unset; cursor:pointer; font-size:12px; color:var(--muted); padding:6px 10px; border:1px solid var(--border); border-radius:6px; text-align:center; }
    .tour-side button:hover, .tour-side button:focus-visible { color:var(--text); border-color:var(--teal); }
    .tour-side button.primary { color:var(--teal); border-color:var(--teal); }
    @media (max-width:640px) { .tour-panel { right:16px; left:16px; bottom:16px; width:auto; } }`;

  const getStep = () => { try { const v = sessionStorage.getItem(KEY); return v == null ? null : Number(v); } catch { return null; } };
  const setStep = n => { try { n == null ? sessionStorage.removeItem(KEY) : sessionStorage.setItem(KEY, String(n)); } catch { /* sem storage: o tour só não sobrevive à troca de página */ } };

  function clearHighlight() { document.querySelectorAll('.tour-hl').forEach(el => el.classList.remove('tour-hl')); }

  // Os módulos desenham a tela de forma assíncrona: espera o elemento aparecer
  function waitFor(sel, ms = 4000) {
    return new Promise(resolve => {
      const t0 = Date.now();
      (function poll() {
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) return resolve(el);
        if (Date.now() - t0 > ms) return resolve(el);
        setTimeout(poll, 120);
      })();
    });
  }

  async function show(i) {
    const s = STEPS[i];
    if (!s) return end();
    setStep(i);
    if (s.page !== page) { location.href = s.page; return; }

    clearHighlight();
    if (s.run) { try { new Function(s.run)(); } catch (e) { console.warn('tour: ação do passo falhou', e); } }
    if (s.sel) {
      const el = await waitFor(s.sel);
      // after: roda com a lista já desenhada (ex.: abrir o projeto atrasado)
      if (s.after) { try { new Function(s.after)(); } catch (e) { console.warn('tour: ação do passo falhou', e); } }
      if (el) { el.classList.add('tour-hl'); el.scrollIntoView({ behavior: 'smooth', block: el.offsetHeight > innerHeight * 0.6 ? 'start' : 'center' }); }
    }

    renderPanel(i);
  }

  // Minimizado, o painel vira uma pílula — libera a tela para clicar e mostrar
  const isMin = () => { try { return sessionStorage.getItem(KEY + '_min') === '1'; } catch { return false; } };
  const setMin = v => { try { v ? sessionStorage.setItem(KEY + '_min', '1') : sessionStorage.removeItem(KEY + '_min'); } catch { /* ok */ } };

  function renderPanel(i) {
    const s = STEPS[i];
    document.querySelector('.tour-panel')?.remove();
    if (isMin()) {
      const pill = document.createElement('button');
      pill.className = 'tour-panel tour-pill';
      pill.textContent = `▲ Tour guiado · ${i + 1} de ${STEPS.length}`;
      pill.addEventListener('click', () => { setMin(false); renderPanel(i); });
      document.body.appendChild(pill);
      return;
    }
    const last = i === STEPS.length - 1;
    const panel = document.createElement('div');
    panel.className = 'tour-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Tour guiado');
    panel.innerHTML = `
      <button class="tour-min" data-act="min" title="Minimizar" aria-label="Minimizar o tour">–</button>
      <div class="tour-step">Tour guiado · ${i + 1} de ${STEPS.length}</div>
      <div class="tour-title">${s.title}</div>
      <div class="tour-text">${s.text}</div>
      <div class="tour-bar"><span style="width:${((i + 1) / STEPS.length) * 100}%"></span></div>
      <div class="tour-actions">
        <button class="btn btn-ghost btn-sm" data-act="end">Sair do tour</button>
        <span style="display:flex;gap:8px;">
          ${i > 0 ? '<button class="btn btn-ghost btn-sm" data-act="prev">← Voltar</button>' : ''}
          <button class="btn btn-primary btn-sm" data-act="next">${last ? 'Concluir ✓' : 'Próximo →'}</button>
        </span>
      </div>`;
    panel.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'next') last ? end() : show(i + 1);
      if (act === 'prev') show(i - 1);
      if (act === 'end') end();
      if (act === 'min') { setMin(true); renderPanel(i); }
    });
    document.body.appendChild(panel);
    panel.querySelector('[data-act="next"]').focus({ preventScroll: true });
  }

  function end() {
    setStep(null);
    setMin(false);
    clearHighlight();
    document.querySelector('.tour-panel')?.remove();
  }

  // Apaga só os dados desta demonstração; demo-data.js recria tudo no próximo carregamento
  function restoreData() {
    const prefix = `upco_${CLIENT_CONFIG.empresa_id}_`;
    try {
      Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
    } catch (e) { window.toast?.('Não foi possível limpar os dados deste navegador', 'error'); return; }
    location.reload();
  }

  // Na demonstração nenhum WhatsApp é aberto de verdade
  const nativeOpen = window.open.bind(window);
  window.open = function (url, ...rest) {
    if (String(url).includes('wa.me')) {
      window.toast?.('Demonstração: aqui o WhatsApp abriria com a mensagem pronta para enviar.', 'info');
      return null;
    }
    return nativeOpen(url, ...rest);
  };

  // No link online o navegador recusa confirm() na hora (devolve false sem mostrar nada).
  // Resposta instantânea = bloqueio, não "Cancelar" de uma pessoa: na demo, segue com a ação.
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = function (msg) {
    const t0 = Date.now();
    const ok = nativeConfirm(msg);
    return ok || Date.now() - t0 < 50;
  };

  function mountSidebarButtons() {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer || footer.querySelector('.tour-side')) return;
    const box = document.createElement('div');
    box.className = 'tour-side';
    box.innerHTML = '<button class="primary" data-act="tour">▶ Tour guiado</button><button data-act="reset">↺ Restaurar dados</button>';
    box.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'tour') { setMin(false); show(0); }
      if (act === 'reset') {
        // confirmação na própria tela: o link online bloqueia janelas de confirmação
        const btn = e.target.closest('[data-act]');
        if (btn.dataset.armed) return restoreData();
        btn.dataset.armed = '1';
        btn.textContent = 'Clique de novo para restaurar';
        setTimeout(() => { delete btn.dataset.armed; btn.textContent = '↺ Restaurar dados'; }, 4000);
      }
    });
    footer.prepend(box);
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    mountSidebarButtons();
    if (new URLSearchParams(location.search).has('tour')) setStep(0);
    const i = getStep();
    if (i != null) show(i);
  }

  // nav.js monta o menu no DOMContentLoaded; o tour entra logo depois
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  else setTimeout(init, 0);
})();
