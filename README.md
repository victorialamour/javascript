# javascript

Curso de JavaScript do CursoemVideo

---

## Studio M'man — site

Site estático do estúdio, escrito à mão em HTML, CSS e JavaScript. Sem
framework, sem build, sem dependência externa: é só abrir o `index.html`.

```
index.html               a página inteira, com a copy final do deck
assets/css/fonts.css     @font-face das fontes auto-hospedadas
assets/css/style.css     tokens no topo, depois base, peças e seções
assets/js/main.js        toda a camada de movimento
assets/fonts/            Anton, IBM Plex Mono e Newsreader (.woff2)
assets/img/favicon.svg
```

Para rodar localmente, qualquer servidor estático serve:

```sh
python3 -m http.server 8000
# depois: http://localhost:8000
```

### Seções

Na ordem em que aparecem: hero, sobre nós, projetos, manifesto, serviços,
método, planos, estúdio, novidades, contato e rodapé — a mesma sequência do
deck de copy.

### Movimento

Tudo é conduzido por um único `requestAnimationFrame` em `main.js`, sem
biblioteca de animação:

- **rolagem com inércia** — a roda do mouse alimenta um alvo e a página
  persegue esse alvo por interpolação. Desligada no toque (o navegador já
  faz melhor) e com movimento reduzido.
- **máscara de linha** — cada linha de manchete sobe de baixo, escalonada.
- **cartão em paralaxe** — no hero, a peça atravessa a manchete por trás.
- **takeover do projeto** — painel em cor cheia; o nome entra letra a letra
  e a maquete cresce conforme entra na tela. As barras fixas invertem a cor
  enquanto passam por cima dele.
- **texto que acende** — no manifesto, as palavras vão do cinza ao preto na
  medida da rolagem.
- **rastro no cursor** — ladrilhos que nascem sob o ponteiro dentro do
  manifesto.
- **lista grande** — em serviços e método, o item mais próximo do centro da
  tela acende, abre o texto e troca a miniatura ao lado.
- **wordmark** — o `M'MAN` do rodapé é medido em tempo real para encher a
  largura exata da janela, e sobe até fechar junto com o fim da página.

Todo o conjunto respeita `prefers-reduced-motion`: com ele ligado, nada se
move e todo o conteúdo aparece estático.

### Tema e relógio

O modo claro/escuro segue a preferência do sistema na primeira visita e
depois guarda a escolha no `localStorage`. O relógio do rodapé roda em
horário de Recife (`America/Recife`).

### Formulário

Sem back-end: o envio monta a mensagem e abre o WhatsApp do estúdio. Para
trocar por um endpoint de verdade (Formspree, Basin, função serverless),
substituir o `window.open` marcado com comentário em `main.js`.

### Fontes

Auto-hospedadas em `assets/fonts/` (subsets latin e latin-ext), baixadas do
Google Fonts sob a SIL Open Font License 1.1. Nada é carregado de terceiros
em tempo de execução.
