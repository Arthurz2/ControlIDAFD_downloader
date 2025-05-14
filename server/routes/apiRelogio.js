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

    async getAfd() {
        try {
            console.log("Iniciando obtenção de AFD...");
            const response = await this.axiosInstance.post(`https://${this.ip}/get_afd.fcgi`, {
                session: this.session
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            console.log("Dados AFD obtidos com sucesso.");
            // Retorna o buffer de dados
            return response.data;
        } catch (error) {
            console.error("Erro ao obter AFD:", error.message);
            throw error;
        }
    }
}

// Rota para fazer login e obter AFD
router.post('/relogio/afd', async (req, res) => {
    try {
        const { ip, login, password } = req.body;
        const device = new Device(ip);
        await device.login(login, password);
        const afdData = await device.getAfd();
        
        // Configura o tipo de conteúdo como 'application/octet-stream' para enviar o buffer
        res.set('Content-Type', 'application/octet-stream');
        res.send(afdData);
    } catch (error) {
        console.error("Erro na requisição:", error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;