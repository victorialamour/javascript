// Landing page do Café Aurora — interações simples da página.

// Ano atual no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Menu responsivo
const menuBotao = document.getElementById('menuBotao');
const menuPrincipal = document.getElementById('menuPrincipal');

function fecharMenu() {
    menuPrincipal.classList.remove('menu--aberto');
    menuBotao.setAttribute('aria-expanded', 'false');
    menuBotao.setAttribute('aria-label', 'Abrir menu');
}

menuBotao.addEventListener('click', () => {
    const aberto = menuPrincipal.classList.toggle('menu--aberto');
    menuBotao.setAttribute('aria-expanded', String(aberto));
    menuBotao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

// Fecha o menu ao clicar em qualquer link dele
menuPrincipal.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', fecharMenu);
});

// Sombra no cabeçalho quando a página rola
const cabecalho = document.querySelector('.cabecalho');

window.addEventListener('scroll', () => {
    cabecalho.classList.toggle('cabecalho--rolagem', window.scrollY > 10);
});

// Formulário de reserva (validação simples, sem back-end)
const formReserva = document.getElementById('formReserva');
const aviso = document.getElementById('aviso');

function mostrarAviso(mensagem, tipo) {
    aviso.textContent = mensagem;
    aviso.className = 'formulario__aviso formulario__aviso--' + tipo;
}

formReserva.addEventListener('submit', evento => {
    evento.preventDefault();

    const nome = formReserva.nome.value.trim();
    const email = formReserva.email.value.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (nome.length < 2) {
        mostrarAviso('Digite seu nome pra gente saber quem esperar.', 'erro');
        formReserva.nome.focus();
        return;
    }

    if (!emailValido) {
        mostrarAviso('Confere o e-mail? Ele parece incompleto.', 'erro');
        formReserva.email.focus();
        return;
    }

    mostrarAviso(`Prontinho, ${nome}! Confirmamos sua mesa por e-mail.`, 'ok');
    formReserva.reset();
});
