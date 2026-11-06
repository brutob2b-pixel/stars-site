// ============================================================
// UP Co. Suite — CLIENT_CONFIG · CÓPIA DE DEMONSTRAÇÃO
// ============================================================
// Esta pasta é só para apresentação. A empresa abaixo é FICTÍCIA.
// A suíte de operação fica em up-suite-v1.5 / up-suite-online.
// ============================================================

const DEMO_MODE = true; // nunca usar esta pasta em operação

const CLIENT_CONFIG = {
  // ── Identidade (empresa fictícia) ──────────────────────
  empresa_id:           'demo-prisma',
  empresa:              'Studio Prisma',
  setor:                'Arquitetura e design de interiores',
  porte:                'pequena',
  cidade:               'São Paulo, SP',
  tempo_mercado:        '7 anos',

  // ── Financeiro ──────────────────────────────────────────
  faturamento_estimado: 'R$ 170.000/mês',
  ticket_medio:         'R$ 48.000',
  meta_mrr:             180000,
  saldo_inicial:        64000,

  // ── Comercial ───────────────────────────────────────────
  publico_alvo:         'Famílias reformando apartamento e pequenas empresas montando escritório ou clínica',
  principais_servicos:  [
    'Projeto de interiores residencial',
    'Projeto corporativo (escritórios e clínicas)',
    'Gerenciamento de obra',
  ],
  sazonalidade:         'Pico de briefings em fevereiro–março e agosto–setembro. Obras desaceleram em dezembro.',

  // ── Estratégia ──────────────────────────────────────────
  dores_mapeadas: [
    'A dona não sabia quanto entrava no mês até o contador fechar',
    'Orçamentos enviados e esquecidos no WhatsApp',
    'Obras estourando prazo sem ninguém avisar antes',
  ],
  objetivos: [
    'Chegar a R$ 180 mil/mês de receita até dezembro',
    'Reduzir de 15 para 7 dias o tempo entre briefing e proposta',
    'Zerar obra entregue com atraso não comunicado',
  ],
  kpis_criticos: [
    'Receita do mês vs meta',
    'Conversão de propostas',
    'Obras no prazo',
  ],

  painel_interno:       false,

  // ── Comunicação ─────────────────────────────────────────
  tom_voz: 'Direto, parceiro, sem enrolação. Fala como quem resolve, não como quem explica.',
  contexto_adicional: 'Empresa fictícia da demonstração. A dona é a arquiteta Helena Prado; o consultor da UP Co. acompanha a operação toda semana.',

  // ── WhatsApp (na demonstração nenhum WhatsApp é aberto — ver tour.js) ──
  whatsapp_phone:       '+55 (11) 90000-1010',
  whatsapp_atendimento: '+55 (11) 90000-2020',
  evolution_api_url:    '',

  // ── UP·Voice ────────────────────────────────────────────
  rafael_whatsapp:      '+55 (11) 90000-3030',
  voice_daily_limit:    1,
  voice_require_approval: true,
};

// ── Aplicar brand color dinamicamente ──────────────────────
const BRAND = {
  bg:     '#0F0F0F',
  bg2:    '#161616',
  bg3:    '#1E1E1E',
  text:   '#F2F2F2',
  muted:  '#8A8A8A',
  dim:    '#4A4A4A',
  teal:   '#57999B',
  border: '#2A2A2A',
  green:  '#27AE60',
  amber:  '#F5A623',
  red:    '#E74C3C',
};

(function applyBrand() {
  const r = document.documentElement;
  Object.entries(BRAND).forEach(([k, v]) => r.style.setProperty(`--${k}`, v));
  const hex = (h, a) => h + Math.round(a * 255).toString(16).padStart(2, '0');
  r.style.setProperty('--teal-12',  hex(BRAND.teal, .12));
  r.style.setProperty('--teal-22',  hex(BRAND.teal, .22));
  r.style.setProperty('--green-12', hex(BRAND.green, .12));
  r.style.setProperty('--red-12',   hex(BRAND.red, .12));
  r.style.setProperty('--amber-12', hex(BRAND.amber, .12));
})();
