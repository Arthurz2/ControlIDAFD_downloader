const express = require('express');
const axios = require('axios');
const https = require('https');
const iconv = require('iconv-lite'); // Adicione o pacote iconv-lite para conversão de codificação
const router = express.Router(); // Usar router para criar rotas

// Função que retorna o agente HTTPS para ignorar certificados
const getHttpsAgent = () => {
    return new https.Agent({
        rejectUnauthorized: false
    });
};

router.post('/downloadAfd', async (req, res) => {
    const { ip, login, senha } = req.body;

    if (!ip || !login || !senha) {
        return res.status(400).json({ success: false, message: 'Dados da loja estão incompletos.' });
    }

    try {
        const axiosInstance = axios.create({
            httpsAgent: getHttpsAgent(),
            insecureHTTPParser: true
        });

        // Faz o login no relógio de ponto
        const loginResponse = await axiosInstance.post(`https://${ip}/login.fcgi`, {
            "login": login,
            "password": senha
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const session = loginResponse.data.session;

        // Faz a requisição para obter o arquivo AFD
        const afdResponse = await axiosInstance.post(`https://${ip}/get_afd.fcgi`, {
            session
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer' // Para receber o arquivo como binário
        });

        // Decodifica os dados binários do AFD de ISO-8859-1 para UTF-8
        const decodedData = iconv.decode(Buffer.from(afdResponse.data), 'ISO-8859-1');

        // Cria um objeto com os dados a serem retornados
        const responseData = {
            success: true,
            message: 'Dados do AFD obtidos com sucesso!',
            content: decodedData, // Conteúdo decodificado para UTF-8
            filename: `afd_${ip}.txt` // Nome do arquivo AFD
        };

        // Retorna os dados como texto (com codificação UTF-8)
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.set('Content-Disposition', `attachment; filename="${responseData.filename}"`);
        res.send(responseData.content); // Envia o conteúdo decodificado
    } catch (error) {
        console.error("Erro ao obter o AFD: ", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Erro ao realizar a requisição.' });
    }
});

module.exports = router;
