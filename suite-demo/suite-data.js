// ============================================================
// UP Co. Suite — Camada de dados compartilhada
// ============================================================
// Carregado por todos os módulos, depois de config.js e nav.js.
//   window.store      → persistência (servidor em operação, localStorage em demo)
//   window.callClaude → IA (via servidor; a chave nunca vem ao navegador)
//   window.Suite      → utilitários + métricas que cruzam os módulos
//                       (financeiro, health score, pulso semanal, regras do UP·Voice)
// ============================================================

(function initSuiteData() {
  const EMP = CLIENT_CONFIG.empresa_id;
  const pad = n => String(n).padStart(2, '0');

  // ── Utilitários ───────────────────────────────────────────
  const U = {
    // Todo texto digitado pelo usuário (ou vindo de um lead) passa por aqui antes de virar HTML
    esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; },
    // Data local — toISOString() devolve UTC e vira "amanhã" depois das 21h no Brasil
    today() { return U.iso(new Date()); },
    parseDate(s) { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); },
    addDays(isoDate, n) { const d = U.parseDate(isoDate); d.setDate(d.getDate() + n); return U.iso(d); },
    daysBetween(a, b) { return Math.round((U.parseDate(b) - U.parseDate(a)) / 864e5); },
    hoursSince(ts) { return (Date.now() - new Date(ts).getTime()) / 36e5; },
    nowTime() { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); },
    fmtDate(s) { if (!s) return '—'; const [y, m, d] = String(s).slice(0, 10).split('-'); return `${d}/${m}/${y}`; },
    fmtDateTime(ts) { return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); },
    fmtBRL(v) { return 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); },
    fmtK(v) { v = Number(v) || 0; return Math.abs(v) >= 1000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k' : U.fmtBRL(v); },
    monthKey(isoDate) { return String(isoDate || U.today()).slice(0, 7); },
    monthLabel(key) { const [y, m] = key.split('-').map(Number); const s = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); },
    isoWeek(isoDate) {
      const src = U.parseDate(isoDate || U.today());
      const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - day);
      const year = d.getUTCFullYear();
      const week = Math.ceil(((d - Date.UTC(year, 0, 1)) / 864e5 + 1) / 7);
      return `${year}-W${pad(week)}`;
    },
    weekRange(isoDate) {
      const base = isoDate || U.today();
      const day = U.parseDate(base).getDay() || 7;
      const start = U.addDays(base, 1 - day);
      return { start, end: U.addDays(start, 6) };
    },
    weekLabel(week) { const [y, w] = week.split('-W'); return `Semana ${Number(w)} · ${y}`; },
    uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    clone(v) { return JSON.parse(JSON.stringify(v)); },
    // A IA às vezes embrulha o JSON em ```json ... ``` ou em texto — extrai o objeto
    parseAIJson(text) {
      const s = String(text);
      try { return JSON.parse(s); } catch { /* tenta extrair */ }
      const start = s.indexOf('{'), end = s.lastIndexOf('}');
      if (start === -1 || end <= start) throw new Error('A IA não devolveu um JSON válido');
      return JSON.parse(s.slice(start, end + 1));
    },
    // Link "click to chat" do WhatsApp — funciona sem Evolution API
    waLink(phone, text) {
      let digits = String(phone || '').replace(/\D/g, '');
      if (!digits) return null;
      if (digits.length <= 11) digits = '55' + digits; // sem DDI → Brasil
      return `https://wa.me/${digits}` + (text ? `?text=${encodeURIComponent(text)}` : '');
    },
  };

  // ── Comunicação com o servidor ────────────────────────────
  function showOfflineBanner() {
    if (document.getElementById('suite-offline')) return;
    const el = document.createElement('div');
    el.id = 'suite-offline';
    el.className = 'suite-banner';
    el.innerHTML = '<strong>Servidor da suíte fora do ar.</strong> Nada será salvo. Abra a pasta da suíte, rode <code>npm start</code> e acesse por <code>http://localhost:3000</code>.';
    document.body.appendChild(el);
  }

  async function api(path, options) {
    let res;
    try {
      res = await fetch(path, options);
    } catch (e) {
      showOfflineBanner();
      throw new Error('Servidor da suíte fora do ar');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 409) throw new Error(body.error || `Erro ${res.status}`);
    return { status: res.status, body };
  }

  // ── Migração do que já foi digitado na v1.5 (localStorage) ─
  // A v1.5 gravava leads/pipeline/transações no navegador, junto com os
  // registros de demonstração. Na primeira leitura, traz o que é real.
  const DEMO_IDS = new Set(['l1', 'l2', 'l3', 'd1', 'd2', 'd3', 'd4', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']);
  function readLegacy(name) {
    for (const prefix of [`upco_${EMP}_`, 'upco_upco-demo_']) {
      try {
        const raw = localStorage.getItem(prefix + name);
        if (!raw) continue;
        let data = JSON.parse(raw);
        if (!Array.isArray(data)) continue;
        if (name === 'pipeline') {
          data.forEach(s => { s.deals = (s.deals || []).filter(d => !DEMO_IDS.has(d.id)); });
          if (data.some(s => s.deals.length)) return data;
        } else {
          data = data.filter(x => !DEMO_IDS.has(x.id));
          if (data.length) return data;
        }
      } catch { /* localStorage indisponível ou corrompido */ }
    }
    return null;
  }

  // ── Store ─────────────────────────────────────────────────
  const DEFAULT_STAGES = [
    { id: 'st1', nome: 'Novo',        cor: '#57999B', deals: [] },
    { id: 'st2', nome: 'Qualificado', cor: '#8B5CF6', deals: [] },
    { id: 'st3', nome: 'Proposta',    cor: '#F5A623', deals: [] },
    { id: 'st4', nome: 'Negociação',  cor: '#27AE60', deals: [] },
    { id: 'st5', nome: 'Ganho ✓',     cor: '#27AE60', deals: [] },
    { id: 'st6', nome: 'Perdido',     cor: '#E74C3C', deals: [] },
  ];
  // Coleções que não são listas simples
  const EMPTY = { pipeline: () => U.clone(DEFAULT_STAGES), voice_state: () => ({}) };
  const emptyOf = name => (EMPTY[name] ? EMPTY[name]() : []);
  const revs = {};

  const store = {
    async load(name) {
      if (DEMO_MODE) {
        const seed = (window.DEMO_SEEDS || {})[name];
        return window.localPersist.load(name, seed ? U.clone(seed) : emptyOf(name));
      }
      const { body } = await api(`/api/data/${EMP}/${name}`);
      revs[name] = body.rev || 0;
      if (body.exists) return body.data;

      const legacy = readLegacy(name);
      if (legacy) {
        await store._put(name, legacy);
        window.toast?.(`Dados de "${name}" que estavam no navegador foram trazidos para o servidor`, 'success');
        return legacy;
      }
      return emptyOf(name);
    },

    async _put(name, data) {
      const { status, body } = await api(`/api/data/${EMP}/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, rev: revs[name] || 0 }),
      });
      revs[name] = body.rev;
      return status !== 409;
    },

    // Toda alteração passa por aqui: lê a versão mais recente, aplica fn e grava.
    // Se outra aba gravou no meio do caminho (409), refaz em cima do dado novo.
    async mutate(name, fn) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const data = await store.load(name);
        const next = fn(data) ?? data;
        if (DEMO_MODE) { window.localPersist.save(name, next); return next; }
        if (await store._put(name, next)) return next;
      }
      throw new Error('Não foi possível salvar — outra aba está alterando os mesmos dados. Recarregue a página.');
    },
  };

  // ── IA ────────────────────────────────────────────────────
  let statusPromise = null;
  function aiStatus() {
    if (DEMO_MODE) return Promise.resolve({ ai: true, demo: true });
    if (!statusPromise) statusPromise = api('/api/status').then(r => r.body).catch(() => ({ ai: false, ai_reason: 'servidor fora do ar' }));
    return statusPromise;
  }

  // Em demo devolve mockResponse. Em operação chama o servidor e lança Error
  // com mensagem legível (IA não configurada, chave inválida, etc.) — quem chama trata.
  window.callClaude = async function ({ systemPrompt, userPayload, mockResponse, maxTokens }) {
    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      return mockResponse;
    }
    const { body } = await api('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemPrompt, payload: userPayload, max_tokens: maxTokens }),
    });
    return body.text;
  };

  // ── Regras de negócio compartilhadas ──────────────────────
  const isPago = t => t.status !== 'pendente';
  const sum = (list, f = x => x.valor) => list.reduce((s, x) => s + (Number(f(x)) || 0), 0);
  const OPEN_STAGES = ['st1', 'st2', 'st3', 'st4'];

  // Status do projeto é derivado — nunca fica "ativo" depois do prazo por esquecimento
  function projectStatus(p) {
    if (p.pausado) return 'pausado';
    if (p.etapas?.length && p.etapas.every(e => e.status === 'concluido')) return 'concluido';
    if (p.previsao && p.previsao < U.today()) return 'atrasado';
    return 'ativo';
  }

  function lastInteraction(lead) {
    return lead.ultima_interacao || `${lead.criado_em}T09:00:00`;
  }

  // Regime de caixa: só entra no saldo e no resultado o que foi efetivamente pago/recebido.
  // Lançamento "pendente" = conta a pagar / a receber; o campo data é o vencimento.
  function finance(transacoes, month) {
    month = month || U.monthKey();
    const today = U.today();
    const pagos = transacoes.filter(isPago);
    const pend  = transacoes.filter(t => !isPago(t));
    const noMes = t => U.monthKey(t.data) === month;
    const receitasMes = sum(pagos.filter(t => t.tipo === 'receita' && noMes(t)));
    const despesasMes = sum(pagos.filter(t => t.tipo === 'despesa' && noMes(t)));
    const contas7d = pend.filter(t => t.tipo === 'despesa' && t.data <= U.addDays(today, 7)).sort((a, b) => a.data.localeCompare(b.data));
    return {
      month,
      receitasMes,
      despesasMes,
      resultadoMes: receitasMes - despesasMes,
      saldo: (Number(CLIENT_CONFIG.saldo_inicial) || 0) + sum(pagos.filter(t => t.tipo === 'receita')) - sum(pagos.filter(t => t.tipo === 'despesa')),
      aReceber: sum(pend.filter(t => t.tipo === 'receita')),
      aPagar: sum(pend.filter(t => t.tipo === 'despesa')),
      contas7d,
      contas7dTotal: sum(contas7d),
      meta: Number(CLIENT_CONFIG.meta_mrr) || 0,
    };
  }

  function pipelineStats(pipeline) {
    const stage = id => pipeline.find(s => s.id === id)?.deals || [];
    const abertos = pipeline.filter(s => OPEN_STAGES.includes(s.id)).flatMap(s => s.deals.map(d => ({ ...d, stage_id: s.id, stage_nome: s.nome })));
    const since = d => d.movido_em || d.criado_em;
    return {
      abertos,
      valorAberto: sum(abertos),
      ganhos: stage('st5'),
      perdidos: stage('st6'),
      // Proposta ou negociação sem movimento há 7+ dias
      parados: abertos.filter(d => ['st3', 'st4'].includes(d.stage_id) && since(d) && U.daysBetween(since(d).slice(0, 10), U.today()) >= 7),
    };
  }

  async function loadAll() {
    const names = ['transacoes', 'leads', 'pipeline', 'projetos', 'membros', 'processos', 'posts'];
    const values = await Promise.all(names.map(n => store.load(n)));
    return Object.fromEntries(names.map((n, i) => [n, values[i]]));
  }

  // ── UP·GOS — Health Score ─────────────────────────────────
  // Pesos: Financeiro 25% · Comercial 25% · Operacional 20% · Equipe 20% · Processos 10%
  // Dimensão sem nenhum dado fica null ("sem dados") e sai da conta — o peso é
  // redistribuído entre as demais, em vez de inventar uma nota neutra.
  const GOS_WEIGHTS = { financeiro: .25, comercial: .25, operacional: .20, equipe: .20, processos: .10 };
  const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  function gosFinanceiro(transacoes) {
    if (!transacoes.length) return null;
    const f = finance(transacoes);
    const ptsMeta   = f.meta > 0 ? clamp(f.receitasMes / f.meta, 0, 1) * 40 : 20;
    const margem    = f.receitasMes > 0 ? (f.resultadoMes / f.receitasMes) * 100 : 0;
    const ptsMargem = clamp((margem / 80) * 40, 0, 40);
    const ptsSaldo  = f.saldo > 0 ? 20 : f.saldo > -5000 ? 10 : 0;
    return Math.round(ptsMeta + ptsMargem + ptsSaldo);
  }

  function gosComercial(leads, pipeline) {
    const p = pipelineStats(pipeline);
    const ativos = leads.filter(l => l.status !== 'resolved');
    const fechados = p.ganhos.length + p.perdidos.length;
    if (!leads.length && !p.abertos.length && !fechados) return null;
    const quentes = ativos.filter(l => l.temperatura === 'quente').length;
    const ptsQuentes  = ativos.length ? Math.min(30, (quentes / ativos.length) * 100) : 0;
    const ptsConv     = fechados ? (p.ganhos.length / fechados) * 30 : 15; // sem histórico de fechamento: neutro
    const meta = Number(CLIENT_CONFIG.meta_mrr) || 0;
    const ptsPipeline = meta > 0 ? Math.min(40, (p.valorAberto / meta) * 40) : 20;
    return Math.round(ptsQuentes + ptsConv + ptsPipeline);
  }

  function gosOperacional(projetos) {
    const list = projetos.filter(p => projectStatus(p) !== 'pausado');
    if (!list.length) return null;
    const noPrazo = list.filter(p => projectStatus(p) !== 'atrasado').length;
    const ptsPrazo = (noPrazo / list.length) * 50;
    const completion = list.reduce((s, p) => s + (p.etapas?.length ? p.etapas.filter(e => e.status === 'concluido').length / p.etapas.length : 0), 0) / list.length;
    const semRetrabalho = list.filter(p => !(p.retrabalhos > 0)).length;
    return Math.round(ptsPrazo + completion * 30 + (semRetrabalho / list.length) * 20);
  }

  function gosEquipe(membros) {
    const list = membros.filter(m => m.ativo !== false);
    if (!list.length) return null;
    const perf = list.reduce((s, m) => {
      const total = (m.tarefas_concluidas || 0) + (m.tarefas_abertas || 0);
      return s + (total > 0 ? m.tarefas_concluidas / total : .5);
    }, 0) / list.length;
    const semAtraso = list.filter(m => !(m.atrasos > 0)).length;
    const ausMedia = sum(list, m => m.ausencias) / list.length;
    return Math.round(perf * 50 + (semAtraso / list.length) * 30 + Math.max(0, 20 - ausMedia * 2));
  }

  function gosProcessos(processos) {
    if (!processos.length) return null;
    const documentados = processos.filter(p => p.etapas?.length).length;
    const medidos = processos.filter(p => p.compliance != null);
    const compliance = medidos.length ? sum(medidos, p => p.compliance) / medidos.length : 50;
    const criticos = processos.filter(p => p.classificacao === 'Crítico');
    const criticosAtivos = criticos.filter(p => p.status === 'ativo').length;
    const ptsCriticos = criticos.length ? (criticosAtivos / criticos.length) * 20 : 20;
    return Math.round((documentados / processos.length) * 40 + (compliance / 100) * 40 + ptsCriticos);
  }

  function computeGOS(all) {
    const dims = {
      financeiro:  gosFinanceiro(all.transacoes),
      comercial:   gosComercial(all.leads, all.pipeline),
      operacional: gosOperacional(all.projetos),
      equipe:      gosEquipe(all.membros),
      processos:   gosProcessos(all.processos),
    };
    Object.keys(dims).forEach(k => { if (dims[k] != null) dims[k] = clamp(dims[k]); });
    const withData = Object.keys(dims).filter(k => dims[k] != null);
    const weight = withData.reduce((s, k) => s + GOS_WEIGHTS[k], 0);
    const score = withData.length ? Math.round(withData.reduce((s, k) => s + dims[k] * GOS_WEIGHTS[k], 0) / weight) : null;
    return { score, dims, cobertura: withData.length };
  }

  const gosColor  = s => s == null ? 'var(--dim)' : s >= 70 ? '#27AE60' : s >= 50 ? '#F5A623' : '#E74C3C';
  const gosStatus = s => s == null ? 'Sem dados suficientes' : s >= 70 ? 'Saudável' : s >= 50 ? 'Atenção necessária' : 'Crítico';

  // Calcula o score de agora e grava/atualiza a foto da semana corrente no histórico
  async function snapshotGOS(all) {
    all = all || await loadAll();
    const gos = computeGOS(all);
    const semana = U.isoWeek();
    let historico = await store.load('gos_historico');
    if (gos.score != null) {
      const atual = historico.find(h => h.semana === semana);
      const mudou = !atual || atual.score !== gos.score || Object.keys(gos.dims).some(k => atual[k] !== gos.dims[k]);
      if (mudou) {
        historico = await store.mutate('gos_historico', list => {
          const entry = { semana, score: gos.score, ...gos.dims, atualizado_em: new Date().toISOString() };
          const i = list.findIndex(h => h.semana === semana);
          if (i > -1) list[i] = entry; else list.push(entry);
          list.sort((a, b) => b.semana.localeCompare(a.semana));
          return list.slice(0, 104);
        });
      }
    }
    const anterior = historico.find(h => h.semana < semana) || null;
    return { ...gos, semana, historico, anterior };
  }

  // ── Pulso semanal (UP·Dash / UP·Mind) ─────────────────────
  function computePulse(all) {
    const { start, end } = U.weekRange();
    const naSemana = d => d && d.slice(0, 10) >= start && d.slice(0, 10) <= end;
    const f = finance(all.transacoes);
    const p = pipelineStats(all.pipeline);
    const pagosSemana = all.transacoes.filter(t => isPago(t) && naSemana(t.data));
    const projetos = all.projetos.map(x => ({ ...x, _status: projectStatus(x) }));
    const membros = all.membros.filter(m => m.ativo !== false);
    const fechadosMes = [...p.ganhos, ...p.perdidos].filter(d => U.monthKey(d.movido_em) === U.monthKey());
    const ganhosMes = p.ganhos.filter(d => U.monthKey(d.movido_em) === U.monthKey());
    const posts = all.posts || [];
    const attr = POST.attribution(posts, all.leads, all.pipeline);
    const atribuidos = Object.values(attr);
    return {
      semana: U.isoWeek(),
      periodo: { inicio: start, fim: end },
      conteudo: {
        posts_publicados_semana: posts.filter(p => p.status === 'publicado' && naSemana(p.publicado_em)).length,
        posts_sem_metricas: posts.filter(p => p.status === 'publicado' && !POST.hasMetrics(p)).length,
        leads_atribuidos: sum(atribuidos, a => a.leads.length),
        vendas_atribuidas: sum(atribuidos, a => a.vendas.length),
        receita_atribuida: sum(atribuidos, a => a.receita),
      },
      financeiro: {
        receitas_semana: sum(pagosSemana.filter(t => t.tipo === 'receita')),
        despesas_semana: sum(pagosSemana.filter(t => t.tipo === 'despesa')),
        saldo_atual: f.saldo, meta_mes: f.meta, realizado_mes: f.receitasMes,
        contas_a_pagar_7d: f.contas7dTotal, a_receber: f.aReceber,
      },
      comercial: {
        novos_leads: all.leads.filter(l => naSemana(l.criado_em)).length,
        leads_ativos: all.leads.filter(l => l.status !== 'resolved').length,
        leads_quentes: all.leads.filter(l => l.status !== 'resolved' && l.temperatura === 'quente').length,
        deals_abertos: p.abertos.length,
        valor_pipeline: p.valorAberto,
        propostas_paradas_7d: p.parados.length,
        ganhos_mes: ganhosMes.length,
        valor_ganho_mes: sum(ganhosMes),
        taxa_conversao_mes: fechadosMes.length ? Math.round(ganhosMes.length / fechadosMes.length * 100) : null,
      },
      operacional: {
        projetos_ativos: projetos.filter(x => ['ativo', 'atrasado'].includes(x._status)).length,
        projetos_atrasados: projetos.filter(x => x._status === 'atrasado').length,
        projetos_concluidos: projetos.filter(x => x._status === 'concluido').length,
        etapas_concluidas_semana: sum(projetos, x => (x.etapas || []).filter(e => e.status === 'concluido' && naSemana(e.concluido_em)).length),
      },
      equipe: {
        total_membros: membros.length,
        tarefas_concluidas: sum(membros, m => m.tarefas_concluidas),
        tarefas_abertas: sum(membros, m => m.tarefas_abertas),
        ausencias: sum(membros, m => m.ausencias),
        alertas: membros.filter(m => (m.atrasos || 0) + (m.ausencias || 0) > 0)
          .map(m => `${m.nome}: ${m.atrasos || 0} atraso(s), ${m.ausencias || 0} ausência(s)`),
      },
    };
  }

  // ── UP·Voice — regras determinísticas ─────────────────────
  // Cada regra devolve alertas com uma chave estável (não repete o mesmo alerta no mesmo dia).
  const VOICE_RULES = [
    { id: 'gos_drop',      nome: 'Queda de Health Score',       desc: 'GOS cai 10+ pontos em relação à semana anterior',            regra: 'Δ ≤ -10 pts',        fonte: 'UP·GOS' },
    { id: 'lead_parado',   nome: 'Lead quente parado',          desc: 'Lead "quente" em aberto sem interação há 48h ou mais',        regra: '48h sem interação',  fonte: 'UP·Lead' },
    { id: 'proposta_parada', nome: 'Proposta parada',           desc: 'Deal em Proposta/Negociação sem movimento há 7 dias ou mais', regra: '7 dias sem mover',   fonte: 'UP·Lead' },
    { id: 'conta_risco',   nome: 'Conta a vencer sem saldo',    desc: 'Contas vencidas ou que vencem até amanhã somam mais que o saldo', regra: 'saldo < contas',  fonte: 'UP·Vault' },
    { id: 'equipe_padrao', nome: 'Padrão de atraso na equipe',  desc: 'Mesmo membro com 3+ atrasos/ausências na semana',             regra: '≥ 3 ocorrências',    fonte: 'UP·Team' },
  ];

  function voiceDetect(all, gos) {
    const out = [];
    const today = U.today();
    const add = (regra, entidade, a) => out.push({ key: `${regra}:${entidade}:${today}`, regra, fonte: VOICE_RULES.find(r => r.id === regra).fonte, ...a });

    if (gos?.score != null && gos.anterior && gos.score - gos.anterior.score <= -10) {
      const dims = Object.keys(GOS_WEIGHTS).filter(k => gos.dims[k] != null && gos.anterior[k] != null);
      const pior = dims.sort((a, b) => (gos.dims[a] - gos.anterior[a]) - (gos.dims[b] - gos.anterior[b]))[0];
      add('gos_drop', gos.semana, {
        titulo: 'Health Score em queda', urgencia: 'alta', publico: 'founder',
        contexto: `O GOS caiu de ${gos.anterior.score} para ${gos.score} em relação à semana anterior${pior ? `, puxado principalmente por ${pior}` : ''}.`,
        mensagem: `Oi! O health score da ${CLIENT_CONFIG.empresa} caiu de ${gos.anterior.score} para ${gos.score} esta semana${pior ? `, principalmente por causa de ${pior}` : ''}. Vale olharmos juntos o que mudou.`,
      });
    }

    all.leads.filter(l => l.temperatura === 'quente' && l.status !== 'resolved' && U.hoursSince(lastInteraction(l)) >= 48).forEach(l => {
      const dias = Math.floor(U.hoursSince(lastInteraction(l)) / 24);
      add('lead_parado', l.id, {
        titulo: `Lead quente parado há ${dias} dia${dias !== 1 ? 's' : ''} — ${l.nome}`, urgencia: 'alta', publico: 'rafael',
        contexto: `${l.nome} (${l.canal}, score ${l.lead_score ?? '—'}) está sem interação há ${dias} dias. Próximo passo registrado: ${l.proximo_passo || 'nenhum'}.`,
        mensagem: `🔔 O lead ${l.nome} está quente e sem contato há ${dias} dias. Vale falar com ele hoje, antes que esfrie.`,
      });
    });

    pipelineStats(all.pipeline).parados.forEach(d => {
      const dias = U.daysBetween((d.movido_em || d.criado_em).slice(0, 10), today);
      add('proposta_parada', d.id, {
        titulo: `Proposta parada há ${dias} dias — ${d.titulo}`, urgencia: 'media', publico: 'rafael',
        contexto: `O deal "${d.titulo}" (${d.lead}, ${U.fmtBRL(d.valor)}) está em ${d.stage_nome} sem movimento há ${dias} dias.`,
        mensagem: `🔔 A proposta "${d.titulo}" (${U.fmtBRL(d.valor)}) está parada há ${dias} dias em ${d.stage_nome}. Vale um follow-up hoje.`,
      });
    });

    const f = finance(all.transacoes);
    const urgentes = f.contas7d.filter(t => t.data <= U.addDays(today, 1));
    const totalUrgente = sum(urgentes);
    if (urgentes.length && f.saldo < totalUrgente) {
      add('conta_risco', 'caixa', {
        titulo: 'Contas a vencer sem saldo suficiente', urgencia: 'alta', publico: 'founder',
        contexto: `${urgentes.length} conta(s) vencida(s) ou vencendo até amanhã somam ${U.fmtBRL(totalUrgente)}; o saldo atual é ${U.fmtBRL(f.saldo)}.`,
        mensagem: `Atenção: há ${U.fmtBRL(totalUrgente)} em contas vencendo até amanhã e o saldo em caixa é ${U.fmtBRL(f.saldo)}. Vale priorizar um recebimento ou renegociar um prazo hoje.`,
      });
    }

    all.membros.filter(m => m.ativo !== false && (m.atrasos || 0) + (m.ausencias || 0) >= 3).forEach(m => {
      add('equipe_padrao', m.id, {
        titulo: `Padrão de atraso — ${m.nome}`, urgencia: 'media', publico: 'founder',
        contexto: `${m.nome} acumula ${m.atrasos || 0} atraso(s) e ${m.ausencias || 0} ausência(s) nesta semana.`,
        mensagem: `Um ponto de atenção na equipe: ${m.nome} acumulou ${m.atrasos || 0} atraso(s) e ${m.ausencias || 0} ausência(s) nesta semana. Vale uma conversa 1:1 para entender o que está travando.`,
      });
    });

    return out;
  }

  // ── UP·Post — desempenho de conteúdo e atribuição ─────────
  // Todo número de desempenho é relativo à própria conta: score 1,0× = a mediana
  // dos posts publicados com métricas. Nada aqui compara com "o mercado".
  const POST = {
    FORMATOS: ['Reel', 'Carrossel', 'Imagem', 'Stories'],
    GANCHOS: ['Pergunta direta', 'Afirmação', 'Antes / depois', 'Erro comum', 'Bastidor', 'Lista / passo a passo', 'Outro'],
    CTAS: ['Salvar para depois', 'Link na bio', 'Comentar palavra', 'Chamar no WhatsApp', 'Compartilhar', 'Sem CTA'],
    OBJETIVOS: { alcance: 'Alcance', salvamentos: 'Salvamentos', compartilhamentos: 'Compartilhamentos', engajamento: 'Engajamento', visitas_perfil: 'Visitas ao perfil', leads: 'Leads atribuídos' },
    METRICAS: { alcance: 'Alcance', curtidas: 'Curtidas', comentarios: 'Comentários', salvamentos: 'Salvamentos', compartilhamentos: 'Compartilhamentos', visitas_perfil: 'Visitas ao perfil' },
    ATRIBUTOS: { gancho: 'Tipo de gancho', formato: 'Formato', tema: 'Tema', cta: 'CTA' },
    MIN_CONTA: 5,        // posts com métricas para existir um "normal da conta"
    MIN_GRUPO: 3,        // posts por grupo para entrar em ranking e previsão
    RECOMENDADO: 30,     // abaixo disso tudo é sinal fraco — a tela avisa
    FAIXAS: { acima: 'Acima', media: 'Na média', abaixo: 'Abaixo' },

    // Acha o código do post dentro de uma mensagem: "P-017", "p17", "P 017" e,
    // quando veio de um link rastreado, o ponto de contato no sufixo ("P-017-S" = stories)
    extractCode(text) {
      const m = String(text || '').match(/\bP[\s-]?(\d{1,4})(?:-([BSAD]))?\b/i);
      return m ? { codigo: 'P-' + String(parseInt(m[1], 10)).padStart(3, '0'), ponto: m[2] ? m[2].toUpperCase() : null } : null;
    },
    nextCode(posts) {
      const max = posts.reduce((n, p) => Math.max(n, parseInt(String(p.codigo || '').replace(/\D/g, ''), 10) || 0), 0);
      return 'P-' + String(max + 1).padStart(3, '0');
    },
    median(values) {
      const v = values.filter(x => x != null && !isNaN(x)).sort((a, b) => a - b);
      if (!v.length) return null;
      const mid = Math.floor(v.length / 2);
      return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
    },
    faixa(score) { return score == null ? null : score >= 1.2 ? 'acima' : score <= 0.8 ? 'abaixo' : 'media'; },
    fmtScore(score) { return score == null ? '—' : score.toFixed(1).replace('.', ',') + '×'; },
    hasMetrics(p) { return p.status === 'publicado' && p.metricas && Object.values(p.metricas).some(v => Number(v) > 0); },

    // Quem veio de qual post, e o que virou venda (deal em "Ganho ✓" do mesmo lead)
    attribution(posts, leads, pipeline) {
      const ganhos = pipeline.find(s => s.id === 'st5')?.deals || [];
      const out = {};
      posts.forEach(p => { out[p.codigo] = { leads: [], vendas: [], receita: 0, porCodigo: 0, declarado: 0 }; });
      leads.filter(l => l.post_codigo && out[l.post_codigo]).forEach(l => {
        const a = out[l.post_codigo];
        a.leads.push(l);
        l.post_origem === 'codigo' ? a.porCodigo++ : a.declarado++;
        ganhos.filter(d => d.lead_id ? d.lead_id === l.id : d.lead === l.nome).forEach(d => { a.vendas.push({ ...d, lead: l.nome }); a.receita += Number(d.valor) || 0; });
      });
      return out;
    },

    value(p, objetivo, attr) {
      if (objetivo === 'leads') return p.status === 'publicado' ? (attr[p.codigo]?.leads.length || 0) : null;
      if (!POST.hasMetrics(p)) return null;
      const m = p.metricas;
      if (objetivo === 'engajamento') return ['curtidas', 'comentarios', 'salvamentos', 'compartilhamentos'].reduce((s, k) => s + (Number(m[k]) || 0), 0);
      return Number(m[objetivo]) || 0;
    },

    // score de cada post = valor ÷ mediana da conta no objetivo escolhido
    scores(posts, objetivo, attr) {
      const values = posts.map(p => [p.id, POST.value(p, objetivo, attr)]).filter(([, v]) => v != null);
      const normal = POST.median(values.map(([, v]) => v));
      const ok = values.length >= POST.MIN_CONTA && normal > 0;
      return { normal, n: values.length, ok, byId: Object.fromEntries(values.map(([id, v]) => [id, ok ? v / normal : null])) };
    },

    // mediana do score por valor de um atributo (gancho, formato, tema, cta); n sempre junto
    ranking(posts, sc, atributo) {
      const groups = {};
      posts.forEach(p => { const s = sc.byId[p.id]; const k = p[atributo]; if (s != null && k) (groups[k] = groups[k] || []).push(s); });
      return Object.entries(groups).map(([label, list]) => ({ label, n: list.length, score: POST.median(list), confiavel: list.length >= POST.MIN_GRUPO }))
        .sort((a, b) => b.score - a.score);
    },

    // Previsão = média das medianas dos grupos a que o rascunho pertence (só grupos com amostra mínima).
    // Devolve também o "por quê" e os ajustes: trocar um atributo fraco pelo melhor grupo confiável.
    predict(draft, posts, sc) {
      if (!sc.ok) return { faixa: null, motivo: `São necessários ao menos ${POST.MIN_CONTA} posts publicados com métricas para existir um "normal da conta". Hoje há ${sc.n}.` };
      const usados = [], ajustes = [];
      Object.keys(POST.ATRIBUTOS).forEach(attr => {
        const rank = POST.ranking(posts, sc, attr).filter(g => g.confiavel);
        const meu = rank.find(g => g.label === draft[attr]);
        if (meu) usados.push({ attr, ...meu });
        const melhor = rank[0];
        if (melhor && melhor.label !== draft[attr] && (!meu || melhor.score - meu.score >= 0.3) && melhor.score > 1) {
          ajustes.push({ attr, de: draft[attr] || null, para: melhor.label, deScore: meu?.score ?? null, paraScore: melhor.score, n: melhor.n, ganho: melhor.score - (meu?.score ?? 1) });
        }
      });
      if (!usados.length) return { faixa: null, motivo: `Nenhuma das características deste post tem ${POST.MIN_GRUPO} ou mais posts no histórico. Publique, registre as métricas e a previsão passa a existir.`, ajustes: ajustes.sort((a, b) => b.ganho - a.ganho) };
      const score = usados.reduce((s, g) => s + g.score, 0) / usados.length;
      const comparaveis = posts.filter(p => sc.byId[p.id] != null && Object.keys(POST.ATRIBUTOS).filter(a => p[a] && p[a] === draft[a]).length >= 2).length;
      return {
        score, faixa: POST.faixa(score), comparaveis,
        confianca: comparaveis >= 10 && usados.length >= 3 ? 'alta' : comparaveis >= 4 ? 'média' : 'baixa',
        usados, ajustes: ajustes.sort((a, b) => b.ganho - a.ganho),
      };
    },
  };

  // ── Rodapé da sidebar: estado da IA + backup ──────────────
  async function mountStatus() {
    const el = document.getElementById('sidebar-status');
    if (!el || DEMO_MODE) return;
    const st = await aiStatus();
    el.innerHTML = `
      <span class="sidebar-status-line" title="${U.esc(st.ai ? st.model : st.ai_reason || '')}">
        <span class="status-led ${st.ai ? 'on' : ''}"></span>${st.ai ? 'IA ativa' : 'IA desligada'}
      </span>
      <a class="sidebar-status-link" href="/api/export/${EMP}" download>Baixar backup</a>`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountStatus); else mountStatus();

  // Erro não tratado em qualquer módulo vira aviso visível, não tela muda
  window.addEventListener('unhandledrejection', e => { window.toast?.(e.reason?.message || 'Erro inesperado', 'error'); });

  window.store = store;
  window.Suite = {
    U, aiStatus, loadAll, finance, pipelineStats, projectStatus, lastInteraction, isPago,
    computeGOS, snapshotGOS, gosColor, gosStatus, GOS_WEIGHTS,
    computePulse, voiceDetect, VOICE_RULES, DEFAULT_STAGES, OPEN_STAGES, POST,
  };
})();
