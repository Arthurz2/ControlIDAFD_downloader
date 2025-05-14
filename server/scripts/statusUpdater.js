let statusUpdateInterval; // Variável para armazenar o intervalo
let isPaused = false; // Variável para controlar o estado de pausa

async function updateStatus() {
    if (isPaused) {
        // Se estiver pausado, não executa o fetch
        return;
    }

    try {
        const response = await fetch('/status');
        const statuses = await response.json();

        statuses.forEach(({ id, status }) => {
            const lojaDiv = document.getElementById(id);
            if (lojaDiv) { // Verifica se o elemento existe
                const button = lojaDiv.querySelector('.button_online_offline_loja');
                if (button) {
                    button.textContent = status;
                    button.removeAttribute('id');
                    button.setAttribute('id', `${status}`);
                }
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

function startStatusUpdate() {
    if (!isPaused) {
        // Se não estiver pausado, inicia o intervalo
        statusUpdateInterval = setInterval(updateStatus, 1000); // Atualiza a cada segundo
        updateStatus(); // Chamada inicial
    }
}

function stopStatusUpdate() {
    isPaused = true; // Define como pausado
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval); // Para o intervalo
        statusUpdateInterval = null; // Reseta a variável
    }
}

// Função chamada quando a página é carregada
function onPageLoad() {
    isPaused = false; // Redefine para não pausado
    startStatusUpdate(); // Inicia a atualização de status
}

// Função chamada quando a página é descarregada
function onPageUnload() {
    stopStatusUpdate(); // Para a atualização de status
}

// Adiciona eventos de carregamento e descarregamento da página
window.addEventListener('load', onPageLoad);
window.addEventListener('beforeunload', onPageUnload);

// Exporta as funções para uso externo
export { startStatusUpdate, stopStatusUpdate };
