// --- ELEMENTOS DO DOM ---
const hudContainer = document.getElementById('hud-container'); const telaInicial = document.getElementById('tela-inicial'); const telaJogo = document.getElementById('tela-jogo'); const telaCreditos = document.getElementById('tela-creditos'); const telaHistoria = document.getElementById('tela-historia'); const telaVitoriaFinal = document.getElementById('tela-vitoria-final');
const btnIniciar = document.getElementById('btn-iniciar'); const btnHistoria = document.getElementById('btn-historia'); const btnCarregarJson = document.getElementById('btn-carregar-json'); const btnCreditos = document.getElementById('btn-creditos'); const btnVoltarCreditos = document.getElementById('btn-voltar-creditos'); const btnVoltarHistoria = document.getElementById('btn-voltar-historia'); const btnVoltarMenuVitoria = document.getElementById('btn-voltar-menu-vitoria'); const btnVoltarMenuGameOver = document.getElementById('btn-voltar-menu-gameover'); const btnSom = document.getElementById('btn-som');
const dicaContainer = document.getElementById('dica-container'); const palavraContainer = document.getElementById('palavra-container'); const tecladoContainer = document.getElementById('teclado-container'); const esqueletoContainer = document.getElementById('esqueleto-container');
const forcaSvg = document.querySelector('.forca-svg'); // NOVO: Seleciona o SVG da forca
const modalGameOver = document.getElementById('modal-gameover'); const palavraReveladaSpan = document.getElementById('palavra-revelada'); const gameoverTitulo = document.getElementById('gameover-titulo'); const gameoverTexto = document.getElementById('gameover-texto'); const jsonUpload = document.getElementById('json-upload'); const timerBar = document.getElementById('timer-bar'); let partesDoCorpo = [];
const pontuacaoDisplay = document.getElementById('pontuacao-display'); const pontuacaoGameOver = document.getElementById('pontuacao-gameover'); const pontuacaoVitoriaFinal = document.getElementById('pontuacao-vitoria-final'); const pontosFlutuantesContainer = document.getElementById('pontos-flutuantes-container');
const palavraReveladaHeader = document.getElementById('palavra-revelada-header');

// --- DADOS PADRÃO DO JOGO ---
const NIVEIS_PADRAO = [ { dica: "Surge quando há diferença de temperatura entre dois ou mais corpos", palavra: "calor" }, { dica: "Está associada ao grau de agitação das partículas", palavra: "temperatura" }, { dica: "Para que seja melor aproveitado para o resfriamento, um ar condicionado deve ficar em uma possiçao mais ______ na parede", palavra: "acima" }, { dica: "Sua unidade é cal/°C", palavra: "capacidade termica" }, { dica: "O da água vale 1 cal/g°C", palavra: "calor especifico" }, { dica: "Tipo de transmissão de calor propagado de partícula a partícula", palavra: "conduçao" }, { dica: "Tipo de transmissão de calor que não necessita de um meio para se propagar", palavra: "irradiaçao" }, { dica: "Transmissão de calor que acontece em fluidos", palavra: "convecçao" }, { dica: "Em metais ela é alta", palavra: "condutividade termica" }, { dica: "Recipiente utilizado para estudos de trocas de calor", palavra: "calorimetro" }];
// --- VARIÁVEIS DO JOGO ---
let niveis = []; let nivelAtual = 0; let palavraSecreta = ''; let letrasCorretas = []; let erros = 0; const maxErros = 6; let timer; let tempoRestante; const TEMPO_INICIAL = 40; let pontuacaoTotal = 0; let pontosInstantaneos = 0; let somEstaAtivado = true;

// --- EFEITOS SONOROS ---
const somAcerto = new Audio('assets/sounds/acerto.mp3'); const somErro = new Audio('assets/sounds/erro.mp3'); const somVitoriaNivel = new Audio('assets/sounds/vitoria.mp3'); const somGameOverAudio = new Audio('assets/sounds/game-over.mp3'); const somVitoriaFinal = new Audio('assets/sounds/vitoria-final.mp3'); const musicaFundo = new Audio('assets/sounds/musica-fundo.mp3');
musicaFundo.loop = true; musicaFundo.volume = 0.4;

// --- SISTEMA DE SOM ---
function tocarSom(som) { if (somEstaAtivado) { som.currentTime = 0; som.play(); } }
function tocarMusicaFundo() { if (somEstaAtivado) { musicaFundo.play(); } }
function pararMusicaFundo() { musicaFundo.pause(); musicaFundo.currentTime = 0; }
function configurarSomVitoriaFinal() { pararMusicaFundo(); if (somEstaAtivado) { somVitoriaFinal.loop = true; somVitoriaFinal.play(); } }
function pararSomVitoriaFinal() { somVitoriaFinal.pause(); somVitoriaFinal.currentTime = 0; }

// --- CONTROLE DE TELAS ---
function mostrarTela(nomeTela) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.add('hidden'));
    hudContainer.classList.add('hidden');
    if (nomeTela !== 'tela-jogo') { pararMusicaFundo(); }
    const telaParaMostrar = document.getElementById(nomeTela);
    if (telaParaMostrar) {
        telaParaMostrar.classList.remove('hidden');
        if (nomeTela === 'tela-jogo') { hudContainer.classList.remove('hidden'); tocarMusicaFundo(); }
    }
}

// --- LÓGICA DO JOGO ---
function iniciarTimer() { pararTimer(); tempoRestante = TEMPO_INICIAL; timerBar.style.transition = 'none'; timerBar.style.width = '100%'; setTimeout(() => { timerBar.style.transition = 'width 1s linear'; }, 50); timer = setInterval(atualizarTimer, 1000); }
function pararTimer() { clearInterval(timer); }
function atualizarTimer() { tempoRestante--; const porcentagemTempo = (tempoRestante / TEMPO_INICIAL) * 100; timerBar.style.width = `${porcentagemTempo}%`; if (tempoRestante <= 0) { pararTimer(); mostrarGameOver(true); } }
function atualizarDisplayPontuacao() { pontuacaoDisplay.textContent = pontuacaoTotal + pontosInstantaneos; }
function animarPontos(valor, tipo = '') { const p = document.createElement('span'); p.className = 'ponto-flutuante'; if (valor > 0) { p.textContent = `+${valor}`; p.classList.add('positivo'); } else { p.textContent = valor; p.classList.add('negativo'); } if (tipo === 'bonus') { p.classList.add('bonus'); p.textContent += ' BÔNUS'; } pontosFlutuantesContainer.appendChild(p); setTimeout(() => { p.remove(); }, 1500); }
function prepararEIniciarJogo(listaDeNiveis) { niveis = shuffleArray([...listaDeNiveis]); nivelAtual = 0; pontuacaoTotal = 0; iniciarNivel(); mostrarTela('tela-jogo'); }
function iniciarNivel() {
    erros = 0; letrasCorretas = []; pontosInstantaneos = 0;
    palavraSecreta = niveis[nivelAtual].palavra.toUpperCase();
    dicaContainer.textContent = `Dica: ${niveis[nivelAtual].dica}`;
    palavraContainer.className = 'palavra';
    forcaSvg.classList.remove('forca-escondida'); // Garante que o SVG da forca reapareça
    palavraReveladaHeader.textContent = '';
    atualizarDisplayPontuacao(); iniciarTimer();
    criarEsqueleto(); desenharPalavra(); desenharTeclado();
    modalGameOver.classList.remove('visivel');
}
function criarEsqueleto() {
    esqueletoContainer.innerHTML = '';
    const nomesPartes = ['cabeca', 'tronco', 'braco-direito', 'braco-esquerdo', 'perna-direita', 'perna-esquerda'];
    nomesPartes.forEach(nome => { const img = document.createElement('img'); img.src = `assets/images/${nome}.svg`; img.classList.add('esqueleto-parte'); img.id = nome; esqueletoContainer.appendChild(img); });
    partesDoCorpo = document.querySelectorAll('.esqueleto-parte');
    partesDoCorpo.forEach(parte => parte.classList.remove('visivel'));
    esqueletoContainer.classList.remove('correndo', 'dancando', 'caindo');
}
function desenharPalavra() {
    palavraContainer.innerHTML = ''; const limiteCaracteres = 18;
    const renderizarLinha = (texto) => { const linhaDiv = document.createElement('div'); linhaDiv.className = 'linha-palavra'; linhaDiv.innerHTML = texto.split('').map(letra => { if (letra === ' ') { return `<div class="espaco"></div>`; } else { return `<div class="letra">${letrasCorretas.includes(letra) ? letra : ''}</div>`; } }).join(''); return linhaDiv; };
    if (palavraSecreta.length > limiteCaracteres && palavraSecreta.includes(' ')) {
        const meio = Math.floor(palavraSecreta.length / 2); const espacoAntes = palavraSecreta.lastIndexOf(' ', meio); const espacoDepois = palavraSecreta.indexOf(' ', meio); let pontoDeQuebra = -1;
        if (espacoAntes !== -1 && espacoDepois !== -1) { pontoDeQuebra = (meio - espacoAntes) < (espacoDepois - meio) ? espacoAntes : espacoDepois; } else { pontoDeQuebra = (espacoAntes !== -1) ? espacoAntes : espacoDepois; }
        if (pontoDeQuebra !== -1) { const primeiraParte = palavraSecreta.substring(0, pontoDeQuebra); const segundaParte = palavraSecreta.substring(pontoDeQuebra + 1); palavraContainer.appendChild(renderizarLinha(primeiraParte)); palavraContainer.appendChild(renderizarLinha(segundaParte)); } else { palavraContainer.appendChild(renderizarLinha(palavraSecreta)); }
    } else { palavraContainer.appendChild(renderizarLinha(palavraSecreta)); }
}
function desenharTeclado() { tecladoContainer.innerHTML = ''; const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ'; alfabeto.split('').forEach(letra => { const botao = document.createElement('button'); botao.className = 'tecla'; botao.textContent = letra; botao.addEventListener('click', () => processarJogada(letra)); tecladoContainer.appendChild(botao); }); }
function processarJogada(letra) {
    letra = letra.toUpperCase();
    document.querySelectorAll('.tecla').forEach(botao => { if (botao.textContent === letra) { botao.disabled = true; } });
    if (palavraSecreta.includes(letra)) {
        tocarSom(somAcerto);
        if (!letrasCorretas.includes(letra)) {
            letrasCorretas.push(letra); const numOcorrencias = palavraSecreta.split(letra).length - 1; const pontosGanhos = 5 * numOcorrencias;
            pontosInstantaneos += pontosGanhos; animarPontos(pontosGanhos);
        }
    } else { tocarSom(somErro); erros++; pontosInstantaneos -= 5; animarPontos(-5); desenharForca(); }
    atualizarDisplayPontuacao(); desenharPalavra(); verificarEstadoJogo();
}
function desenharForca() { if (erros > 0 && erros <= maxErros) { partesDoCorpo[erros - 1].classList.add('visivel'); } }
function verificarEstadoJogo() {
    if (erros >= maxErros) { pararTimer(); mostrarGameOver(false); return; }
    const letrasDaPalavra = [...new Set(palavraSecreta.replace(/ /g, ''))];
    const vitoria = letrasDaPalavra.every(letra => letrasCorretas.includes(letra));
    if (vitoria) {
        pararTimer();
        const pontosFase = Math.round((tempoRestante / TEMPO_INICIAL) * 10);
        animarPontos(pontosFase, 'bonus');
        pontuacaoTotal += pontosInstantaneos + pontosFase;
        pontosInstantaneos = 0;
        atualizarDisplayPontuacao();
        palavraContainer.classList.add('palavra-ganha');
        forcaSvg.classList.add('forca-escondida'); // ATUALIZADO: Esconde SÓ o SVG
        setTimeout(() => { palavraReveladaHeader.textContent = palavraSecreta; }, 1800);
        setTimeout(() => {
            if (nivelAtual < niveis.length - 1) {
                tocarSom(somVitoriaNivel); animacaoVitoriaNivel();
            } else { animacaoVitoriaFinal(); }
        }, 2000);
    }
}

// ATUALIZADO: Lógica do Game Over mais robusta
function mostrarGameOver(porTempo = false) {
    pararMusicaFundo();
    tocarSom(somGameOverAudio);
    if (porTempo) {
        gameoverTitulo.textContent = "TEMPO ESGOTADO!";
    } else {
        esqueletoContainer.classList.add('caindo');
        gameoverTitulo.textContent = "GAME OVER";
    }
    gameoverTexto.innerHTML = `A palavra era: <span id="palavra-revelada">${palavraSecreta}</span>`;
    pontuacaoGameOver.textContent = pontuacaoTotal + pontosInstantaneos;
    
    // Mostra o modal com transição de CSS em vez de setTimeout
    modalGameOver.classList.add('visivel');
}

function animacaoVitoriaNivel() {
    if ((niveis.length - 1) - nivelAtual <= 3) { esqueletoContainer.innerHTML = '<div class="esqueleto-sprite-2"></div>'; }
    else { esqueletoContainer.innerHTML = '<div class="esqueleto-sprite"></div>'; }
    esqueletoContainer.classList.add('correndo');
    setTimeout(() => { nivelAtual++; iniciarNivel(); }, 5000);
}
function animacaoVitoriaFinal() { pararTimer(); pontuacaoVitoriaFinal.textContent = pontuacaoTotal; configurarSomVitoriaFinal(); mostrarTela('tela-vitoria-final'); }

// --- EVENT LISTENERS ---
btnIniciar.addEventListener('click', () => prepararEIniciarJogo(NIVEIS_PADRAO));
btnHistoria.addEventListener('click', () => mostrarTela('tela-historia'));
btnCreditos.addEventListener('click', () => mostrarTela('tela-creditos'));
btnVoltarCreditos.addEventListener('click', () => mostrarTela('tela-inicial'));
btnVoltarHistoria.addEventListener('click', () => mostrarTela('tela-inicial'));
btnVoltarMenuVitoria.addEventListener('click', () => { pararSomVitoriaFinal(); mostrarTela('tela-inicial'); });
btnVoltarMenuGameOver.addEventListener('click', () => { modalGameOver.classList.remove('visivel'); mostrarTela('tela-inicial'); });
btnCarregarJson.addEventListener('click', () => jsonUpload.click());
jsonUpload.addEventListener('change', (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(event) { try { const niveisDoUsuario = JSON.parse(event.target.result); if (Array.isArray(niveisDoUsuario) && niveisDoUsuario.length > 0) { prepararEIniciarJogo(niveisDoUsuario); } else { alert("O arquivo JSON está vazio ou em formato incorreto."); } } catch (err) { alert("Arquivo JSON inválido!"); } }; reader.readAsText(file); });
btnSom.addEventListener('click', () => { somEstaAtivado = !somEstaAtivado; btnSom.textContent = somEstaAtivado ? '🔊' : '🔇'; if (!somEstaAtivado) { pararMusicaFundo(); pararSomVitoriaFinal(); } else { if (!telaJogo.classList.contains('hidden')) { tocarMusicaFundo(); } } });
window.addEventListener('keydown', (e) => { if (!telaJogo.classList.contains('hidden')) { const letra = e.key.toUpperCase(); if ((letra >= 'A' && letra <= 'Z') || letra === 'Ç') { const botao = Array.from(document.querySelectorAll('.tecla')).find(b => b.textContent === letra); if (botao && !botao.disabled) { processarJogada(letra); } } } });

// --- INICIALIZAÇÃO ---
mostrarTela('tela-inicial');
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } return array; }

