const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let services = [];

wss.on('connection', ws => {
    console.log('Novo cliente conectado');

    ws.on('message', message => {
        const msg = JSON.parse(message);
        if (msg.action === 'addService') {
            services.push(msg.service);
            broadcastServices();
        } else if (msg.action === 'fetchServices') {
            ws.send(JSON.stringify({ action: 'updateServices', services }));
        } else if (msg.action === 'searchService') {
            const results = services.filter(service =>
                service.servico.toLowerCase().includes(msg.query) ||
                service.nome.toLowerCase().includes(msg.query) ||
                service.descricao.toLowerCase().includes(msg.query)
            );
            ws.send(JSON.stringify({ action: 'searchResults', results }));
        } else if (msg.action === 'clearServices') {
            services = [];
            broadcastServices();
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

function broadcastServices() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: 'updateServices', services }));
        }
    });
}

console.log('Servidor WebSocket está rodando em ws://localhost:8080');
