const ping = require('ping');

const lojas = {
    loja01: '192.168.0.0',
    loja02: '192.168.0.0',
    loja03: '192.168.0.0',
    loja04: '192.168.0.0',
    loja05: '192.168.0.0',
    loja06: '192.168.0.0',
    loja07: '192.168.0.0',
};

async function checkLoja(id, ip) {
    try {
        const resPing = await ping.promise.probe(ip);
        return {
            id,
            ip,
            status: resPing.alive ? 'ONLINE' : 'OFFLINE',
            time: resPing.time ? `${resPing.time} ms` : 'N/A', // Adiciona a latência em ms
        };
    } catch (error) {
        return { id, ip, status: 'ERROR', time: 'N/A', error: error.message };
    }
}

async function checkStatus() {
    const statusPromises = Object.entries(lojas).map(([id, ip]) => checkLoja(id, ip));
    const results = await Promise.all(statusPromises);

    console.table(results);
    return results;
}

// Função para rodar periodicamente (monitoramento contínuo)
function startMonitoring(interval = 5000) {  
    setInterval(async () => {
        console.log('Checando status das lojas...');
        const statuses = await checkStatus();
    }, interval);
}

module.exports = {
    checkStatus,
    startMonitoring,
};
