export const lojasDownload = {
    DownloadAfd01: {
        ip: '192.168.25.90',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd02: {
        ip: '192.168.22.153',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd03: {
        ip: '192.168.23.178',
        login: 'admin',
        senha: '12345',
    },
    DownloadAfd04: {
        ip: '192.168.15.183',
        login: 'admin',
        senha: 'admin',
    },
    DownloadAfd05: {
        ip: '192.168.5.30',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd06: {
        ip: '192.168.0.62',
        login: 'admin',
        senha: 'admin',
    },
    DownloadAfd07: {
        ip: '192.168.27.152',
        login: 'admin',
        senha: '1234',
    }
};

function showLoadingModal() {
    const modal = document.querySelector('.modal_loading');
    modal.style.display = 'flex'; // Ou 'block', dependendo do seu CSS
}

// Função para ocultar o modal de carregamento
function hideLoadingModal() {
    const modal = document.querySelector('.modal_loading');
    modal.style.display = 'none'; // Ou 'none', dependendo do seu CSS
}

function showErrorModal() {
    const errorModal = document.querySelector('.modal_error');
    errorModal.style.display = 'flex'; // Ou 'block', dependendo do seu CSS
}


export function initializeDownloadAfd() {
    document.getElementById('closeModalError').addEventListener('click', function() {
        document.querySelector('.modal_error').style.display = 'none';
    });

    document.querySelectorAll('.button_download_afd').forEach(button => {
        button.addEventListener('click', (event) => {
            const lojaId = event.target.id; // O ID do botão é o mesmo que a chave no objeto lojasDownload
            const lojaData = lojasDownload[lojaId];

            if (lojaData) {
                showLoadingModal(); // Exibe o modal de carregamento

                fetch('/api/downloadAfd', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(lojaData) // Envia os dados da loja como JSON
                })
                .then(response => {
                    // Verifica se a resposta é OK
                    if (!response.ok) {
                        throw new Error('Erro ao realizar o download');
                    }
                    return response.text(); // Converte a resposta para texto
                })
                .then(data => {
                    // Extrai a última linha do texto
                    const lines = data.split('\n'); // Divide o texto em linhas
                    const lastLine = lines[lines.length - 1]; // Pega a última linha
                    let fileName = lastLine.replace('.txt', ''); // Remove a extensão .txt

                    // Cria um Blob com os dados
                    const blob = new Blob([data], { type: 'text/plain' }); // Cria um blob de texto
                    const url = window.URL.createObjectURL(blob); // Cria um URL temporário para o blob
                    const a = document.createElement('a'); // Cria um link
                    a.href = url;

                    a.download = fileName; // Define o nome do arquivo a ser baixado
                    document.body.appendChild(a); // Adiciona o link ao DOM
                    a.click(); // Simula o clique para iniciar o download
                    a.remove(); // Remove o link do DOM

                    // Libera o URL temporário
                    window.URL.revokeObjectURL(url);

                    console.log('Download realizado com sucesso!');
                })
                .catch(error => {
                    console.error('Erro na requisição:', error); // Log de erro na requisição
                    hideLoadingModal();
                    showErrorModal();
                })
                .finally(() => {
                    hideLoadingModal(); // Oculta o modal de carregamento, independente do resultado
                });
            } else {
                console.error('Loja não encontrada:', lojaId); // Log se a loja não foi encontrada
            }
        });
    });
}