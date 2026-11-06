/* DADOS DE EXEMPLO do protótipo. Nada aqui é real: produtos, pedidos e prazos são ilustrativos.
   Todos os valores são EXEMPLOS para a demonstração (pedido do Rafael em 25/10/2026); a tela marca cada um.
   shortcut: catálogo fixo no navegador; trocar por uma API quando houver plataforma (login, estoque, pagamento). */
const BRAND = "Stars"; // provisório até a busca no INPI

const CATEGORIAS = ["Marca própria", "Máquinas", "Corte", "Barba", "Bancada", "Higiene", "Mobiliário", "Balcão e varejo"];

// tipo "lote": produto com a marca da barbearia (passa por aprovação de arte). emb = desenho da embalagem; pomada = estilo da massa.
// tipo "revenda": item do fornecedor para a bancada. ico = ícone de linha.
// PREÇOS DE EXEMPLO só para a demonstração (pedido do Rafael em 25/10/2026). Não são preços de fábrica nem de mercado;
// a tela sempre mostra "exemplo" ao lado. Lote = valor do lote inteiro.
const PRECOS_EXEMPLO = {
  "lote-pasta": 1800, "lote-argila": 1950, "lote-gel": 1800, "lote-molhado": 1800, "lote-fibra": 1950, "lote-cera": 1650,
  "lote-oleo": 2100, "lote-balm": 1700, "lote-shampoo": 2400, "lote-tonico": 1900, "lote-kit": 3200,
  "maquina-corte": 450, "maquina-acab": 320, "shaver": 280, "laminas-maq": 89, "oleo-maq": 25,
  "tesoura-laser": 180, "tesoura-desbaste": 160, "pentes": 45, "pentes-encaixe": 39, "navalhete": 35, "laminas-navalhete": 22,
  "pincel": 49, "toalhas": 59, "gel-barbear": 32, "borrifador": 29, "capa": 69, "espanador": 25, "secador": 390, "espelho": 45, "carrinho": 290,
  "papel-pescoco": 18, "luvas": 39, "alcool": 15, "esterilizador": 199, "bacia": 35,
  "cadeira": 2900, "poltrona": 890, "luminaria": 189, "display": 149, "sacolas": 120, "fidelidade": 90, "vale": 60
};
const P = (id, cat, nome, detalhe, extra = {}) => ({ id, cat, nome, detalhe, preco: PRECOS_EXEMPLO[id] ?? null, tipo: cat === "Marca própria" ? "lote" : "revenda", ...extra });
const PRODUTOS = [
  P("lote-pasta", "Marca própria", "Pasta Modeladora", "Pote com a sua marca", { emb: "pote", pomada: "pasta", selo: "Mais pedido", desc: "Cremosa, acabamento natural. O coringa da bancada." }),
  P("lote-argila", "Marca própria", "Argila Matte", "Pote com a sua marca", { emb: "pote", pomada: "argila", desc: "Fixação forte, efeito seco e zero brilho." }),
  P("lote-gel", "Marca própria", "Gel-Cera Brilho", "Pote com a sua marca", { emb: "pote", pomada: "gel", desc: "Brilho espelhado para risca-lado e topete." }),
  P("lote-molhado", "Marca própria", "Efeito Molhado", "Pote com a sua marca", { emb: "pote", pomada: "molhado", selo: "Novo", desc: "Visual molhado o dia todo, sai com água." }),
  P("lote-fibra", "Marca própria", "Fibra Texturizadora", "Pote com a sua marca", { emb: "pote", pomada: "fibra", desc: "Separa os fios e dá textura com controle." }),
  P("lote-cera", "Marca própria", "Cera Black", "Lata com a sua marca", { emb: "lata", pomada: "cera", desc: "Pigmento escuro que disfarça falhas e fios brancos." }),
  P("lote-oleo", "Marca própria", "Óleo de Barba", "Frasco conta-gotas com a sua marca", { emb: "frasco", rotulo: "ÓLEO DE BARBA", desc: "Hidrata os fios e perfuma a barba. Venda casada com o corte de barba." }),
  P("lote-balm", "Marca própria", "Balm Pós-Barba", "Bisnaga com a sua marca", { emb: "tubo", rotulo: "BALM PÓS-BARBA", desc: "Acalma a pele depois da navalha." }),
  P("lote-shampoo", "Marca própria", "Shampoo 3 em 1", "Frasco com válvula, com a sua marca", { emb: "pump", rotulo: "SHAMPOO 3 EM 1", desc: "Cabelo, barba e corpo. Usado no lavatório e vendido no balcão." }),
  P("lote-tonico", "Marca própria", "Tônico Capilar", "Spray com a sua marca", { emb: "spray", rotulo: "TÔNICO CAPILAR", desc: "Refresca o couro cabeludo no fim do corte." }),
  P("lote-kit", "Marca própria", "Kit Presente", "Caixa com pomada + óleo, com a sua marca", { emb: "caixa", rotulo: "KIT PRESENTE", selo: "Datas comemorativas", desc: "Dia dos Pais e Natal: o cliente leva a marca da casa de presente." }),

  P("maquina-corte", "Máquinas", "Máquina de corte profissional", "Sem fio · lâmina de aço", { ico: "razor-electric", selo: "Mais pedido" }),
  P("maquina-acab", "Máquinas", "Máquina de acabamento", "Lâmina T para pezinho e contorno", { ico: "razor-electric" }),
  P("shaver", "Máquinas", "Shaver de acabamento", "Zero rente, para o degradê", { ico: "razor-electric", selo: "Novo" }),
  P("laminas-maq", "Máquinas", "Lâmina de reposição para máquina", "Encaixe universal", { ico: "bolt" }),
  P("oleo-maq", "Máquinas", "Óleo lubrificante para lâminas", "Frasco com bico aplicador", { ico: "droplet" }),
  P("tesoura-laser", "Corte", "Tesoura fio laser 6\"", "Aço inox · corte a seco", { ico: "scissors" }),
  P("tesoura-desbaste", "Corte", "Tesoura de desbaste", "Para tirar volume", { ico: "scissors" }),
  P("pentes", "Corte", "Kit de pentes de corte", "Vários tamanhos · antiestático", { ico: "comb" }),
  P("pentes-encaixe", "Corte", "Pentes de encaixe para máquina", "Do 0,5 ao 8", { ico: "comb" }),
  P("navalhete", "Corte", "Navalhete", "Com trava de segurança", { ico: "razor", selo: "Mais pedido" }),
  P("laminas-navalhete", "Corte", "Lâminas para navalhete", "Caixa com lâminas descartáveis", { ico: "razor" }),
  P("pincel", "Barba", "Pincel de barba", "Cerdas sintéticas macias", { ico: "brush" }),
  P("toalhas", "Barba", "Toalhas de rosto", "Pacote · algodão", { ico: "towel" }),
  P("gel-barbear", "Barba", "Gel de barbear transparente", "Deixa ver o desenho da barba", { ico: "droplet" }),
  P("borrifador", "Bancada", "Borrifador de água", "Névoa contínua", { ico: "spray" }),
  P("capa", "Bancada", "Capa de corte", "Tecido impermeável · fecho de pressão", { ico: "cape" }),
  P("espanador", "Bancada", "Espanador de pescoço", "Cerdas macias", { ico: "feather" }),
  P("secador", "Bancada", "Secador profissional", "Bico concentrador", { ico: "hair-dryer" }),
  P("espelho", "Bancada", "Espelho de mão", "Para mostrar a nuca ao cliente", { ico: "mirror" }),
  P("carrinho", "Bancada", "Carrinho auxiliar", "Três andares · rodinhas", { ico: "tools" }),
  P("papel-pescoco", "Higiene", "Papel de pescoço", "Rolos descartáveis", { ico: "box" }),
  P("luvas", "Higiene", "Luvas descartáveis", "Caixa · nitrílica", { ico: "wash" }),
  P("alcool", "Higiene", "Álcool 70%", "Para ferramentas e bancada", { ico: "hand-sanitizer" }),
  P("esterilizador", "Higiene", "Esterilizador UV", "Para pentes e navalhetes", { ico: "sun" }),
  P("bacia", "Higiene", "Bacia de higienização", "Para pentes e acessórios", { ico: "bucket" }),
  P("cadeira", "Mobiliário", "Cadeira de barbeiro reclinável", "Hidráulica · couro sintético", { ico: "armchair-2", selo: "Sob encomenda" }),
  P("poltrona", "Mobiliário", "Poltrona de espera", "Couro sintético", { ico: "armchair" }),
  P("luminaria", "Mobiliário", "Luminária pendente", "Luz quente para a bancada", { ico: "lamp" }),
  P("display", "Balcão e varejo", "Display de balcão", "Expositor para a linha da marca", { ico: "building-store", selo: "Ajuda a vender" }),
  P("sacolas", "Balcão e varejo", "Sacolas com a sua marca", "Papel kraft · alça", { ico: "shopping-bag" }),
  P("fidelidade", "Balcão e varejo", "Cartão-fidelidade", "Com a sua marca · carimbo", { ico: "tag" }),
  P("vale", "Balcão e varejo", "Vale-presente", "Com a sua marca", { ico: "gift" })
];
console.assert(PRODUTOS.length >= 30 && new Set(PRODUTOS.map(p => p.id)).size === PRODUTOS.length, "catálogo: mínimo de 30 itens e ids únicos");
console.assert(PRODUTOS.every(p => p.preco > 0), "catálogo: todo item precisa de preço de exemplo");
// soma do carrinho {id: quantidade}; ids que não existem mais são ignorados
const subtotalDe = cart => Object.keys(cart).reduce((s, id) => s + (PRODUTOS.find(p => p.id === id)?.preco || 0) * cart[id], 0);
console.assert(subtotalDe({ pentes: 2, navalhete: 1, sumiu: 5 }) === 125, "subtotal do carrinho");

// etapas de cada tipo de pedido, em ordem (prazos ilustrativos até a fábrica confirmar)
const ETAPAS = {
  lote: ["Pedido recebido", "Arte em revisão com o designer", "Arte aprovada por você", "Em produção na fábrica", "Controle de qualidade", "Enviado", "Entregue"],
  revenda: ["Pedido recebido", "Pagamento aprovado", "Separando os itens", "Enviado", "Entregue"],
  varejo: ["Pedido feito", "Pagamento aprovado", "Pronto para retirar na barbearia", "Retirado"]
};

const STARS_DATA = {
  barbearias: { "dom-corte": { nome: "Barbearia Dom Corte", bairro: "Pinheiros", retirada: true } },
  produtos: PRODUTOS,
  etapas: ETAPAS,
  // pedidos de exemplo (datas ilustrativas)
  pedidos: [
    { id: "1042", perfil: "barbearia", tipo: "lote", titulo: "Lote · Pasta Modeladora", datas: ["2026-10-02", "2026-10-03", "2026-10-07", "2026-10-09", null, null, null], atual: 3 },
    { id: "1043", perfil: "barbearia", tipo: "revenda", titulo: "Bancada · 2 capas, 4 borrifadores", datas: ["2026-10-18", "2026-10-18", "2026-10-20", "2026-10-22", null], atual: 3 },
    { id: "1031", perfil: "barbearia", tipo: "revenda", titulo: "Corte · 1 kit de pentes", datas: ["2026-09-12", "2026-09-12", "2026-09-13", "2026-09-15", "2026-09-17"], atual: 4 },
    { id: "C-207", perfil: "cliente", tipo: "varejo", titulo: "Pote · Barbearia Dom Corte", datas: ["2026-10-21", "2026-10-21", "2026-10-22", null], atual: 2 }
  ]
};

/* pedidos feitos no checkout da loja (guardados só neste navegador) */
const PEDIDOS_KEY = "stars-pedidos";
const PEDIDOS = {
  load() { try { return JSON.parse(localStorage.getItem(PEDIDOS_KEY)) || []; } catch { return []; } },
  add(p) {
    const lista = [p, ...PEDIDOS.load()].slice(0, 20);
    try { localStorage.setItem(PEDIDOS_KEY, JSON.stringify(lista)); } catch { /* sem armazenamento: não aparece no painel */ }
    return lista;
  }
};

const FRETE_EXEMPLO = 25; // frete fixo de exemplo (no produto real varia por região)
const ENDERECO_EXEMPLO = "Rua Exemplo, 100 · Centro, Sua Cidade";
const precoTxt = p => p == null ? "R$ [PLACEHOLDER]" : p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataTxt = d => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "";
const hojeISO = (somaDias = 0) => new Date(Date.now() + somaDias * 864e5).toISOString().slice(0, 10);

/* ---- Mentoria: trilhas, cursos, turmas e planos (tudo de exemplo) ---- */
const TRILHAS = [
  { id: "gestao", nome: "Gestão de barbearia", resumo: "Caixa, agenda, equipe e preço. A Suíte UP entra como ferramenta do dia a dia." },
  { id: "marketing", nome: "Marketing", resumo: "Instagram, WhatsApp e indicação para encher a agenda sem depender de promoção." },
  { id: "branding", nome: "Branding", resumo: "Nome, identidade e ambiente: a barbearia que o cliente reconhece de longe." },
  { id: "tecnicas", nome: "Técnicas e tendências", resumo: "Corte e barba atuais, com prática guiada e revisão do seu trabalho." }
];
const CURSOS = [
  { id: "c-gestao-1", trilha: "gestao", titulo: "Caixa e preço certo", aulas: 8, horas: 6, preco: 197, turmas: [["t1", 14, "Online ao vivo"], ["t2", 35, "Online ao vivo"]] },
  { id: "c-gestao-2", trilha: "gestao", titulo: "Equipe, agenda e comissão", aulas: 10, horas: 8, preco: 247, turmas: [["t1", 21, "Online ao vivo"]] },
  { id: "c-mkt-1", trilha: "marketing", titulo: "Instagram da barbearia em 30 dias", aulas: 9, horas: 7, preco: 197, turmas: [["t1", 10, "Online ao vivo"], ["t2", 42, "Online ao vivo"]] },
  { id: "c-mkt-2", trilha: "marketing", titulo: "WhatsApp que vende", aulas: 6, horas: 4, preco: 147, turmas: [["t1", 28, "Online ao vivo"]] },
  { id: "c-brand-1", trilha: "branding", titulo: "Identidade da sua barbearia", aulas: 8, horas: 6, preco: 247, turmas: [["t1", 18, "Online ao vivo"]] },
  { id: "c-tec-1", trilha: "tecnicas", titulo: "Degradê e barba: tendências", aulas: 12, horas: 16, preco: 397, turmas: [["t1", 24, "Presencial · cidade a definir"], ["t2", 56, "Presencial · cidade a definir"]] }
];
const PLANOS_MENTORIA = [
  { id: "avulso", nome: "Avulso", preco: null, itens: ["Um curso à sua escolha", "Aulas gravadas + encontro ao vivo", "Certificado de participação"] },
  { id: "trilha", nome: "Trilha completa", preco: 497, dest: true, itens: ["Todos os cursos de uma trilha", "Revisão do seu material pela equipe", "Grupo da turma"] },
  { id: "passe", nome: "Passe anual", preco: 1497, itens: ["As 4 trilhas durante 12 meses", "Turmas novas sem custo extra", "Mentoria em grupo todo mês"] }
];

/* inscrições feitas na página de Mentoria (guardadas só neste navegador) */
const INSCRICOES_KEY = "stars-inscricoes";
const INSCRICOES = {
  load() { try { return JSON.parse(localStorage.getItem(INSCRICOES_KEY)) || []; } catch { return []; } },
  add(i) {
    const lista = [i, ...INSCRICOES.load().filter(x => !(x.curso === i.curso && x.turma === i.turma))].slice(0, 20);
    try { localStorage.setItem(INSCRICOES_KEY, JSON.stringify(lista)); } catch { /* sem armazenamento: não aparece no painel */ }
    return lista;
  }
};
