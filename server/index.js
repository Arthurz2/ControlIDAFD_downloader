const express = require('express');
const app = express();
const path = require('path');
const port = 3030;

// Middleware para parsear JSON
app.use(express.json());
const routes = require('./routes/app');


// Importar as routes

const downloadAfdPorLoja = require('./routes/downloadAfd/downloadAfdPorLoja');
const downloadAllAfdPorLoja = require('./routes/downloadAfd/downloadAllAfdLojas');
const loadUserCad = require('./routes/usersCad/loadUserLoja')

// Configura o servidor para servir arquivos estáticos da pasta 'scripts' dentro de 'server'
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.use(express.static(path.join(__dirname, 'public')));
// Configura o servidor para servir arquivos estáticos da pasta 'src'
app.use(express.static(path.join(__dirname, '../src')));

app.use('/', routes);
app.use('/api', downloadAfdPorLoja);
app.use('/api', downloadAllAfdPorLoja)
app.use('/api', loadUserCad)
// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});