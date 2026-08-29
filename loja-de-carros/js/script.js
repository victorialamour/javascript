/* =====================================================================
   Marchetti Veículos — comportamento da página
   ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
   1. Estoque
   ------------------------------------------------------------------ */
const carros = [
  { id: 'civic-touring',  marca: 'Honda',      modelo: 'Civic Touring',      versao: '1.5 Turbo · CVT',        categoria: 'sedan',  ano: 2023, km: 28400, preco: 168900, cambio: 'Automático', combustivel: 'Flex',     cor: 'Cinza Barium',   tinta: '#8A8F99', placa: 'GBX4C27', etiqueta: 'Único dono' },
  { id: 'corolla-cross',  marca: 'Toyota',     modelo: 'Corolla Cross XRE',  versao: '2.0 Dynamic Force',      categoria: 'suv',    ano: 2024, km: 19800, preco: 179500, cambio: 'Automático', combustivel: 'Flex',     cor: 'Prata Lunar',    tinta: '#B7BCC4', placa: 'RJH8B41', etiqueta: 'Recém-chegado' },
  { id: 'nivus-highline', marca: 'Volkswagen', modelo: 'Nivus Highline',     versao: '200 TSI · Automático',   categoria: 'suv',    ano: 2023, km: 34100, preco: 129900, cambio: 'Automático', combustivel: 'Flex',     cor: 'Azul Biscay',    tinta: '#2C4B7C', placa: 'FQK2A18', etiqueta: '' },
  { id: 'compass-long',   marca: 'Jeep',       modelo: 'Compass Longitude',  versao: 'T270 · 4x2',             categoria: 'suv',    ano: 2022, km: 52300, preco: 142000, cambio: 'Automático', combustivel: 'Flex',     cor: 'Branco Vulcano', tinta: '#E4E6E9', placa: 'MDT5F09', etiqueta: '' },
  { id: 'toro-volcano',   marca: 'Fiat',       modelo: 'Toro Volcano',       versao: '1.3 Turbo 270',          categoria: 'picape', ano: 2023, km: 41700, preco: 148900, cambio: 'Automático', combustivel: 'Flex',     cor: 'Vermelho Montecarlo', tinta: '#A32330', placa: 'PBS7J66', etiqueta: '' },
  { id: 'hb20-comfort',   marca: 'Hyundai',    modelo: 'HB20 Comfort Plus',  versao: '1.0 Aspirado',           categoria: 'hatch',  ano: 2024, km: 12900, preco: 79900,  cambio: 'Manual',     combustivel: 'Flex',     cor: 'Cinza Titanium', tinta: '#6F747E', placa: 'LKC3D52', etiqueta: 'Baixa KM' },
  { id: 'onix-ltz',       marca: 'Chevrolet',  modelo: 'Onix LTZ',           versao: '1.0 Turbo · Automático', categoria: 'hatch',  ano: 2023, km: 30500, preco: 87400,  cambio: 'Automático', combustivel: 'Flex',     cor: 'Preto Ouro Negro', tinta: '#23262C', placa: 'HVN9E13', etiqueta: '' },
  { id: 'ranger-xls',     marca: 'Ford',       modelo: 'Ranger XLS',         versao: '2.2 Diesel · 4x4',       categoria: 'picape', ano: 2022, km: 68200, preco: 189000, cambio: 'Automático', combustivel: 'Diesel',   cor: 'Prata Aluminium', tinta: '#9AA0A8', placa: 'TQR1G84', etiqueta: '' },
  { id: 'kwid-zen',       marca: 'Renault',    modelo: 'Kwid Zen',           versao: '1.0 SCe',                categoria: 'hatch',  ano: 2024, km: 15600, preco: 62900,  cambio: 'Manual',     combustivel: 'Flex',     cor: 'Laranja Ocre',   tinta: '#C2662A', placa: 'SNF6H30', etiqueta: 'Melhor preço' },
  { id: 'dolphin-mini',   marca: 'BYD',        modelo: 'Dolphin Mini GS',    versao: '100% elétrico · 380 km', categoria: 'hatch',  ano: 2024, km: 9400,  preco: 108900, cambio: 'Automático', combustivel: 'Elétrico', cor: 'Azul Cosmos',    tinta: '#3E6FA8', placa: 'WCP2K77', etiqueta: 'Elétrico' },
  { id: 'tcross-comfort', marca: 'Volkswagen', modelo: 'T-Cross Comfortline',versao: '200 TSI · Automático',   categoria: 'suv',    ano: 2023, km: 27300, preco: 132500, cambio: 'Automático', combustivel: 'Flex',     cor: 'Cinza Platinum', tinta: '#787D86', placa: 'DXL4M95', etiqueta: '' },
  { id: 'hilux-srv',      marca: 'Toyota',     modelo: 'Hilux SRV',          versao: '2.8 Diesel · 4x4',       categoria: 'picape', ano: 2021, km: 89400, preco: 235000, cambio: 'Automático', combustivel: 'Diesel',   cor: 'Branco Pérola',  tinta: '#DDE0E4', placa: 'ZGB8N24', etiqueta: '' }
];

/* ---------------------------------------------------------------------
   2. Formatação
   ------------------------------------------------------------------ */
const emReais = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});
const emReaisCentavos = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2
});
const emNumero = new Intl.NumberFormat('pt-BR');

const semSinal = (valor) => emReaisCentavos.format(valor).replace(/^R\$\s?/, '');

/** Remove acentos para que "eletrico" encontre "Elétrico" e "sedan" encontre "sedã". */
const semAcento = (texto) => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

/* ---------------------------------------------------------------------
   3. Silhueta do carro (SVG desenhado na cor da pintura)
   ------------------------------------------------------------------ */
function silhueta(tinta, rotulo) {
  return `
  <svg viewBox="0 0 224 96" role="img" aria-label="Ilustração lateral de um ${rotulo}">
    <ellipse cx="112" cy="82" rx="96" ry="6" fill="currentColor" opacity=".08"></ellipse>
    <circle cx="68" cy="66" r="15" fill="#1B1D22"></circle>
    <circle cx="68" cy="66" r="6" fill="#B9BEC9"></circle>
    <circle cx="168" cy="66" r="15" fill="#1B1D22"></circle>
    <circle cx="168" cy="66" r="6" fill="#B9BEC9"></circle>
    <path d="M18 66 L18 52 Q18 45 26 43 L70 33 Q84 20 104 18 L134 17 Q152 17 164 26
             L186 42 L198 45 Q206 47 206 54 L206 68 Q206 71 202 71 L190 71
             Q170 40 146 71 L90 71 Q70 40 46 71 L22 71 Q18 71 18 66 Z"
          fill="${tinta}"></path>
    <path d="M80 33 Q92 24 106 22 L122 21 L122 37 L80 37 Z" fill="#0F1218" opacity=".55"></path>
    <path d="M128 21 L138 21 Q150 23 159 31 L165 37 L128 37 Z" fill="#0F1218" opacity=".55"></path>
    <path d="M24 48 L196 48" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.5"></path>
    <rect x="196" y="49" width="9" height="5" rx="2" fill="#FFE9A8"></rect>
    <rect x="19" y="52" width="7" height="4" rx="2" fill="#D8564F"></rect>
  </svg>`;
}

/* ---------------------------------------------------------------------
   4. Renderização do estoque
   ------------------------------------------------------------------ */
const grade = document.getElementById('grade-carros');
const contador = document.getElementById('contador');
const vazio = document.getElementById('estoque-vazio');
const busca = document.getElementById('busca');
const ordenacao = document.getElementById('ordenacao');
const chips = Array.from(document.querySelectorAll('.chip'));

const rotuloCategoria = {
  todos:  ['veículo', 'veículos'],
  suv:    ['SUV', 'SUVs'],
  sedan:  ['sedã', 'sedãs'],
  hatch:  ['hatch', 'hatches'],
  picape: ['picape', 'picapes']
};

/* Como as pessoas realmente digitam a categoria na busca. */
const apelidosCategoria = {
  suv:    'suv utilitario esportivo',
  sedan:  'sedan seda',
  hatch:  'hatch hatchback compacto',
  picape: 'picape pickup caminhonete'
};

let categoriaAtiva = 'todos';

function cartao(carro) {
  const etiqueta = carro.etiqueta
    ? `<span class="carro-etiqueta">${carro.etiqueta}</span>`
    : '';

  return `
  <article class="carro" style="--cor-tinta: ${carro.tinta}">
    <div class="carro-arte">
      ${etiqueta}
      ${silhueta(carro.tinta, `${carro.marca} ${carro.modelo}`)}
    </div>
    <div class="carro-corpo">
      <p class="carro-placa">${carro.placa} · ${carro.cor}</p>
      <div>
        <h3 class="carro-nome">${carro.marca} ${carro.modelo}</h3>
        <p class="carro-versao">${carro.versao}</p>
      </div>
      <dl class="carro-specs">
        <div><dt>Ano</dt><dd>${carro.ano}</dd></div>
        <div><dt>KM</dt><dd>${emNumero.format(carro.km)}</dd></div>
        <div><dt>Câmbio</dt><dd>${carro.cambio}</dd></div>
        <div><dt>Combustível</dt><dd>${carro.combustivel}</dd></div>
      </dl>
      <div class="carro-rodape">
        <p class="carro-preco">
          <small>À vista</small>
          ${emReais.format(carro.preco)}
        </p>
        <button type="button" class="carro-simular" data-simular="${carro.id}">Simular</button>
      </div>
    </div>
  </article>`;
}

function filtrar() {
  const termo = semAcento(busca.value.trim());

  let lista = carros.filter((carro) => {
    const casaCategoria = categoriaAtiva === 'todos' || carro.categoria === categoriaAtiva;
    const texto = semAcento([
      carro.marca, carro.modelo, carro.versao, carro.combustivel,
      carro.cor, carro.cambio, apelidosCategoria[carro.categoria]
    ].join(' '));
    return casaCategoria && (termo === '' || texto.includes(termo));
  });

  const ordens = {
    'preco-asc':  (a, b) => a.preco - b.preco,
    'preco-desc': (a, b) => b.preco - a.preco,
    'km-asc':     (a, b) => a.km - b.km,
    'ano-desc':   (a, b) => b.ano - a.ano || a.km - b.km
  };
  lista = lista.slice().sort(ordens[ordenacao.value]);

  grade.innerHTML = lista.map(cartao).join('');
  vazio.hidden = lista.length > 0;
  grade.hidden = lista.length === 0;

  const [singular, plural] = rotuloCategoria[categoriaAtiva];
  contador.textContent = lista.length === 1
    ? `1 ${singular} disponível`
    : `${lista.length} ${plural} disponíveis`;
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((outro) => outro.classList.toggle('is-ativo', outro === chip));
    categoriaAtiva = chip.dataset.categoria;
    filtrar();
  });
});

busca.addEventListener('input', filtrar);
ordenacao.addEventListener('change', filtrar);

document.getElementById('limpar-filtros').addEventListener('click', () => {
  busca.value = '';
  ordenacao.value = 'preco-asc';
  categoriaAtiva = 'todos';
  chips.forEach((chip) => chip.classList.toggle('is-ativo', chip.dataset.categoria === 'todos'));
  filtrar();
  busca.focus();
});

filtrar();

/* ---------------------------------------------------------------------
   5. Simulador de financiamento (Tabela Price)
   ------------------------------------------------------------------ */
const TAXA_MENSAL = 0.0129;

const simVeiculo   = document.getElementById('sim-veiculo');
const simPreco     = document.getElementById('sim-preco');
const simEntrada   = document.getElementById('sim-entrada');
const simPrazo     = document.getElementById('sim-prazo');
const entradaValor = document.getElementById('sim-entrada-valor');
const entradaAjuda = document.getElementById('sim-entrada-ajuda');

function opcoesDeVeiculo(selecione) {
  const abertura = `<option value="">${selecione}</option>`;
  const itens = carros
    .slice()
    .sort((a, b) => a.marca.localeCompare(b.marca, 'pt-BR'))
    .map((carro) =>
      `<option value="${carro.id}">${carro.marca} ${carro.modelo} — ${emReais.format(carro.preco)}</option>`
    )
    .join('');
  return abertura + itens;
}

simVeiculo.innerHTML = opcoesDeVeiculo('Escolher do estoque');
document.getElementById('interesse').innerHTML = opcoesDeVeiculo('Ainda estou decidindo');

/** Parcela pela Tabela Price. Com juros zero, divide o valor pelo prazo. */
function parcelaPrice(valor, taxa, meses) {
  if (valor <= 0 || meses <= 0) return 0;
  if (taxa === 0) return valor / meses;
  const fator = Math.pow(1 + taxa, meses);
  return (valor * taxa * fator) / (fator - 1);
}

function calcular() {
  const preco = Math.max(0, Number(simPreco.value) || 0);
  const percentual = Number(simEntrada.value);
  const meses = Number(simPrazo.value);

  const entrada = Math.round((preco * percentual) / 100);
  const financiado = preco - entrada;
  const parcela = parcelaPrice(financiado, TAXA_MENSAL, meses);
  const total = parcela * meses;

  const faixa = (percentual - Number(simEntrada.min)) /
                (Number(simEntrada.max) - Number(simEntrada.min));
  simEntrada.style.setProperty('--preenchido', `${faixa * 100}%`);

  entradaValor.textContent = `${percentual}% · ${emReais.format(entrada)}`;
  entradaAjuda.textContent = financiado > 0
    ? `Restam ${emReais.format(financiado)} para financiar em ${meses}x.`
    : 'Entrada cobre o valor total — nada a financiar.';

  document.getElementById('sim-parcela').textContent = semSinal(parcela);
  document.getElementById('sim-financiado').textContent = emReais.format(financiado);
  document.getElementById('sim-total').textContent = emReais.format(entrada + total);
  document.getElementById('sim-juros').textContent = emReais.format(Math.max(0, total - financiado));
}

simVeiculo.addEventListener('change', () => {
  const carro = carros.find((item) => item.id === simVeiculo.value);
  if (carro) {
    simPreco.value = carro.preco;
    calcular();
  }
});

[simPreco, simEntrada, simPrazo].forEach((campo) => {
  campo.addEventListener('input', calcular);
});

/* "Simular" no card leva o carro escolhido até o simulador */
grade.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-simular]');
  if (!botao) return;

  simVeiculo.value = botao.dataset.simular;
  simVeiculo.dispatchEvent(new Event('change'));
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

calcular();

/* ---------------------------------------------------------------------
   5b. Destaque do hero — montado a partir do mesmo estoque
   ------------------------------------------------------------------ */
(function montarDestaque() {
  const painel = document.getElementById('hero-destaque');
  const carro = carros.find((item) => item.id === 'civic-touring');
  if (!painel || !carro) return;

  const entrada = carro.preco * 0.3;
  const parcela = parcelaPrice(carro.preco - entrada, TAXA_MENSAL, 36);

  painel.innerHTML = `
    <p class="eyebrow">Destaque da semana</p>
    ${silhueta(carro.tinta, `${carro.marca} ${carro.modelo}`)}
    <div>
      <p class="destaque-nome">${carro.marca} ${carro.modelo}</p>
      <p class="destaque-versao">${carro.versao} · ${carro.cor}</p>
    </div>
    <dl class="destaque-specs">
      <div><dt>Ano</dt><dd>${carro.ano}</dd></div>
      <div><dt>Quilometragem</dt><dd>${emNumero.format(carro.km)} km</dd></div>
      <div><dt>Placa</dt><dd>${carro.placa}</dd></div>
    </dl>
    <div class="destaque-preco">
      <strong>${emReais.format(carro.preco)}</strong>
      <span>ou 36x de R$ ${semSinal(parcela)}</span>
    </div>`;
})();

/* ---------------------------------------------------------------------
   6. Formulário de contato
   ------------------------------------------------------------------ */
const formContato = document.getElementById('form-contato');
const sucesso = document.getElementById('form-sucesso');
const telefone = document.getElementById('telefone');

telefone.addEventListener('input', () => {
  const digitos = telefone.value.replace(/\D/g, '').slice(0, 11);
  let formatado = digitos;

  if (digitos.length > 2) {
    const corpo = digitos.slice(2);
    const corte = digitos.length > 10 ? 5 : 4;
    formatado = `(${digitos.slice(0, 2)}) ${corpo.slice(0, corte)}`;
    if (corpo.length > corte) formatado += `-${corpo.slice(corte)}`;
  } else if (digitos.length > 0) {
    formatado = `(${digitos}`;
  }

  telefone.value = formatado;
});

const regras = {
  nome: (valor) => valor.trim().length >= 3 || 'Escreva seu nome completo.',
  email: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) || 'Confira o e-mail: falta o @ ou o domínio.',
  telefone: (valor) => valor.replace(/\D/g, '').length >= 10 || 'Informe DDD e número, com 10 ou 11 dígitos.'
};

function validarCampo(campo) {
  const teste = regras[campo.name];
  if (!teste) return true;

  const resultado = teste(campo.value);
  const alvo = formContato.querySelector(`[data-erro="${campo.name}"]`);
  const valido = resultado === true;

  alvo.textContent = valido ? '' : resultado;
  campo.setAttribute('aria-invalid', String(!valido));
  return valido;
}

Object.keys(regras).forEach((nome) => {
  const campo = formContato.elements[nome];
  campo.addEventListener('blur', () => validarCampo(campo));
  campo.addEventListener('input', () => {
    if (campo.getAttribute('aria-invalid') === 'true') validarCampo(campo);
  });
});

formContato.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const invalidos = Object.keys(regras)
    .map((nome) => ({ campo: formContato.elements[nome], ok: validarCampo(formContato.elements[nome]) }))
    .filter((item) => !item.ok);

  if (invalidos.length > 0) {
    sucesso.hidden = true;
    invalidos[0].campo.focus();
    return;
  }

  const escolhido = carros.find((carro) => carro.id === formContato.elements.interesse.value);
  const primeiroNome = formContato.elements.nome.value.trim().split(/\s+/)[0];

  sucesso.hidden = false;
  sucesso.textContent = escolhido
    ? `Pedido enviado, ${primeiroNome}. Vamos confirmar o test-drive do ${escolhido.marca} ${escolhido.modelo} em até 2 horas úteis.`
    : `Pedido enviado, ${primeiroNome}. Retornamos em até 2 horas úteis para escolher o carro com você.`;

  formContato.reset();
  document.getElementById('interesse').innerHTML = opcoesDeVeiculo('Ainda estou decidindo');
  sucesso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ---------------------------------------------------------------------
   7. Tema
   ------------------------------------------------------------------ */
const raiz = document.documentElement;
const botaoTema = document.getElementById('alternar-tema');

function temaSalvo() {
  try {
    return localStorage.getItem('marchetti-tema');
  } catch (erro) {
    return null;
  }
}

const inicial = temaSalvo();
if (inicial === 'dark' || inicial === 'light') raiz.setAttribute('data-theme', inicial);

botaoTema.addEventListener('click', () => {
  const escuroAgora = raiz.getAttribute('data-theme') === 'dark' ||
    (!raiz.hasAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const novo = escuroAgora ? 'light' : 'dark';
  raiz.setAttribute('data-theme', novo);

  try {
    localStorage.setItem('marchetti-tema', novo);
  } catch (erro) {
    /* navegação privativa: o tema vale só para esta visita */
  }
});

/* ---------------------------------------------------------------------
   8. Menu mobile
   ------------------------------------------------------------------ */
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-principal');

menuToggle.addEventListener('click', () => {
  const aberto = menu.classList.toggle('is-aberto');
  menuToggle.setAttribute('aria-expanded', String(aberto));
  menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

menu.addEventListener('click', (evento) => {
  if (evento.target.tagName !== 'A') return;
  menu.classList.remove('is-aberto');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
});

/* ---------------------------------------------------------------------
   9. Link ativo conforme a rolagem
   ------------------------------------------------------------------ */
const links = Array.from(document.querySelectorAll('.site-nav a'));
const secoes = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle('is-ativo', link.getAttribute('href') === `#${entrada.target.id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  secoes.forEach((secao) => observador.observe(secao));
}

/* ---------------------------------------------------------------------
   10. Animações discretas
   ------------------------------------------------------------------ */
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Contadores do hero */
document.querySelectorAll('.odometro').forEach((alvo) => {
  const destino = Number(alvo.dataset.para);
  const casas = Number(alvo.dataset.decimais || 0);
  const formata = (valor) => valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas, maximumFractionDigits: casas
  });

  if (semMovimento) {
    alvo.textContent = formata(destino);
    return;
  }

  const duracao = 1100;
  let inicio = null;

  function passo(agora) {
    if (inicio === null) inicio = agora;
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - progresso, 3);
    alvo.textContent = formata(destino * suave);
    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
});

/* Revelação em rolagem */
if (!semMovimento && 'IntersectionObserver' in window) {
  const alvos = document.querySelectorAll('.secao-head, .garantias-grid article, .passos li, .depoimentos figure');
  alvos.forEach((alvo, indice) => {
    alvo.classList.add('revelar');
    alvo.style.transitionDelay = `${Math.min(indice % 4, 3) * 70}ms`;
  });

  const revelador = new IntersectionObserver((entradas, self) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('is-visivel');
      self.unobserve(entrada.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

  alvos.forEach((alvo) => revelador.observe(alvo));
}

/* ---------------------------------------------------------------------
   11. Rodapé
   ------------------------------------------------------------------ */
document.getElementById('ano').textContent = new Date().getFullYear();
