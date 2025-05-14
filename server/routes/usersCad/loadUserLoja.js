// apiRelogio.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const getHttpsAgent = () => {
    return new https.Agent({
        rejectUnauthorized: false
    });
};

class Device {
    constructor(ip) {
        this.ip = ip;
        this.session = null;
        this.axiosInstance = axios.create({
            httpsAgent: getHttpsAgent(),
            timeout: 120000, 
            insecureHTTPParser: true
        });
    }

    async login(login, password) {
        try {
            console.log("Iniciando login...");
            const response = await this.axiosInstance.post(`https://${this.ip}/login.fcgi`, {
                "login": login,
                "password": password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.session) {
                this.session = response.data.session;
                console.log("Login bem-sucedido. Sessão:", this.session);
                return this.session;
            } else {
                throw new Error("Resposta inesperada ao fazer login");
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error.message);
            throw error;
        }
    }

    async loadUsers(limit, offset) {
        try {
            console.log("Iniciando obtenção de usuários...");
            const response = await this.axiosInstance.post(`https://${this.ip}/load_users.fcgi`, {
                session: this.session,
                limit: limit,
                offset: offset
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Dados dos usuários obtidos com sucesso.");
            // Retorna os dados dos usuários
            return response.data;
        } catch (error) {
            console.error("Erro ao obter os usuários:", error.message);
            throw error;
        }
    }

    async addUsers(users) {
        try {
            console.log("Iniciando adição de usuários...");
            const response = await this.axiosInstance.post(`https://${this.ip}/add_users.fcgi`, {
                session: this.session,
                users: users
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Usuários adicionados com sucesso.");
            return response.data;
        } catch (error) {
            console.error("Erro ao adicionar usuários:", error.message);
            throw error;
        }
    }

    async updateUsers(users) {
        try {
            console.log("Iniciando atualização de usuários...");
            
            // Adicionando o log para visualizar o JSON
            console.log("Dados enviados para a requisição:", {
                session: this.session, // Apenas uma vez aqui
                users: users
            });
            
            const response = await this.axiosInstance.post(`https://${this.ip}/update_users.fcgi`, {
                session: this.session, // Aqui a session é passada corretamente
                users: users // Aqui apenas a lista de usuários
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log("Usuários atualizados com sucesso.");
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar os usuários:", error.message);
            throw error;
        }
    }
    

    async deleteUsers(data) {
        try {
            const response = await this.axiosInstance.post(`https://${this.ip}/remove_users.fcgi`, {
                session: data.session,
                users: data.users // Passa o PIS dos usuários para exclusão
            });
    
            console.log("Usuários removidos com sucesso:", response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao remover usuários:', error.message);
            throw error;
        }
    }
}


// Rota para fazer login e carregar usuários
router.post('/relogio/load-users', async (req, res) => {
    try {
        const { ip, login, password, limit, offset } = req.body;
        const device = new Device(ip);
        await device.login(login, password);
        const usersData = await device.loadUsers(limit, offset);
        
        res.json(usersData);
    } catch (error) {
        console.error("Erro na requisição:", error.message);
        res.status(500).json({ message: error.message });
    }

    /*REQUEST

        {
        "ip": "192.168.25.90",
        "login": "admin",
        "password": "1234",
        "limit": 100,
        "offset": 0
        }
    */
});

router.post('/relogio/add-users', async (req, res) => {
    try {
        const { ip, login, password, users } = req.body; // Recebe ip, login, password e os usuários a serem adicionados
        const device = new Device(ip);
        
        // Faz o login para obter a sessão
        await device.login(login, password);
        
        // Adiciona os usuários usando a sessão obtida
        const result = await device.addUsers(users);

        // Retorna o resultado da adição
        res.json(result);
    } catch (error) {
        console.error("Erro na requisição:", error.message);
        res.status(500).json({ message: error.message });
    }

    /*REQUEST
    {
  "ip": "192.168.25.90",
  "login": "admin",
  "password": "1234",
  "users": [
    {
      "name": "arthur eduardo",
      "pis": 111,
      "registration": 111,
      "bars": "11",
      "rfid": 111,
      "code": 11,
      "password": "",
      "admin": false,
      "remove_templates": false,
      "templates": []
    }
  ]
}

*/
});

// Rota para atualizar usuários
router.post('/relogio/update-users', async (req, res) => {
    try {
        const { ip, login, password, users } = req.body; // Recebe ip, login, password e os usuários a serem atualizados
        const device = new Device(ip);

        // Verifica se os campos obrigatórios estão presentes
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "Usuários não fornecidos." });
        }

        // Verifica se os campos obrigatórios de cada usuário estão preenchidos
        for (const user of users) {
            if (!user.name || !user.pis || !user.code || !user.registration) {
                return res.status(400).json({ message: "Os campos 'name', 'pis', 'code' e 'registration' são obrigatórios." });
            }
        }

        // Faz o login para obter a sessão
        const session = await device.login(login, password);
        
        // Verifica se a sessão foi obtida corretamente
        if (!session) {
            return res.status(500).json({ message: "Erro ao obter a sessão. Verifique suas credenciais." });
        }

        // Cria a estrutura de requisição para atualização dos usuários
        const requestBody = {
            session: session, // A sessão obtida no login
            users: users.map(user => ({
                admin: user.admin,
                bars: user.bars,
                code: user.code,
                name: user.name,
                new_pis: user.pis, 
                password: user.password,
                pis: user.pis,
                registration: user.registration,
                remove_templates: false, // Se necessário
                rfid: user.rfid,
                templates: [] // Adapte conforme sua necessidade
            }))
        };

        // Atualiza os usuários usando a sessão obtida
        const result = await device.updateUsers(requestBody);

        // Retorna o resultado da atualização
        res.json(result);
    } catch (error) {
        console.error("Erro ao atualizar os usuários:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
});


router.post('/relogio/delete-user', async (req, res) => {
    try {
        const { ip, login, password, users } = req.body;
        const device = new Device(ip);
        
        // Verifica se os usuários foram fornecidos
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "Usuários não fornecidos." });
        }

        // Faz o login para obter a sessão
        const session = await device.login(login, password);

        if (!session) {
            return res.status(500).json({ message: "Erro ao obter a sessão." });
        }

        // Faz a requisição para remover os usuários usando o PIS e a sessão
        const result = await device.deleteUsers({
            session: session, // A sessão obtida no login
            users: users.map(user => user.pis) // Enviando apenas o PIS dos usuários para remoção
        });

        // Retorna o resultado da exclusão
        res.json(result);

    } catch (error) {
        console.error("Erro ao remover usuário:", error.message);
        res.status(500).json({ message: error.message });
    }


    /*
    {
  "ip": "192.168.25.90",
  "login": "admin",
  "password": "1234",
  "users": [
    {
      "pis": 131545646544
    }
  ]
}
    */

});

module.exports = router;
