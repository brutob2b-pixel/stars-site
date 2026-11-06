/* Moldura comum das páginas internas: faixa de demonstração, topo com menu, luz de fundo, rodapé e animação de entrada.
   Cada página marca <body data-pagina="loja|marca|marketing|painel"> e pode pôr botões em [data-top-right]. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SITE = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  return { reduce, G, ST, anima: !!G && !reduce };
})();
document.documentElement.classList.add("js");

(function moldura() {
  const pagina = document.body.dataset.pagina;
  const LINKS = [["index.html", "Início", ""], ["shop.html", "Loja", "loja"], ["marca.html", "Estúdio de marca", "marca"],
    ["marketing.html", "Marketing", "marketing"], ["mentoria.html", "Mentoria", "mentoria"], ["suite.html", "Suíte", "suite"], ["painel.html", "Painel", "painel"]];
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="atmos" aria-hidden="true"></div>
    <div class="draft" role="note"><strong>Demonstração: dados ilustrativos.</strong> Protótipo para apresentação · valores sublinhados são exemplos</div>
    <header class="top">
      <div class="wrap">
        <a class="logo" href="index.html"><span data-brand></span><small>private label para barbearias</small></a>
        <nav aria-label="Páginas" id="menu-site">${LINKS.map(([h, t, k]) => `<a href="${h}"${k === pagina ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
        <div class="right">
          <span data-top-right style="display:contents"></span>
          <button class="btn btn-ghost btn-sm menu-btn" type="button" aria-controls="menu-site" aria-expanded="false">Menu</button>
        </div>
      </div>
    </header>`);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site"><div class="wrap cols">
      <div>© <span data-brand></span> · Protótipo · Razão social e CNPJ: <span class="ph">Stars Comércio de Cosméticos Ltda. · CNPJ 00.000.000/0001-00</span><br>
      Valores, prazos e lotes de exemplo; a fábrica confirma. Produtos cosméticos regularizados na Anvisa: <span class="ph">grau 1, notificação em andamento</span>.</div>
      <div>Fotos: Unsplash (licença Unsplash) · Ícones: Tabler Icons (MIT) · créditos em img/CREDITS.txt</div>
    </div></footer>`);
  $$("[data-brand]").forEach(e => e.textContent = window.BRAND || "Stars");
  const tpl = $("template[data-top]");
  if (tpl) $("[data-top-right]").append(tpl.content.cloneNode(true));
  const menuBtn = $(".menu-btn"), nav = $("#menu-site");
  menuBtn.addEventListener("click", () => { const open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", open); });
  addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); } });
})();

/* entrada na rolagem: chame depois de montar o conteúdo da página (pode chamar de novo para itens novos) */
function revelar(root = document) {
  const els = $$("[data-reveal]:not(.in)", root);
  if (!SITE.anima || !SITE.ST) { els.forEach(e => e.classList.add("in")); return; }
  SITE.ST.batch(els, { start: "top 92%", once: true, onEnter: b => {
    SITE.G.fromTo(b, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 });
    b.forEach(e => e.classList.add("in"));
  } });
}

/* aviso curto no rodapé da tela */
let _toastT;
function avisar(txt) {
  let t = $(".toast");
  if (!t) { t = Object.assign(document.createElement("div"), { className: "toast", role: "status" }); document.body.append(t); }
  t.textContent = txt; t.hidden = false;
  if (SITE.anima) SITE.G.fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
  clearTimeout(_toastT); _toastT = setTimeout(() => { t.hidden = true; }, 2600);
}

/* quantidade de itens no carrinho da loja (para o selo do topo em qualquer página) */
const CART_KEY = "stars-cart-b2b";
const carrinhoLer = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } };
