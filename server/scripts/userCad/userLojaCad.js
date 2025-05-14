export const lojasDownload = {
    DownloadAfd01: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd02: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd03: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: '12345',
    },
    DownloadAfd04: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: 'admin',
    },
    DownloadAfd05: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: '1234',
    },
    DownloadAfd06: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: 'admin',
    },
    DownloadAfd07: {
        ip: '192.168.0.0',
        login: 'admin',
        senha: '1234',
    }
};

const usersByLoja = {};

let currentPage = 1; // Página atual
const usersPerPage = 10; // Limite de usuários por página
let allUsers = []; // Armazenar todos os usuários carregados

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

function closeErrorModal() {
    const errorModal = document.querySelector('.modal_error');
    errorModal.style.display = 'none'; // Esconde o modal
}

const deleteUser  = async (pis) => {
    if (confirm(`Tem certeza que deseja excluir o usuário com PIS: ${pis}?`)) {
        try {
            showLoadingModal();
            const selectedLoja = document.getElementById('relogioLoja').value;
            const { ip, login, senha } = lojasDownload[selectedLoja]; // Obtém os dados da loja

            // Requisição para excluir o usuário
            const response = await fetch('/api/relogio/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ip: ip,
                    login: login,
                    password: senha,
                    users: [{ pis: Number(pis) }] // Converte o PIS para número
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir usuário');
            }
            hideLoadingModal();
            const data = await response.json();
            console.log('Usuário excluído com sucesso:', data);
            
            // Remove o usuário da lista em memória
            allUsers = allUsers.filter(user => user.pis !== Number(pis));
            usersByLoja[selectedLoja] = usersByLoja[selectedLoja].filter(user => user.pis !== Number(pis));

            // Chama a função para recarregar a lista de usuários
            await loadUsers(selectedLoja);

        } catch (error) {
            console.error('Erro:', error.message);
        }
    }
};

const loadUsers = async (selectedLoja) => {

    showLoadingModal();
    // Verifica se os usuários dessa loja já estão carregados
    if (usersByLoja[selectedLoja]) {
        console.log('Usuários carregados da memória:', usersByLoja[selectedLoja]);
        allUsers = usersByLoja[selectedLoja]; // Usa os usuários armazenados
        currentPage = 1; // Reinicia para a primeira página
        populateTable(allUsers); // Popula a tabela com os dados armazenados
        updatePaginationControls(allUsers.length); // Atualiza os controles de paginação
        hideLoadingModal();
        return; // Sai da função, não faz a requisição
    }

    const { ip, login, senha } = lojasDownload[selectedLoja];

    try {
        const response = await fetch('/api/relogio/load-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip: ip,
                login: login,
                password: senha,
                limit: 100,
                offset: 0
            }),
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }

        const data = await response.json();
        allUsers = data.users; // Armazena todos os usuários
        usersByLoja[selectedLoja] = allUsers; // Salva a lista de usuários no objeto

        console.log(`Usuários da loja ${selectedLoja} armazenados:`, usersByLoja[selectedLoja]);

        currentPage = 1; // Reinicia para a primeira página
        populateTable(allUsers); // Popula a tabela com os dados retornados
        updatePaginationControls(allUsers.length); // Atualiza os controles de paginação
        hideLoadingModal();

    } catch (error) {
        hideLoadingModal();
        showErrorModal();
        console.error('Erro:', error.message);

    }
};


export const initializeUserLoader = () => {
    document.getElementById('closeModalError').addEventListener('click', closeErrorModal);
        // Fechar o modal ao clicar no botão de fechar
    document.getElementById('closeBtnModalEditUser').addEventListener('click', () => {
        document.querySelector('.modal_edit_user').style.display = 'none';
    });

    // Cancelar a edição e fechar o modal
    document.getElementById('cancelButton').addEventListener('click', () => {
        document.querySelector('.modal_edit_user').style.display = 'none';
    });

    document.getElementById('loadUsersBtn').addEventListener('click', async () => {
        const selectedLoja = document.getElementById('relogioLoja').value;
        await loadUsers(selectedLoja);
    });

    document.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('#deleteBtn');
        if (deleteBtn) {
            const pis = deleteBtn.dataset.pis; // Obtém o PIS do botão de deletar
            deleteUser(pis); // Chama a função de exclusão passando o PIS
        }
    });

    // Função para cadastrar novos usuários
    document.getElementById('userForm').addEventListener('submit', async (event) => {

        showLoadingModal();
        // Obtendo os valores dos campos obrigatórios
        const name = document.getElementById('name-user').value.trim();
        const pis = document.getElementById('pis-user').value.trim();
    
        // Verificando se os campos obrigatórios estão preenchidos
        if (!name || !pis) {
            alert('Os campos Nome e PIS são obrigatórios.');
            return; // Se os campos obrigatórios não estão preenchidos, para a execução
        }
    
        const selectedLoja = document.getElementById('relogioLojaCadUser').value;
        const { ip, login, senha } = lojasDownload[selectedLoja];
    
        // Criando o objeto `newUser` e adicionando apenas os campos que possuem valor
        const newUser = {
            name: name.toUpperCase(),
            pis: Number(pis), // Converte para número
            remove_templates: false, // Campo obrigatório
            templates: [] // Campo obrigatório
        };
    
        // Adicionando os campos opcionais apenas se eles estiverem preenchidos
        const registration = document.getElementById('registration-user').value;
        if (registration) {
            newUser.registration = Number(registration);
        }
    
        const bars = document.getElementById('bars-user').value;
        if (bars) {
            newUser.bars = bars;
        }
    
        const rfid = document.getElementById('rfid-user').value;
        if (rfid) {
            newUser.rfid = Number(rfid);
        }
    
        const password = document.getElementById('password-user').value;
        if (password) {
            newUser.password = password;
        }
    
        const admin = document.getElementById('admin-user').checked;
        if (admin) {
            newUser.admin = true;
        }
    
        try {
            const response = await fetch('/api/relogio/add-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ip: ip,
                    login: login,
                    password: senha,
                    users: [newUser], // Envia o objeto `newUser` dentro de um array
                }),
            });
    
            if (!response.ok) {
                throw new Error('Erro ao cadastrar usuário');
            }

            hideLoadingModal();
            const data = await response.json();
            console.log('Usuário cadastrado com sucesso:', data);
    
            // Limpar o formulário
            document.getElementById('userForm').reset();
    
            await loadUsers(selectedLoja);

        } catch (error) {
            console.error('Erro:', error.message);
        }
    });
    
    
};

const openEditUserModal = (name, pis, registration, admin, bars, rfid, password) => {
    const modal = document.querySelector('.modal_edit_user');
    
    // Preenche os campos do modal com os dados do usuário
    document.getElementById('name').value = name || '';
    document.getElementById('pis').value = pis || '';
    document.getElementById('registration').value = registration || '';
    document.getElementById('bars').value = bars || '';
    document.getElementById('rfid').value = rfid || '';
    document.getElementById('password').value = password || '';

    document.getElementById('admin').checked = admin === 'true' || admin === true;

    // Exibe o modal
    modal.style.display = 'block';
};


// Função para popular a tabela com os dados dos usuários
const populateTable = (users) => {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; // Limpa a tabela antes de preencher

    // Ordena os usuários por nome
    const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));

    // Pega os usuários para a página atual
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = sortedUsers.slice(startIndex, endIndex);

    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        
        // Adiciona atributos de dados na linha
        row.dataset.name = user.name;
        row.dataset.pis = user.pis;
        row.dataset.registration = user.registration;

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.pis}</td>
            <td>${user.registration}</td>
            <td>${user.templates_count}</td>
            <td>${user.rfid}</td>
            <td>${user.bars}</td>
            <td>${user.password}</td>
            <td>${user.admin ? 'Sim' : 'Não'}</td>
            <td>
                <button id="btnEdit" class="BtnEditDelete" 
                    data-name="${user.name}" 
                    data-pis="${user.pis}" 
                    data-admin="${user.admin}"
                    data-password="${user.password}"
                    data-registration="${user.registration}"
                    data-rfid="${user.rfid}"
                    data-bars="${user.bars}">
                    <img src="../../assets/iconEdit.svg" alt="icone edite">
                </button>
            </td>
            <td>
                <button id="deleteBtn" class="BtnEditDelete" data-pis="${user.pis}">
                    <img src="../../assets/iconDelete.svg" alt="icone deletar">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Adiciona evento de clique nos botões de edição
    document.querySelectorAll('#btnEdit').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const pis = button.dataset.pis;
            const registration = button.dataset.registration;
            const admin = button.dataset.admin;
            const password = button.dataset.password;
            const rfid = button.dataset.rfid;
            const bars = button.dataset.bars;

            // Chama a função que abre o modal e preenche os dados
            openEditUserModal(name, pis, registration, admin, rfid, bars );
        });
    });
};


// Atualiza os controles de paginação
const updatePaginationControls = (totalUsers) => {
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    prevPageBtn.disabled = currentPage === 1; // Desativa o botão "Anterior" na primeira página
    nextPageBtn.disabled = currentPage === totalPages; // Desativa o botão "Próximo" na última página

    // Adiciona eventos para os botões de navegação
    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            populateTable(allUsers); // Popula a tabela com a lista completa de usuários
            updatePaginationControls(totalUsers); // Atualiza os controles de paginação
        }
    };

    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            populateTable(allUsers); // Popula a tabela com a lista completa de usuários
            updatePaginationControls(totalUsers); // Atualiza os controles de paginação
        }
    };
};




