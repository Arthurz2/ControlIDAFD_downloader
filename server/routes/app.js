const express = require('express');
const path = require('path');
const router = express.Router();
const { checkStatus } = require('./pingService.js');
// Exemplo de rota
router.get('/relogio', (req, res) => {
    res.json({ time: new Date().toLocaleTimeString() });
});

router.get('/Dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/index.html'));
});

router.get('/afdDownload', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/public/afdDownload.html'));
});
router.get('/cadastroUsuario', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/public/cadUser.html'));
});

router.get('/cadLoja', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/public/cadLoja.html'));
});

router.get('/configRelogio', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/public/configRelogio.html'));
});

router.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/public/sobre.html'));
});


router.get('/status', async (req, res) => {
    try {
        const statuses = await checkStatus();
        res.json(statuses);
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({ error: 'Erro ao verificar status' });
    }
});

module.exports = router;