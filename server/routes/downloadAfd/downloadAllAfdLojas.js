const express = require('express');
const axios = require('axios');
const https = require('https');
const iconv = require('iconv-lite'); // Para decodificar caracteres especiais
const archiver = require('archiver'); // Para criar o arquivo ZIP
const router = express.Router();
const { lojasDownload } = require('../lojaDownloadCad');

// Função que retorna o agente HTTPS para ignorar certificados
const getHttpsAgent = () => {
    return new https.Agent({
        rejectUnauthorized: false
    });
};

// Função para baixar o AFD de uma loja específica e retornar o conteúdo
const downloadAfdFromLoja = async (lojaData, lojaId) => {
    const { ip, login, senha } = lojaData;
    const axiosInstance = axios.create({
        httpsAgent: getHttpsAgent(),
        insecureHTTPParser: true
    });

    try {
        // Faz login e obtém o arquivo AFD
        const loginResponse = await axiosInstance.post(`https://${ip}/login.fcgi`, { login, password: senha }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // Define um timeout de 10 segundos para a conexão
        });

        const session = loginResponse.data.session;

        const afdResponse = await axiosInstance.post(`https://${ip}/get_afd.fcgi`, { session }, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer', // Para receber o arquivo como binário
            timeout: 10000 // Timeout também para a requisição do AFD
        });

        // Decodifica os dados binários de ISO-8859-1 para UTF-8
        const decodedData = iconv.decode(Buffer.from(afdResponse.data), 'ISO-8859-1');
        return decodedData; // Retorna o conteúdo do AFD
    } catch (error) {
        console.error(`Erro ao baixar AFD da loja ${lojaId}:`, error.message);
        return `Erro ao baixar AFD da loja ${lojaId}: ${error.message}`;
    }
};

// Rota para baixar os AFDs de todas as lojas e compactá-los em um ZIP
router.post('/downloadAllAfd', async (req, res) => {
    try {
        const lojas = Object.keys(lojasDownload);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Define o nível de compressão
        });

        // Define o cabeçalho para o download do arquivo ZIP
        res.setHeader('Content-Disposition', 'attachment; filename=afd_files.zip');
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res); // Conecta o stream de arquivos ao response

        // Baixa os arquivos AFD para cada loja e adiciona ao ZIP
        const promises = lojas.map(async (lojaId) => {
            const lojaData = lojasDownload[lojaId];
            const afdContent = await downloadAfdFromLoja(lojaData, lojaId);
            archive.append(afdContent, { name: `afd_${lojaId}.txt` });
        });

        // Aguarda todas as promessas serem resolvidas
        await Promise.all(promises);

        // Finaliza o arquivo ZIP
        archive.finalize();
    } catch (error) {
        console.error('Erro ao baixar os arquivos:', error.message);
        res.status(500).json({ success: false, message: 'Erro ao baixar os arquivos.' });
    }
});

module.exports = router;
