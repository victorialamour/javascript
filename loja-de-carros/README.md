# Landing page — Marchetti Veículos

Landing page de uma loja de carros seminovos, feita com HTML, CSS e JavaScript
puros. Sem framework, sem build: basta abrir `index.html` no navegador.

## Estrutura

```
loja-de-carros/
├── index.html      marcação da página
├── css/style.css   tokens de tema, layout e componentes
└── js/script.js    estoque, filtros, simulador e formulário
```

## O que a página faz

- **Estoque dinâmico** — os 12 carros vivem em um único array em `script.js` e
  alimentam os cards, o seletor do simulador e o campo "carro de interesse".
- **Filtros** — categoria, busca por texto e ordenação (preço, km, ano). A busca
  ignora acentos e entende como as pessoas escrevem: `sedan`, `pickup`,
  `eletrico` e `automatico` encontram os carros certos.
- **Simulador de financiamento** — parcela pela Tabela Price a 1,29% ao mês.
  O botão *Simular* de cada card leva o carro escolhido até o simulador.
- **Formulário de contato** — máscara de telefone brasileira, validação campo a
  campo com mensagens que dizem como corrigir, e foco no primeiro erro.
- **Tema claro e escuro** — segue o sistema por padrão e guarda a escolha manual
  no `localStorage`.

## Decisões de design

A identidade parte da ficha técnica do veículo: azul-placa como único acento,
filetes finos no lugar de sombras, e dados (placa, quilometragem, preço) em
monoespaçada com numerais tabulares para alinharem em coluna.

- **Tipografia** — Archivo nos títulos, Instrument Sans no texto, IBM Plex Mono
  nos dados. Todas com pilha de fallback declarada.
- **Acessibilidade** — link de pulo, foco visível, `aria-live` nos resultados,
  rótulos em todos os campos e contraste de no mínimo 4,5:1 nos dois temas.
- **Movimento** — revelação discreta na rolagem e contadores no topo, ambos
  desligados sob `prefers-reduced-motion`.

## Observações

Os veículos, preços e depoimentos são fictícios, para demonstração. O formulário
não envia dados a lugar nenhum: apenas valida e mostra a confirmação na tela.
