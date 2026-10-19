
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const contexto = canvas.getContext("2d");

const nomeAluno = document.getElementById("nomeAluno");
const btnLigar = document.getElementById("btnLigar");
const btnCapturar = document.getElementById("btnCapturar");
const btnDesligar = document.getElementById("btnDesligar");
const btnBaixar = document.getElementById("btnBaixar");

const indicador = document.getElementById("indicador");
const mensagem = document.getElementById("mensagem");
const mensagemInicial = document.getElementById("mensagemInicial");
const mensagemFoto = document.getElementById("mensagemFoto");

let stream = null;

async function ligarCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        mensagem.textContent =
            "Seu navegador não permite acessar a câmera neste endereço. Use HTTPS ou localhost.";
        return;
    }

    try {
        mensagem.textContent = "Solicitando acesso à câmera...";

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        video.style.display = "block";
        mensagemInicial.style.display = "none";

        indicador.textContent = "● Ligada";
        indicador.classList.add("ligada");

        btnLigar.disabled = true;
        btnCapturar.disabled = false;
        btnDesligar.disabled = false;

        mensagem.textContent = "Câmera pronta! Você já pode tirar sua foto.";
    } catch (erro) {
        stream = null;

        if (erro.name === "NotAllowedError" ||
            erro.name === "PermissionDeniedError") {
            mensagem.textContent =
                "Permissão negada. Autorize o uso da câmera nas configurações do navegador.";
        } else if (erro.name === "NotFoundError") {
            mensagem.textContent =
                "Nenhuma câmera foi encontrada neste dispositivo.";
        } else {
            mensagem.textContent =
                "Não foi possível ligar a câmera. Verifique a conexão e as permissões.";
        }
    }
}

function capturarFoto() {
    if (!stream || !stream.active || video.readyState < 2 ||
        video.videoWidth === 0) {
        mensagem.textContent =
            "Ligue a câmera e aguarde a imagem aparecer antes de capturar.";
        return;
    }

    const nome = nomeAluno.value.trim();

    if (!nome) {
        mensagem.textContent = "Digite o nome do aluno antes de capturar.";
        nomeAluno.focus();
        return;
    }

    const agora = new Date();
    const dataHora = agora.toLocaleString("pt-BR");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Aplica o filtro visual à imagem desenhada no Canvas.
    contexto.filter = "sepia(1)";
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
    contexto.filter = "none";

    // Adiciona uma faixa escura para melhorar a leitura dos textos.
    const alturaFaixa = Math.max(65, canvas.height * 0.16);

    contexto.fillStyle = "rgba(0, 0, 0, 0.72)";
    contexto.fillRect(
        0,
        canvas.height - alturaFaixa,
        canvas.width,
        alturaFaixa
    );

    // Escreve o nome do aluno sobre a fotografia.
    const margem = canvas.width * 0.035;
    const tamanhoFonte = Math.max(16, canvas.width * 0.035);

    contexto.fillStyle = "#f5d28b";
    contexto.font = `bold ${tamanhoFonte}px Arial`;
    contexto.textAlign = "left";
    contexto.textBaseline = "alphabetic";

    contexto.fillText(
        nome,
        margem,
        canvas.height - alturaFaixa * 0.48,
        canvas.width - margem * 2
    );

    // Escreve a data e a hora da captura.
    contexto.fillStyle = "#ffffff";
    contexto.font = `${Math.max(12, tamanhoFonte * 0.55)}px Arial`;

    contexto.fillText(
        dataHora,
        margem,
        canvas.height - alturaFaixa * 0.16,
        canvas.width - margem * 2
    );

    canvas.style.display = "block";
    mensagemFoto.style.display = "none";
    btnBaixar.disabled = false;

    mensagem.textContent = "Foto capturada e processada com sucesso!";
}

function desligarCamera() {
    if (stream) {
        // Encerra todas as faixas da câmera.
        stream.getTracks().forEach(track => track.stop());

        stream = null;
    }

    video.srcObject = null;
    video.style.display = "none";
    mensagemInicial.style.display = "flex";

    indicador.textContent = "● Desligada";
    indicador.classList.remove("ligada");

    btnLigar.disabled = false;
    btnCapturar.disabled = true;
    btnDesligar.disabled = true;

    mensagem.textContent = "Câmera desligada corretamente.";
}

function baixarFoto() {
    if (canvas.width === 0 || canvas.height === 0) {
        mensagem.textContent = "Capture uma foto antes de baixar.";
        return;
    }

    const link = document.createElement("a");
    link.download = "fotografia-identificada.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

btnLigar.addEventListener("click", ligarCamera);
btnCapturar.addEventListener("click", capturarFoto);
btnDesligar.addEventListener("click", desligarCamera);
btnBaixar.addEventListener("click", baixarFoto);
