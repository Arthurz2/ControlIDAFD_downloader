export const downloadAllAfd = async () => {
    // Exibe o modal de carregamento antes de iniciar a requisição
    showLoadingModal();

    try {
        // Faz uma requisição para baixar o arquivo ZIP
        const response = await fetch('/api/downloadAllAfd', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Erro ao baixar o arquivo ZIP.');
        }

        // Cria um link temporário para baixar o arquivo ZIP
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'afd_files.zip'; // Nome do arquivo ZIP
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro durante o download do arquivo ZIP:', error.message);
    } finally {
        // Oculta o modal de carregamento após o término da requisição
        hideLoadingModal();
    }
};

// Função para exibir o modal de carregamento
function showLoadingModal() {
    const modal = document.querySelector('.modal_loading');
    modal.style.display = 'flex'; // Ou 'block', dependendo do seu CSS
}

// Função para ocultar o modal de carregamento
function hideLoadingModal() {
    const modal = document.querySelector('.modal_loading');
    modal.style.display = 'none'; // Oculta o modal após o download
}