import { startStatusUpdate, stopStatusUpdate } from './statusUpdater.js';
import { initializeDownloadAfd } from './downloadAfd/downloadAfd.js';
import { downloadAllAfd } from './downloadAfd/downloadAllAfds.js';
import { lojasDownload } from './userCad/userLojaCad.js';
import { initializeUserLoader } from './userCad/userLojaCad.js';

fetchContent('afdDownload'); 

// Inicializa a navegação da SPA
initializeSpaNavigation();

function initializeSpaNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Previne o comportamento padrão do link

            const contentId = link.getAttribute('data-content'); // Obtém o ID do conteúdo que deve ser mostrado
            fetchContent(contentId); // Chama a função para buscar o conteúdo do servidor
            
            // Adiciona a classe 'active' ao link clicado
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active')); // Remove 'active' de todos os links
            link.classList.add('active'); // Adiciona 'active' ao link clicado
        });
    });
}

// Função para buscar o conteúdo do servidor
function fetchContent(contentId) {
    const mainContent = document.getElementById('mainContent');
    let url;

    switch (contentId) {
        case 'afdDownload':
            url = '/afdDownload';
            break;
        case 'cadastroUsuario':
            url = '/cadastroUsuario';
            break;
        case 'cadLoja':
            url = '/cadLoja';
            break;
        case 'configRelogio':
            url = '/configRelogio';
            break;
        case 'sobre':
            url = '/sobre';
            break;
        default:
            mainContent.innerHTML = '<h1>Bem-vindo!</h1>';
            return;
    }

    // Faz uma requisição para a URL correspondente
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar conteúdo');
        }
        return response.text(); // Converte a resposta para texto
    })
    .then(data => {
        // Atualiza o conteúdo do main com o HTML recebido
        mainContent.innerHTML = data;

        // Chama os scripts específicos após o conteúdo ser carregado
        loadPageScripts(contentId);

        // Se a página for afdDownload, chama o startStatusUpdate aqui
        if (contentId === 'afdDownload') {
            startStatusUpdate(); // Inicia a atualização de status
            document.getElementById('DownloadAfdCompactado').addEventListener('click', downloadAllAfd);
            initializeDownloadAfd();
        } else {
            stopStatusUpdate(); // Para a atualização de status em outras páginas
        }

        if (contentId === 'cadastroUsuario') {
            initializeUserLoader();
        }

    })
    .catch(error => {
        console.error('Erro na requisição:', error); // Log de erro na requisição
        mainContent.innerHTML = '<h1>Erro ao carregar conteúdo.</h1>'; // Mensagem de erro
    });
}

// Função para carregar scripts específicos por página
function loadPageScripts(contentId) {
    // Usando o evento DOMContentLoaded para garantir que os scripts sejam executados após o carregamento do DOM
    document.addEventListener('DOMContentLoaded', () => {
        switch (contentId) {
            case 'afdDownload':
                break;
            case 'cadastroUsuario':
                break;
            case 'cadLoja':
                break;
            case 'configRelogio':
                break;
            case 'sobre':
                break;
            default:
                break;
        }
    });
}
