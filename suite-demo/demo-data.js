// ============================================================
// UP Co. Suite — Dados de demonstração · Studio Prisma (FICTÍCIO)
// ============================================================
// Usados SOMENTE com DEMO_MODE = true. Pessoas, empresas e números
// são inventados. As datas são relativas a hoje, para a demo estar
// sempre "viva" em qualquer dia em que for apresentada.
// SUITE_TEMPLATES (fim do arquivo) são modelos importáveis no Base e no Core.
// ============================================================

(function initDemoData() {
  const U = window.Suite.U;
  const T = U.today();
  const DAY = Number(T.slice(8, 10));
  const d = n => U.addDays(T, n);                                   // hoje + n dias
  const ts = (n, h = 9) => `${d(n)}T${String(h).padStart(2, '0')}:00:00`;
  const week = n => U.isoWeek(d(n * 7));
  // Os dados ficam no navegador com as datas do dia em que foram criados.
  // Num dia novo, recomeça do zero para a demo continuar 'viva'.
  try {
    const prefix = 'upco_' + CLIENT_CONFIG.empresa_id + '_', dayKey = prefix + '_dia_da_demo';
    if (localStorage.getItem(dayKey) !== T) {
      Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(dayKey, T);
    }
  } catch { /* sem localStorage: os dados vivem só nesta aba */ }
  // primeiro dia do mês com deslocamento (0 = este mês, -1 = mês passado)
  const monthStart = off => { const dt = U.parseDate(T.slice(0, 8) + '01'); dt.setMonth(dt.getMonth() + off); return U.iso(dt); };
  const md = (off, day) => U.addDays(monthStart(off), day - 1);
  // dia já passado deste mês, proporcional (0 = dia 1, 1 = hoje) — o mês corrente sempre tem lançamentos
  const cm = frac => U.addDays(monthStart(0), Math.floor(frac * (DAY - 1)));

  // ── UP·Vault — 3 meses de caixa ─────────────────────────
  let tid = 0;
  const tx = (tipo, status, descricao, valor, data, categoria) => ({ id: 't' + (++tid), tipo, status, descricao, valor, data, categoria });
  const despesasFixas = (when, folha) => [
    tx('despesa', 'pago', 'Folha de pagamento + encargos', folha, when(5), 'Pessoal'),
    tx('despesa', 'pago', 'Aluguel do estúdio', 9500, when(10), 'Infraestrutura'),
    tx('despesa', 'pago', 'Impostos (Simples Nacional)', 11800, when(20), 'Impostos'),
    tx('despesa', 'pago', 'Licenças (Revit, SketchUp, V-Ray)', 2400, when(8), 'Software / Ferramentas'),
    tx('despesa', 'pago', 'UP Co. Suite — mensalidade', 3200, when(10), 'Software / Ferramentas'),
    tx('despesa', 'pago', 'Meta Ads — campanhas do Instagram', 4500, when(12), 'Marketing'),
    tx('despesa', 'pago', 'Contabilidade', 1800, when(15), 'Outros'),
    tx('despesa', 'pago', 'Renderização terceirizada', 5200, when(18), 'Pessoal'),
  ];
  const transacoes = [
    // mês retrasado
    tx('receita', 'pago', 'Apto Moema — parcela final do projeto', 38000, md(-2, 4), 'Serviços prestados'),
    tx('receita', 'pago', 'Clínica Sorriso Leste — 2ª parcela', 42000, md(-2, 9), 'Serviços prestados'),
    tx('receita', 'pago', 'Gerenciamento de obra — Casa Fontes', 28000, md(-2, 15), 'Serviços prestados'),
    tx('receita', 'pago', 'Apto Ricardo Alves — entrada', 31000, md(-2, 22), 'Serviços prestados'),
    tx('receita', 'pago', 'Consultoria de layout — Café Grão', 14500, md(-2, 27), 'Serviços prestados'),
    ...despesasFixas(day => md(-2, day), 57000),
    // mês passado
    tx('receita', 'pago', 'Clínica Sorriso Leste — parcela final', 44000, md(-1, 3), 'Serviços prestados'),
    tx('receita', 'pago', 'Casa Fontes — entrada do projeto', 51000, md(-1, 12), 'Serviços prestados'),
    tx('receita', 'pago', 'Gerenciamento de obra — Casa Fontes', 28000, md(-1, 15), 'Serviços prestados'),
    tx('receita', 'pago', 'Apto Ricardo Alves — 2ª parcela', 31000, md(-1, 20), 'Serviços prestados'),
    tx('receita', 'pago', 'Revenda de mobiliário (comissão)', 12600, md(-1, 26), 'Vendas de produtos'),
    ...despesasFixas(day => md(-1, day), 58500),
    // este mês — pagos até hoje
    tx('receita', 'pago', 'Família Tanaka — entrada do projeto', 39000, cm(.15), 'Serviços prestados'),
    tx('receita', 'pago', 'Gerenciamento de obra — Casa Fontes', 28000, cm(.35), 'Serviços prestados'),
    tx('receita', 'pago', 'Beatriz Almeida — entrada do projeto', 23000, cm(.5), 'Serviços prestados'),
    tx('receita', 'pago', 'Lemos Advocacia — entrada do projeto', 36000, cm(.7), 'Serviços prestados'),
    tx('receita', 'pago', 'Revenda de mobiliário (comissão)', 9800, cm(.85), 'Vendas de produtos'),
    tx('receita', 'pago', 'Apto Ricardo Alves — 3ª parcela', 15600, cm(1), 'Serviços prestados'),
    tx('despesa', 'pago', 'Folha de pagamento + encargos', 59000, cm(.15), 'Pessoal'),
    tx('despesa', 'pago', 'Aluguel do estúdio', 9500, cm(.3), 'Infraestrutura'),
    tx('despesa', 'pago', 'Licenças (Revit, SketchUp, V-Ray)', 2400, cm(.25), 'Software / Ferramentas'),
    tx('despesa', 'pago', 'UP Co. Suite — mensalidade', 3200, cm(.3), 'Software / Ferramentas'),
    tx('despesa', 'pago', 'Meta Ads — campanhas do Instagram', 4500, cm(.4), 'Marketing'),
    tx('despesa', 'pago', 'Contabilidade', 1800, cm(.5), 'Outros'),
    tx('despesa', 'pago', 'Maquete física — Lemos Advocacia', 2700, cm(.9), 'Outros'),
    // a pagar / a receber
    tx('despesa', 'pendente', 'Impostos (Simples Nacional)', 12400, d(2), 'Impostos'),
    tx('despesa', 'pendente', 'Renderização terceirizada', 5200, d(4), 'Pessoal'),
    tx('despesa', 'pendente', 'Fotógrafo — ensaio da Casa Fontes', 2800, d(9), 'Marketing'),
    tx('receita', 'pendente', 'Lemos Advocacia — 2ª parcela', 36000, d(3), 'Serviços prestados'),
    tx('receita', 'pendente', 'Gerenciamento de obra — Casa Fontes', 28000, d(6), 'Serviços prestados'),
    tx('receita', 'pendente', 'Família Tanaka — 2ª parcela', 19500, d(12), 'Serviços prestados'),
  ];

  // ── UP·Lead — conversas ─────────────────────────────────
  const chat = (...msgs) => msgs.map(([dir, text, time]) => ({ dir: dir === '>' ? 'inbound' : 'outbound', text, time }));
  const leads = [
    { id: 'l1', nome: 'Juliana Costa', canal: 'WhatsApp', temperatura: 'quente', prioridade: 5, status: 'open', lead_score: 88,
      mensagem_original: 'Oi! Vi o antes e depois do apê de Pinheiros (P-016). Quero algo assim no meu, 120 m².',
      proximo_passo: 'Enviar proposta revisada com marcenaria inclusa',
      ai_intencao: 'Comprou apartamento e quer reformar antes de mudar. Prazo: mudança em março.',
      ai_qualificacao: 'Perfil ideal. Orçamento declarado compatível; decide com o marido.',
      criado_em: d(-9), ultima_interacao: ts(-3, 18), post_codigo: 'P-016', post_ponto: 'S', post_origem: 'codigo',
      historico: chat(
        ['>', 'Oi! Vi o antes e depois do apê de Pinheiros (P-016-S). Quero algo assim no meu, 120 m².', '10:12'],
        ['<', 'Oi, Juliana! Que bom que gostou. O apartamento está vazio ou vocês já moram nele?', '10:20'],
        ['>', 'Vazio, compramos agora. Queremos mudar em março.', '10:31'],
        ['<', 'Dá tempo com folga. Posso ir fazer o levantamento na quinta às 10h?', '10:33'],
        ['>', 'Perfeito. Recebi a proposta, mas queria incluir a marcenaria da cozinha. Consegue revisar?', '18:05'],
      ) },
    { id: 'l2', nome: 'Dr. Felipe Andrade', canal: 'Indicação', temperatura: 'quente', prioridade: 5, status: 'open', lead_score: 92,
      mensagem_original: 'O Dr. Paulo da Sorriso Leste me indicou. Vou abrir uma clínica de 2 consultórios.',
      proximo_passo: 'Fechar condições de pagamento — quer parcelar em 4x',
      ai_intencao: 'Abrir clínica odontológica nova, com prazo da vigilância sanitária.',
      ai_qualificacao: 'Alta intenção, decisor único, veio por indicação de cliente satisfeito.',
      criado_em: d(-16), ultima_interacao: ts(-1, 17), post_codigo: 'P-011', post_ponto: 'B', post_origem: 'codigo',
      historico: chat(
        ['>', 'Boa tarde. O Dr. Paulo da Sorriso Leste me indicou vocês. Vou abrir uma clínica com 2 consultórios.', '14:02'],
        ['<', 'Boa tarde, Dr. Felipe! O Dr. Paulo é um ótimo cliente. Já tem o imóvel?', '14:10'],
        ['>', 'Sim, 140 m² no Tatuapé. Preciso aprovar na vigilância sanitária até fevereiro.', '14:22'],
        ['<', 'Fizemos exatamente isso na Sorriso Leste. Envio a proposta até sexta.', '14:25'],
        ['>', 'Gostei da proposta. Dá para parcelar em 4 vezes?', '17:40'],
      ) },
    { id: 'l3', nome: 'Mariana e Tiago Rocha', canal: 'Instagram DM', temperatura: 'morno', prioridade: 3, status: 'open', lead_score: 64,
      mensagem_original: 'Oi, vocês fazem só projeto ou também acompanham a obra?',
      proximo_passo: 'Agendar visita ao apartamento',
      ai_intencao: 'Casal com primeiro apartamento, ainda comparando escritórios.',
      ai_qualificacao: 'Potencial bom. Confirmar orçamento antes do levantamento.',
      criado_em: d(-6), ultima_interacao: ts(-1, 11), post_codigo: 'P-014', post_ponto: null, post_origem: 'informado',
      historico: chat(
        ['>', 'Oi, vocês fazem só projeto ou também acompanham a obra?', '20:15'],
        ['<', 'Oi, Mariana! Fazemos os dois. Como é o apartamento de vocês?', '09:02'],
        ['>', '75 m², Vila Mariana. Vimos o vídeo de quanto custa um projeto e ficamos curiosos.', '11:30'],
      ) },
    { id: 'l4', nome: 'Renata Melo — Construtora Base Sólida', canal: 'Formulário', temperatura: 'morno', prioridade: 4, status: 'pending', lead_score: 71,
      mensagem_original: 'Precisamos decorar 2 apartamentos decorados para o stand de vendas.',
      proximo_passo: 'Cobrar retorno da proposta enviada',
      ai_intencao: 'Projeto corporativo recorrente — a construtora lança 3 empreendimentos por ano.',
      ai_qualificacao: 'Ticket alto e potencial de recorrência. Decisão passa por diretoria.',
      criado_em: d(-21), ultima_interacao: ts(-9, 16),
      historico: chat(
        ['>', 'Precisamos decorar 2 apartamentos decorados para o stand de vendas. Lançamento em janeiro.', '09:40'],
        ['<', 'Renata, perfeito. Envio a proposta hoje até o fim do dia.', '10:05'],
        ['<', 'Proposta enviada por e-mail. Qualquer dúvida estou aqui.', '16:30'],
      ) },
    { id: 'l5', nome: 'Carla Nogueira', canal: 'Instagram DM', temperatura: 'morno', prioridade: 3, status: 'open', lead_score: 58,
      mensagem_original: 'Quero integrar cozinha e sala. Quanto fica mais ou menos?',
      proximo_passo: 'Marcar call de 20 minutos',
      ai_intencao: 'Reforma pontual de cozinha e sala.', ai_qualificacao: 'Ticket menor; bom para encaixe na agenda.',
      criado_em: d(-2), ultima_interacao: ts(-2, 21), post_codigo: 'P-014', post_ponto: 'D', post_origem: 'codigo',
      historico: chat(['>', 'Oi! Vim pelo P-014-D. Quero integrar cozinha e sala. Quanto fica mais ou menos?', '21:10']) },
    { id: 'l6', nome: 'André Lins — Coworking Ponto Sul', canal: 'LinkedIn', temperatura: 'frio', prioridade: 2, status: 'open', lead_score: 35,
      mensagem_original: 'Estamos avaliando reformar o 2º andar do coworking ano que vem.',
      proximo_passo: 'Retomar contato em janeiro', ai_intencao: 'Planejamento para 2027.', ai_qualificacao: 'Sem urgência; manter aquecido.',
      criado_em: d(-12), ultima_interacao: ts(-11, 15),
      historico: chat(['>', 'Estamos avaliando reformar o 2º andar do coworking ano que vem. Podemos conversar?', '15:00']) },
    { id: 'l7', nome: 'Patrícia Moura', canal: 'WhatsApp', temperatura: 'frio', prioridade: 1, status: 'open', lead_score: 18,
      mensagem_original: 'Vocês fazem só o armário do quarto?',
      proximo_passo: 'Indicar marceneiro parceiro — fora do escopo', ai_intencao: 'Quer só um móvel planejado.', ai_qualificacao: 'Fora do perfil de projeto.',
      criado_em: d(-1), ultima_interacao: ts(-1, 13),
      historico: chat(['>', 'Oi, vocês fazem só o armário do quarto?', '13:20']) },
    { id: 'l8', nome: 'Eduardo Siqueira', canal: 'Indicação', temperatura: 'morno', prioridade: 3, status: 'open', lead_score: 61,
      mensagem_original: 'A Beatriz me passou seu contato. Tenho uma casa de campo em Atibaia.',
      proximo_passo: 'Pedir fotos e planta da casa', ai_intencao: 'Reforma de casa de campo para uso nos fins de semana.', ai_qualificacao: 'Indicação de cliente; bom potencial.',
      criado_em: d(-3), ultima_interacao: ts(-2, 10),
      historico: chat(
        ['>', 'A Beatriz me passou seu contato. Tenho uma casa de campo em Atibaia e quero dar uma cara nova.', '09:15'],
        ['<', 'Oi, Eduardo! Que ótimo. Consegue me mandar fotos e a planta, se tiver?', '10:02'],
      ) },
    // clientes já fechados / perdidos
    { id: 'l9', nome: 'Beatriz Almeida', canal: 'Instagram DM', temperatura: 'quente', prioridade: 4, status: 'resolved', lead_score: 85,
      mensagem_original: 'Amei a sala de 22 m² da Vila Madalena (P-006-B). Moro no mesmo prédio!',
      proximo_passo: 'Cliente — projeto em andamento', ai_intencao: 'Reforma completa do apartamento.', ai_qualificacao: 'Fechou.',
      criado_em: d(-40), ultima_interacao: ts(-15, 14), post_codigo: 'P-006', post_ponto: 'B', post_origem: 'codigo',
      historico: chat(['>', 'Amei a sala de 22 m² da Vila Madalena (P-006-B). Moro no mesmo prédio!', '19:30'], ['<', 'Que coincidência boa! Vamos marcar uma visita?', '19:45']) },
    { id: 'l10', nome: 'Rodrigo Lemos — Lemos Advocacia', canal: 'Google Ads', temperatura: 'quente', prioridade: 4, status: 'resolved', lead_score: 80,
      mensagem_original: 'Mudança de escritório em dezembro, 180 m².',
      proximo_passo: 'Cliente — projeto em andamento', ai_intencao: 'Escritório novo com sala de reunião e 12 estações.', ai_qualificacao: 'Fechou.',
      criado_em: d(-34), ultima_interacao: ts(-12, 11), post_codigo: 'P-004', post_ponto: null, post_origem: 'informado',
      historico: chat(['>', 'Bom dia. Vamos mudar o escritório em dezembro, 180 m². Vi o carrossel do escritório de advocacia.', '08:50']) },
    { id: 'l11', nome: 'Camila Tanaka', canal: 'WhatsApp', temperatura: 'quente', prioridade: 4, status: 'resolved', lead_score: 83,
      mensagem_original: 'Vi o vídeo do projeto executivo (P-009-S). Quero contratar o completo.',
      proximo_passo: 'Cliente — projeto em andamento', ai_intencao: 'Projeto completo com executivo.', ai_qualificacao: 'Fechou.',
      criado_em: d(-30), ultima_interacao: ts(-20, 16), post_codigo: 'P-009', post_ponto: 'S', post_origem: 'codigo',
      historico: chat(['>', 'Vi o vídeo do projeto executivo (P-009-S). Quero contratar o completo.', '16:00']) },
    { id: 'l12', nome: 'Gustavo Reis', canal: 'Formulário', temperatura: 'frio', prioridade: 2, status: 'resolved', lead_score: 40,
      mensagem_original: 'Quero um orçamento para o meu apartamento.',
      proximo_passo: 'Perdido — achou o valor alto', ai_intencao: 'Comparando preço.', ai_qualificacao: 'Sensível a preço.',
      criado_em: d(-28), ultima_interacao: ts(-14, 10),
      historico: chat(['>', 'Quero um orçamento para o meu apartamento.', '10:00'], ['>', 'Obrigado, mas achei acima do que posso agora.', '10:30']) },
  ].map(l => ({ telefone: '', ...l }));

  const deal = (id, titulo, lead_id, valor, criado, movido) => ({ id, titulo, lead_id, lead: leads.find(l => l.id === lead_id)?.nome || titulo, valor, criado_em: criado, movido_em: movido });
  const pipeline = [
    { id: 'st1', nome: 'Novo',        cor: '#57999B', deals: [
      deal('dl1', 'Cozinha + sala — Carla Nogueira', 'l5', 28000, ts(-2), ts(-2)),
      deal('dl2', 'Casa de campo Atibaia — Eduardo', 'l8', 52000, ts(-3), ts(-3)),
      deal('dl3', '2º andar — Coworking Ponto Sul', 'l6', 18000, ts(-12), ts(-12)),
    ] },
    { id: 'st2', nome: 'Qualificado', cor: '#8B5CF6', deals: [deal('dl4', 'Apto Vila Mariana — Mariana e Tiago', 'l3', 42000, ts(-6), ts(-4))] },
    { id: 'st3', nome: 'Proposta',    cor: '#F5A623', deals: [
      deal('dl5', 'Decorados do stand — Base Sólida', 'l4', 64000, ts(-21), ts(-9)),
      deal('dl6', 'Apto 120 m² — Juliana Costa', 'l1', 38000, ts(-9), ts(-3)),
    ] },
    { id: 'st4', nome: 'Negociação',  cor: '#27AE60', deals: [deal('dl7', 'Clínica 2 consultórios — Dr. Felipe', 'l2', 86000, ts(-16), ts(-1))] },
    { id: 'st5', nome: 'Ganho ✓',     cor: '#27AE60', deals: [
      deal('dl8', 'Apto Perdizes — Família Tanaka', 'l11', 39000, ts(-30), `${cm(.1)}T11:00:00`),
      deal('dl9', 'Apto Vila Madalena — Beatriz', 'l9', 46000, ts(-40), `${cm(.45)}T15:00:00`),
      deal('dl10', 'Escritório 180 m² — Lemos Advocacia', 'l10', 72000, ts(-34), `${cm(.65)}T10:00:00`),
      { id: 'dl11', titulo: 'Casa Moema — Luiz Fontes', lead: 'Luiz Fontes', valor: 51000, criado_em: `${md(-2, 20)}T10:00:00`, movido_em: `${md(-1, 10)}T10:00:00` },
    ] },
    { id: 'st6', nome: 'Perdido',     cor: '#E74C3C', deals: [
      deal('dl12', 'Apto — Gustavo Reis', 'l12', 33000, ts(-28), `${cm(.3)}T10:00:00`),
      { id: 'dl13', titulo: 'Cafeteria — Café Grão (obra)', lead: 'Café Grão', valor: 25000, criado_em: `${md(-2, 5)}T10:00:00`, movido_em: `${md(-1, 18)}T10:00:00` },
    ] },
  ];

  // ── UP·Flow — projetos ──────────────────────────────────
  let eid = 0;
  const etapas = list => list.map(([nome, responsavel, concluido]) => ({ id: 'e' + (++eid), nome, responsavel, status: concluido != null ? 'concluido' : 'pendente', ...(concluido != null ? { concluido_em: d(concluido) } : {}) }));
  const projetos = [
    { id: 'p1', nome: 'Casa Fontes — reforma completa (obra)', cliente: 'Luiz Fontes', responsavel: 'Sofia Ramos', inicio: d(-48), previsao: d(-2), retrabalhos: 1,
      ai_suggestion: { gargalo: 'Marcenaria atrasou 9 dias no fornecedor e travou pintura e entrega', acao: 'Avisar o cliente hoje com nova data e cobrar o fornecedor por escrito', responsavel: 'Sofia Ramos' },
      etapas: etapas([['Demolição e preparação', 'Sofia Ramos', -40], ['Elétrica e hidráulica', 'Sofia Ramos', -28], ['Gesso e revestimentos', 'Sofia Ramos', -14], ['Marcenaria', 'Lucas Ferraz'], ['Pintura e entrega', 'Sofia Ramos']]) },
    { id: 'p2', nome: 'Lemos Advocacia — escritório 180 m²', cliente: 'Rodrigo Lemos', responsavel: 'Lucas Ferraz', inicio: d(-12), previsao: d(38), ai_suggestion: null,
      etapas: etapas([['Briefing', 'Helena Prado', -11], ['Layout e estudo preliminar', 'Lucas Ferraz', -4], ['Projeto executivo', 'Thiago Okada'], ['Orçamento de obra', 'Sofia Ramos'], ['Acompanhamento de obra', 'Sofia Ramos']]) },
    { id: 'p3', nome: 'Apto Perdizes — Família Tanaka', cliente: 'Camila Tanaka', responsavel: 'Marina Duarte', inicio: d(-18), previsao: d(30), ai_suggestion: null,
      etapas: etapas([['Briefing', 'Helena Prado', -17], ['Levantamento técnico', 'Marina Duarte', -14], ['Estudo preliminar + 3D', 'Thiago Okada', -3], ['Projeto executivo', 'Marina Duarte'], ['Detalhamento de marcenaria', 'Lucas Ferraz']]) },
    { id: 'p4', nome: 'Apto Vila Madalena — Beatriz Almeida', cliente: 'Beatriz Almeida', responsavel: 'Marina Duarte', inicio: d(-9), previsao: d(52), ai_suggestion: null,
      etapas: etapas([['Briefing', 'Helena Prado', -8], ['Levantamento técnico', 'Marina Duarte', -5], ['Estudo preliminar + 3D', 'Thiago Okada'], ['Projeto executivo', 'Marina Duarte'], ['Acompanhamento de obra', 'Sofia Ramos']]) },
    { id: 'p5', nome: 'Apto Brooklin — Ricardo Alves', cliente: 'Ricardo Alves', responsavel: 'Lucas Ferraz', inicio: d(-70), previsao: d(9), ai_suggestion: null,
      etapas: etapas([['Briefing', 'Helena Prado', -68], ['Estudo preliminar + 3D', 'Thiago Okada', -55], ['Projeto executivo', 'Lucas Ferraz', -38], ['Obra — fase 1', 'Sofia Ramos', -10], ['Obra — fase 2 e entrega', 'Sofia Ramos']]) },
    { id: 'p6', nome: 'Clínica Sorriso Leste', cliente: 'Dr. Paulo Mendes', responsavel: 'Lucas Ferraz', inicio: d(-110), previsao: d(-30),
      ai_suggestion: { licao: 'Aprovar o layout com a vigilância sanitária antes do executivo poupou 2 semanas. Repetir na clínica do Dr. Felipe.' },
      etapas: etapas([['Briefing', 'Helena Prado', -108], ['Layout + consulta à vigilância', 'Lucas Ferraz', -95], ['Projeto executivo', 'Thiago Okada', -75], ['Obra', 'Sofia Ramos', -38], ['Entrega e fotos', 'Helena Prado', -32]]) },
  ];

  // ── UP·Team ─────────────────────────────────────────────
  const hist = (...rows) => rows.map(([c, a, at, au], i) => ({ semana: week(-(i + 1)), fechado_em: d(-7 * i - 3), tarefas_concluidas: c, tarefas_abertas: a, atrasos: at, ausencias: au }));
  const membros = [
    { id: 'm1', nome: 'Helena Prado',  cargo: 'Sócia-diretora e arquiteta', ativo: true, tarefas_concluidas: 11, tarefas_abertas: 3, atrasos: 0, ausencias: 0, historico: hist([10, 4, 0, 0], [9, 3, 1, 0], [12, 2, 0, 0]) },
    { id: 'm2', nome: 'Lucas Ferraz',  cargo: 'Arquiteto sênior',            ativo: true, tarefas_concluidas: 9,  tarefas_abertas: 4, atrasos: 0, ausencias: 0, historico: hist([8, 4, 0, 0], [9, 5, 0, 0], [7, 3, 1, 0]) },
    { id: 'm3', nome: 'Marina Duarte', cargo: 'Arquiteta',                   ativo: true, tarefas_concluidas: 8,  tarefas_abertas: 3, atrasos: 0, ausencias: 0, historico: hist([7, 3, 0, 0], [8, 2, 0, 0], [6, 4, 0, 1]) },
    { id: 'm4', nome: 'Thiago Okada',  cargo: 'Projetista 3D',               ativo: true, tarefas_concluidas: 5,  tarefas_abertas: 7, atrasos: 2, ausencias: 1, historico: hist([6, 6, 1, 0], [7, 4, 1, 0], [8, 3, 0, 0]) },
    { id: 'm5', nome: 'Sofia Ramos',   cargo: 'Gerente de obras',            ativo: true, tarefas_concluidas: 10, tarefas_abertas: 4, atrasos: 1, ausencias: 0, historico: hist([9, 3, 0, 0], [10, 4, 0, 0], [8, 2, 0, 0]) },
    { id: 'm6', nome: 'Diego Martins', cargo: 'Comercial e atendimento',     ativo: true, tarefas_concluidas: 14, tarefas_abertas: 2, atrasos: 0, ausencias: 0, historico: hist([12, 3, 0, 0], [11, 2, 0, 0], [10, 4, 0, 0]) },
    { id: 'm7', nome: 'Paula Lima',    cargo: 'Administrativo-financeiro',   ativo: true, tarefas_concluidas: 12, tarefas_abertas: 1, atrasos: 0, ausencias: 0, historico: hist([11, 2, 0, 0], [12, 1, 0, 0], [11, 1, 0, 0]) },
  ];

  // ── UP·Base — SOPs e políticas ──────────────────────────
  const docs = [
    { id: 'd1', titulo: 'SOP — Atendimento do primeiro contato', categoria: 'Vendas', responsavel: 'Diego Martins', atualizado: d(-12),
      steps: ['Responder em até 1 hora útil, pelo mesmo canal', 'Perguntar tipo de imóvel, metragem, prazo e se já tem orçamento', 'Registrar o contato no UP·Lead com o código do post, se houver', 'Agendar levantamento ou call de 20 minutos', 'Nunca passar valor fechado sem briefing'],
      nota: 'Todo contato que chega pelo Instagram deve ter o post de origem registrado — é assim que sabemos qual conteúdo vende.' },
    { id: 'd2', titulo: 'SOP — Briefing com o cliente', categoria: 'SOPs', responsavel: 'Helena Prado', atualizado: d(-20),
      steps: ['Enviar questionário de briefing 2 dias antes', 'Reunião de 90 minutos: rotina da família, estilo, prioridades', 'Montar painel de referências com o cliente', 'Definir orçamento de obra e de mobiliário separadamente', 'Registrar decisões e enviar ata em até 24h'],
      nota: 'Briefing mal feito é a principal causa de retrabalho no executivo.' },
    { id: 'd3', titulo: 'SOP — Proposta comercial em até 7 dias', categoria: 'Vendas', responsavel: 'Diego Martins', atualizado: d(-9),
      steps: ['Levantamento técnico até 3 dias após o primeiro contato', 'Escopo e valor revisados pela Helena', 'Proposta enviada em PDF + resumo no WhatsApp', 'Follow-up em 3 dias e em 7 dias', 'Mover o deal no UP·Lead a cada mudança'],
      nota: 'Meta definida com a UP Co.: de 15 para 7 dias entre briefing e proposta.' },
    { id: 'd4', titulo: 'Política — Condições de pagamento', categoria: 'Políticas', responsavel: 'Paula Lima', atualizado: d(-30),
      steps: ['Projeto: 40% na assinatura, 30% no estudo preliminar, 30% no executivo', 'Gerenciamento de obra: mensal, enquanto durar a obra', 'Parcelamento acima de 3x só com aprovação da Helena', 'Revenda de mobiliário: comissão faturada na entrega'],
      nota: '' },
    { id: 'd5', titulo: 'SOP — Gestão de obra semanal', categoria: 'Operação', responsavel: 'Sofia Ramos', atualizado: d(-6),
      steps: ['Visita à obra 2 vezes por semana com relatório de fotos', 'Atualizar as etapas no UP·Flow toda sexta', 'Qualquer atraso de fornecedor: avisar o cliente no mesmo dia', 'Checklist de entrega antes da vistoria final'],
      nota: 'Regra nova: nenhum atraso chega ao cliente por surpresa.' },
    { id: 'd6', titulo: 'SOP — Fechamento financeiro mensal', categoria: 'Financeiro', responsavel: 'Paula Lima', atualizado: d(-15),
      steps: ['Lançar todos os recebimentos e pagamentos no UP·Vault até o dia 3', 'Conferir contas a pagar dos próximos 7 dias', 'Comparar receita do mês com a meta', 'Enviar resumo à Helena'],
      nota: '' },
  ];

  // ── UP·Core — processos ─────────────────────────────────
  const processos = [
    { id: 'bp1', nome: 'Do primeiro contato à proposta', classificacao: 'Crítico', status: 'ativo',
      etapas: ['Primeiro contato', 'Qualificação', 'Levantamento técnico', 'Briefing', 'Escopo e valor', 'Envio da proposta', 'Follow-up'],
      tempo_padrao: 6, tempo_real: 7.5, compliance: 78, ultima_atualizacao: d(-5), nota: 'Horas de trabalho por proposta. O prazo entre briefing e proposta caiu de 15 para 9 dias em 2 meses; meta é 7.' },
    { id: 'bp2', nome: 'Projeto de interiores', classificacao: 'Crítico', status: 'ativo',
      etapas: ['Briefing', 'Levantamento', 'Estudo preliminar + 3D', 'Aprovação do cliente', 'Projeto executivo', 'Detalhamento de marcenaria', 'Entrega do caderno'],
      tempo_padrao: 120, tempo_real: 128, compliance: 88, ultima_atualizacao: d(-8), nota: 'Horas de equipe por projeto residencial de até 120 m².' },
    { id: 'bp3', nome: 'Gerenciamento de obra', classificacao: 'Crítico', status: 'ativo',
      etapas: ['Cronograma com fornecedores', 'Visitas semanais', 'Relatório ao cliente', 'Controle de pagamentos de obra', 'Vistoria', 'Entrega'],
      tempo_padrao: 80, tempo_real: 88, compliance: 81, ultima_atualizacao: d(-4), nota: 'Atrasos de marcenaria são o principal desvio.' },
    { id: 'bp4', nome: 'Reunião semanal de gestão', classificacao: 'Importante', status: 'ativo',
      etapas: ['Abrir o UP·Dash', 'Revisar pipeline', 'Revisar obras', 'Revisar caixa', 'Definir prioridades da semana'],
      tempo_padrao: 1, tempo_real: 1, compliance: 100, ultima_atualizacao: d(-3), nota: 'Toda segunda às 9h, com o consultor da UP Co.' },
    { id: 'bp5', nome: 'Pós-venda e pedido de indicação', classificacao: 'Importante', status: 'ativo',
      etapas: ['Ensaio fotográfico do projeto', 'Pesquisa de satisfação', 'Pedido de indicação', 'Post de antes e depois'],
      tempo_padrao: 3, tempo_real: 3, compliance: 92, ultima_atualizacao: d(-10), nota: 'Indicações geraram 3 dos últimos 8 contratos.' },
    { id: 'bp6', nome: 'Compras e revenda de mobiliário', classificacao: 'Suporte', status: 'pausado',
      etapas: ['Seleção com o cliente', 'Cotação', 'Pedido', 'Acompanhamento de entrega'],
      tempo_padrao: 6, tempo_real: null, compliance: null, ultima_atualizacao: d(-45), nota: 'Pausado enquanto a Paula reorganiza os fornecedores.' },
  ];

  // ── UP·Post — Instagram do estúdio ──────────────────────
  const posts = [
    ['Antes e depois: apartamento de 68 m² em Pinheiros', 'Reel', 'Antes / depois', 'Reforma', 'Chamar no WhatsApp', -3, [18400, 1240, 96, 880, 410, 520], 'acima'],
    ['5 erros que encarecem a sua reforma', 'Carrossel', 'Erro comum', 'Reforma', 'Salvar para depois', -7, [9600, 610, 48, 1150, 230, 260], 'acima'],
    ['Quanto custa um projeto de interiores?', 'Reel', 'Pergunta direta', 'Orçamento', 'Chamar no WhatsApp', -11, [12800, 720, 140, 640, 190, 410], 'acima'],
    ['Bastidor: visita técnica numa obra', 'Reel', 'Bastidor', 'Bastidores', 'Sem CTA', -14, [3100, 210, 12, 40, 18, 70], 'abaixo'],
    ['Cozinha integrada: 3 layouts para apartamento pequeno', 'Carrossel', 'Lista / passo a passo', 'Cozinha', 'Salvar para depois', -18, [7400, 520, 31, 960, 150, 180], 'media'],
    ['Antes e depois: consultório odontológico', 'Reel', 'Antes / depois', 'Corporativo', 'Link na bio', -22, [14200, 880, 64, 520, 300, 470], 'acima'],
    ['Iluminação muda tudo', 'Imagem', 'Afirmação', 'Iluminação', 'Sem CTA', -26, [2400, 190, 8, 60, 12, 40], 'abaixo'],
    ['Você sabe o que é um projeto executivo?', 'Reel', 'Pergunta direta', 'Processo', 'Comentar palavra', -30, [8200, 470, 210, 300, 90, 230], null],
    ['Erro comum: comprar o sofá antes do projeto', 'Reel', 'Erro comum', 'Decoração', 'Salvar para depois', -35, [10100, 690, 72, 870, 340, 260], null],
    ['Bastidor: escolhendo revestimentos com a cliente', 'Reel', 'Bastidor', 'Bastidores', 'Sem CTA', -39, [4300, 330, 21, 90, 25, 110], null],
    ['Antes e depois: sala de 22 m² na Vila Madalena', 'Carrossel', 'Antes / depois', 'Reforma', 'Chamar no WhatsApp', -44, [11600, 830, 58, 720, 260, 380], null],
    ['Marcenaria planejada vale a pena?', 'Reel', 'Pergunta direta', 'Marcenaria', 'Comentar palavra', -50, [6900, 400, 120, 410, 80, 170], null],
    ['Escritório de advocacia: do briefing à entrega', 'Carrossel', 'Lista / passo a passo', 'Corporativo', 'Link na bio', -56, [5200, 300, 18, 380, 70, 190], null],
    ['Paleta neutra não é paleta sem graça', 'Imagem', 'Afirmação', 'Decoração', 'Sem CTA', -63, [2100, 160, 6, 70, 10, 30], null],
    ['Bastidor: reunião de briefing', 'Reel', 'Bastidor', 'Bastidores', 'Sem CTA', -70, [2900, 190, 9, 30, 14, 52], null],
    ['Como planejar a reforma sem morar na obra', 'Carrossel', 'Lista / passo a passo', 'Reforma', 'Salvar para depois', -77, [6100, 410, 26, 690, 120, 140], null],
  ].map(([titulo, formato, gancho, tema, cta, dias, m, previsto], i, list) => ({
    id: 'po' + (i + 1), codigo: 'P-' + String(list.length - i).padStart(3, '0'), titulo, formato, gancho, tema, cta, roteiro: '',
    status: 'publicado', publicado_em: d(dias), url: '', criado_em: d(dias - 2),
    metricas: { alcance: m[0], curtidas: m[1], comentarios: m[2], salvamentos: m[3], compartilhamentos: m[4], visitas_perfil: m[5] },
    previsao: previsto ? { faixa: previsto, score: 1, confianca: 'média', comparaveis: 6, objetivo: 'alcance', feita_em: d(dias - 1) } : null,
  }));
  posts.unshift({ id: 'po0', codigo: 'P-017', titulo: 'Antes e depois: escritório da Lemos Advocacia', formato: 'Reel', gancho: 'Antes / depois', tema: 'Corporativo', cta: 'Chamar no WhatsApp',
    roteiro: 'Abrir com a sala vazia → 3 cortes da obra → resultado final → "quer o seu assim? chama no WhatsApp".', status: 'rascunho', publicado_em: null, url: '', metricas: {}, previsao: null, criado_em: d(-1) });

  // ── Histórico: GOS sobe desde a entrada da suíte (8 semanas) ──
  const gos_historico = [
    [71, 70, 80, 74, 70, 82], [69, 68, 78, 73, 69, 80], [67, 66, 75, 72, 68, 78], [64, 63, 72, 70, 66, 70],
    [62, 60, 70, 68, 65, 66], [60, 58, 66, 67, 64, 62], [57, 55, 62, 65, 62, 55], [55, 52, 60, 63, 60, 50],
  ].map(([score, financeiro, comercial, operacional, equipe, processos], i) => ({ semana: week(-(i + 1)), score, financeiro, comercial, operacional, equipe, processos }));

  const mind_historico = [
    { semana: week(-1), health_score: 71, gerado_em: `${d(-7)}T08:30:00`,
      padrao_identificado: 'Atrasos de obra nascem sempre na marcenaria — 3 das últimas 4 obras.',
      contexto_narrativo: 'Melhor mês comercial do ano até aqui. O gargalo saiu das vendas e foi para a entrega.',
      insights: [
        { titulo: 'Marcenaria é o gargalo das obras', contexto: 'A Casa Fontes tem a marcenaria 9 dias atrasada no fornecedor, e o padrão se repete.', acao: 'Exigir cronograma assinado do marceneiro e ter um segundo fornecedor homologado.', urgencia: 'alta' },
        { titulo: 'Posts de antes e depois vendem', contexto: 'Os 3 contratos fechados no mês vieram de posts "antes e depois" ou de indicação.', acao: 'Publicar 1 antes e depois por semana e pedir ensaio fotográfico em toda entrega.', urgencia: 'media' },
      ] },
    { semana: week(-2), health_score: 69, gerado_em: `${d(-14)}T08:30:00`,
      padrao_identificado: null,
      contexto_narrativo: 'Tempo entre briefing e proposta caiu para 9 dias. Caixa confortável.',
      insights: [
        { titulo: 'Proposta da construtora sem dono', contexto: 'O maior deal aberto não tinha próximo passo registrado.', acao: 'Diego assume o follow-up com data na agenda.', urgencia: 'media' },
      ] },
  ];

  // Alertas já tratados em semanas anteriores (mostram o histórico do UP·Voice)
  const voice_alerts = [
    { id: 'al_h1', key: `proposta_parada:dl0:${d(-8)}`, regra: 'proposta_parada', fonte: 'UP·Lead', titulo: 'Proposta parada há 8 dias — Apto Vila Madalena — Beatriz', urgencia: 'media', publico: 'rafael',
      contexto: 'O deal "Apto Vila Madalena — Beatriz" (R$ 46.000) estava em Proposta sem movimento havia 8 dias.',
      mensagem: '🔔 A proposta da Beatriz (R$ 46.000) está parada há 8 dias. Vale um follow-up hoje.', status: 'enviado', destinatarios: ['rafael'], criado_em: `${d(-8)}T08:00:00`, enviado_em: `${d(-8)}T08:15:00` },
    { id: 'al_h2', key: `equipe_padrao:m4:${d(-14)}`, regra: 'equipe_padrao', fonte: 'UP·Team', titulo: 'Padrão de atraso — Thiago Okada', urgencia: 'media', publico: 'founder',
      contexto: 'Thiago Okada acumulou 2 atrasos e 1 ausência na semana.',
      mensagem: 'Helena, um ponto de atenção: o Thiago acumulou 2 atrasos e 1 ausência. Vale uma conversa 1:1 para entender se está sobrecarregado com os 3D.', status: 'descartado', destinatarios: [], criado_em: `${d(-14)}T08:00:00` },
  ];

  window.DEMO_SEEDS = {
    leads, pipeline, transacoes, projetos, membros, processos, docs, posts,
    gos_historico, mind_historico, voice_alerts,
    voice_state: { last_check: `${d(-1)}T08:00:00` },
    dash_narrativa: [],
    post_regras: [
      { id: 'rg1', texto: 'Conteúdo original é priorizado; repostagem sem alteração perde distribuição.', afeta: 'Reels', link: '', data: d(-40), ativa: true },
      { id: 'rg2', texto: 'Vídeos com marca d\'água de outras plataformas têm alcance reduzido.', afeta: 'Reels', link: '', data: d(-200), ativa: true },
    ],
    post_padroes: [
      { id: 'pd1', label: 'Antes e depois com revelação no final', contas: ['@referencia_arq_1', '@referencia_arq_2', '@referencia_arq_3'], aplicavel: true },
      { id: 'pd2', label: 'Tour pelo apartamento em plano-sequência', contas: ['@referencia_arq_2', '@referencia_arq_4'], aplicavel: true },
      { id: 'pd3', label: 'Trend de áudio com dancinha', contas: ['@referencia_arq_1'], aplicavel: false },
    ],
    post_pautas: [],
  };

  // Modelos importáveis no UP·Base e no UP·Core — sem números fictícios
  window.SUITE_TEMPLATES = {
    docs: docs.map(x => ({ ...x, atualizado: U.today() })),
    processos: processos.map(x => ({ ...x, status: 'ativo', tempo_real: null, compliance: null, nota: '', ultima_atualizacao: U.today() })),
  };
})();
