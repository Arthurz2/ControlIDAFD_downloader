const axios = require('axios');
const https = require('https');
const fs = require('fs');
// Configura o agente HTTPS para ignorar certificados autoassinados
const getHttpsAgent = () => {
    return new https.Agent({
        rejectUnauthorized: false
    });
};


class Device {
    constructor(ip) {
        console.log("Creating device with IP=" + ip);
        this.ip = ip;
        this.session = null;
        this.axiosInstance = null;
    }

    // Faz login
    async login() {
        try {
            console.log("Tentando login para IP: " + this.ip);
            this.axiosInstance = axios.create({
                httpsAgent: getHttpsAgent(),
                insecureHTTPParser: true
            });

            const response = await this.axiosInstance.post(`https://${this.ip}/login.fcgi`, {
                "login" : "admin",
                "password" : "1234"
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.session) {
                this.session = response.data.session;
                console.log("Login bem-sucedido. Sessão: ", this.session);
            } else {
                console.log("Resposta inesperada ao fazer login: ", response.data);
            }
        } catch (error) {
            // Incluindo o `error.response` para obter mais detalhes sobre o erro
            console.error("Erro ao realizar login: ", error.response ? error.response.data : error.message);
        }
    }

    // Faz requisição para get_afd.fcgi
    async getAfd() {
        try {
            console.log("Tentando obter AFD para IP: " + this.ip);
            const response = await this.axiosInstance.post(`https://${this.ip}/get_afd.fcgi`, {
                session: this.session
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            // Salva o arquivo de retorno em um arquivo txt
            const filePath = 'afd.txt';
            fs.writeFileSync(filePath, response.data);
            console.log(`Arquivo salvo em ${filePath}`);
        } catch (error) {
            console.error("Erro ao obter AFD: ", error.response ? error.response.data : error.message);
        }
    }
}


(async () => {
    const device = new Device('192.168.0.0');
    await device.login();
    await device.getAfd();
})();
