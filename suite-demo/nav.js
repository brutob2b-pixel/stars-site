// ============================================================
// UP Co. Suite — Navegação Compartilhada
// ============================================================
// Injeta a sidebar em qualquer página da suíte.
// Detecta o módulo atual pelo nome do arquivo (window.location).
// Requer config.js carregado antes.
// ============================================================

(function initNav() {

  // ── Módulos da suíte ──────────────────────────────────────
  const MODULES = [
    {
      id:    'up-dash',
      label: 'UP·Dash',
      file:  'up-dash.html',
      desc:  'Visão executiva',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
      id:    'up-lead',
      label: 'UP·Lead',
      file:  'up-lead.html',
      desc:  'CRM & vendas',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      id:    'up-post',
      label: 'UP·Post',
      file:  'up-post.html',
      desc:  'Conteúdo & atribuição',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`
    },
    {
      id:    'up-vault',
      label: 'UP·Vault',
      file:  'up-vault.html',
      desc:  'Financeiro',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><circle cx="12" cy="14" r="2"/></svg>`
    },
    {
      id:    'up-flow',
      label: 'UP·Flow',
      file:  'up-flow.html',
      desc:  'Projetos & processos',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
    },
    {
      id:    'up-team',
      label: 'UP·Team',
      file:  'up-team.html',
      desc:  'Pessoas & cultura',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      id:    'up-base',
      label: 'UP·Base',
      file:  'up-base.html',
      desc:  'Documentação & SOPs',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id:    'up-core',
      label: 'UP·Core',
      file:  'up-core.html',
      desc:  'BPM operacional',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></svg>`
    },
    {
      id:    'up-mind',
      label: 'UP·Mind',
      file:  'up-mind.html',
      desc:  'IA & insights',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    {
      id:    'up-gos',
      label: 'UP·GOS',
      file:  'up-gos.html',
      desc:  'Health Score',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/></svg>`
    },
    {
      id:    'up-voice',
      label: 'UP·Voice',
      file:  'up-voice.html',
      desc:  'Alertas WhatsApp',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    },
  ];

  // Tela interna da UP Co. (não entra na instalação de cliente)
  if (CLIENT_CONFIG.painel_interno) {
    MODULES.push({
      id:    'up-aprovacoes',
      label: 'Aprovações',
      file:  'up-aprovacoes.html',
      desc:  'Fila de decisões',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
    });
    MODULES.push({
      id:    'up-saude',
      label: 'Saúde',
      file:  'up-saude.html',
      desc:  'Disco, RAM, WhatsApp',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
    });
  }

  // ── Detectar módulo atual ─────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop() || 'up-dash.html';
  const currentModule = MODULES.find(m => m.file === currentFile);

  // ── Injetar CSS global da suíte ──────────────────────────
  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      height: 100%;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; font-family: inherit; font-size: inherit; }
    input, textarea, select {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      background: transparent;
      border: none;
      outline: none;
    }

    /* Layout base da suíte */
    .suite-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .suite-sidebar {
      width: 220px;
      min-width: 220px;
      background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-wordmark {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 15px;
      letter-spacing: -0.03em;
      color: var(--text);
      line-height: 1;
    }
    .sidebar-wordmark .dash { color: var(--teal); }
    .sidebar-wordmark .client { 
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 11px;
      letter-spacing: 0;
      color: var(--dim);
      margin-top: 4px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
      padding: 12px 20px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 20px;
      color: var(--muted);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
      position: relative;
      text-decoration: none;
    }
    .nav-item:hover {
      color: var(--text);
      background: rgba(255,255,255,0.03);
    }
    .nav-item.active {
      color: var(--text);
      background: var(--teal-12);
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--teal);
      border-radius: 0 2px 2px 0;
    }
    .nav-item svg { flex-shrink: 0; opacity: 0.7; }
    .nav-item.active svg { opacity: 1; color: var(--teal); }

    .nav-item-text { flex: 1; }
    .nav-item-label {
      font-size: 13px;
      font-weight: 500;
      font-family: 'Syne', sans-serif;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .nav-item-desc {
      font-size: 11px;
      color: var(--dim);
      line-height: 1.2;
    }
    .nav-item.active .nav-item-desc { color: var(--muted); }

    .sidebar-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
    }
    .sidebar-demo-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--amber);
      background: var(--amber-12);
      padding: 3px 7px;
      border-radius: 3px;
    }

    /* Área principal */
    .suite-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg);
    }

    /* Header do módulo */
    .module-header {
      padding: 20px 28px 0;
      flex-shrink: 0;
    }
    .module-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.04em;
      color: var(--text);
      line-height: 1;
    }
    .module-title .dash { color: var(--teal); }
    .module-subtitle {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }

    /* Utilitários */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-8 { gap: 8px; }
    .gap-12 { gap: 12px; }
    .gap-16 { gap: 16px; }
    .flex-1 { flex: 1; }
    .overflow-hidden { overflow: hidden; }
    .overflow-auto { overflow: auto; }

    /* Badges de temperatura */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .badge-quente  { color: var(--red);   background: var(--red-12); }
    .badge-morno   { color: var(--amber); background: var(--amber-12); }
    .badge-frio    { color: var(--muted); background: rgba(255,255,255,0.05); }
    .badge-green   { color: var(--green); background: var(--green-12); }
    .badge-teal    { color: var(--teal);  background: var(--teal-12); }

    .badge-red     { color: var(--red);   background: var(--red-12); }

    /* Rodapé: estado da IA + backup */
    #sidebar-status { display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: var(--muted); }
    .sidebar-status-line { display: flex; align-items: center; gap: 6px; }
    .status-led { width: 7px; height: 7px; border-radius: 50%; background: var(--dim); }
    .status-led.on { background: var(--green); }
    .sidebar-status-link { color: var(--teal); }
    .sidebar-status-link:hover { text-decoration: underline; }

    /* Aviso de servidor fora do ar */
    .suite-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
      background: var(--red); color: #fff; font-size: 13px;
      padding: 10px 20px; text-align: center;
    }
    .suite-banner code { background: rgba(0,0,0,.25); padding: 1px 6px; border-radius: 3px; }

    /* Ações discretas em linhas e cards (editar, excluir) */
    .icon-btn {
      background: transparent; border: none; color: var(--dim);
      padding: 4px 6px; border-radius: 4px; font-size: 12px; line-height: 1;
      transition: color .15s, background .15s;
    }
    .icon-btn:hover { color: var(--text); background: rgba(255,255,255,.06); }
    .icon-btn.danger:hover { color: var(--red); background: var(--red-12); }

    .empty-block {
      text-align: center; color: var(--dim); font-size: 13px;
      padding: 36px 16px; line-height: 1.7;
    }
    .empty-block strong { display: block; color: var(--muted); font-family: 'Syne', sans-serif; font-size: 15px; margin-bottom: 4px; }

    /* Botões */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
      border: none;
    }
    .btn-primary {
      background: var(--teal);
      color: #fff;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-ghost {
      background: transparent;
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { color: var(--text); border-color: var(--muted); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    .btn-ghost.danger:hover { color: var(--red); border-color: var(--red); }
    .btn:disabled { opacity: .6; cursor: default; }

    /* Formulários em duas colunas (modais) */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    select.input option { background: var(--bg3); color: var(--text); }

    /* Inputs */
    .input {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 7px 12px;
      color: var(--text);
      font-size: 13px;
      transition: border-color 0.15s;
      width: 100%;
    }
    .input:focus { border-color: var(--teal); }
    .input::placeholder { color: var(--dim); }

    /* Cards */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    /* Divider */
    .divider { border: none; border-top: 1px solid var(--border); }

    /* Toast container */
    #toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }
    .toast {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      min-width: 220px;
      animation: slideIn 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toast-info    { background: var(--teal-22); color: var(--teal); border: 1px solid var(--teal); }
    .toast-success { background: var(--green-12); color: var(--green); border: 1px solid var(--green); }
    .toast-error   { background: var(--red-12); color: var(--red); border: 1px solid var(--red); }
    .toast-warn    { background: var(--amber-12); color: var(--amber); border: 1px solid var(--amber); }

    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 1s linear infinite; }
  `;

  // Injetar estilos globais
  if (!document.getElementById('suite-global-css')) {
    const style = document.createElement('style');
    style.id = 'suite-global-css';
    style.textContent = globalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // ── Montar HTML da sidebar ────────────────────────────────
  const navHTML = `
    <div class="sidebar-header">
      <div class="sidebar-wordmark">
        UP <span class="dash">—</span> Co.
        <span class="client">${CLIENT_CONFIG.empresa}</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${DEMO_MODE ? `<a href="../suite.html" class="nav-item"><div class="nav-item-text"><div class="nav-item-label">← Sair da demonstração</div><div class="nav-item-desc">Voltar ao site Stars</div></div></a>` : ''}
      <div class="nav-section-label">Suite</div>
      ${MODULES.map(m => `
        <a href="${m.file}" class="nav-item ${m.id === (currentModule?.id) ? 'active' : ''}">
          ${m.icon}
          <div class="nav-item-text">
            <div class="nav-item-label">${m.label}</div>
            <div class="nav-item-desc">${m.desc}</div>
          </div>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      ${DEMO_MODE ? `<span class="sidebar-demo-badge">⚡ Demo — dados fictícios</span>` : `<div id="sidebar-status"></div>`}
    </div>
  `;

  // ── Injetar sidebar no DOM ────────────────────────────────
  function mountNav() {
    const sidebar = document.getElementById('suite-sidebar');
    if (sidebar) {
      sidebar.innerHTML = navHTML;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountNav);
  } else {
    mountNav();
  }

  // ── Toast system (global) ─────────────────────────────────
  window.toast = function(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };

  // ── Persistência local (usada só em DEMO_MODE) ─────────────
  // Em operação os dados vão para o servidor — ver suite-data.js.
  // Escopado por empresa_id para não misturar dados entre clientes.
  // Demonstração: tour guiado, restaurar dados e bloqueio de WhatsApp (tour.js)
  if (DEMO_MODE) { const t = document.createElement('script'); t.src = 'tour.js'; document.head.appendChild(t); }

  window.localPersist = {
    _key(name) { return `upco_${CLIENT_CONFIG.empresa_id}_${name}`; },

    load(name, fallback) {
      try {
        const raw = localStorage.getItem(this._key(name));
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.warn('localPersist.load falhou, usando fallback', e);
        return fallback;
      }
    },

    save(name, data) {
      try {
        localStorage.setItem(this._key(name), JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('localPersist.save falhou', e);
        return false;
      }
    },

    clear(name) {
      localStorage.removeItem(this._key(name));
    },

    // Lista todas as chaves salvas desta empresa (útil para migração futura ao Supabase)
    exportAll() {
      const prefix = `upco_${CLIENT_CONFIG.empresa_id}_`;
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          out[k.replace(prefix, '')] = JSON.parse(localStorage.getItem(k));
        }
      }
      return out;
    }
  };

})();
