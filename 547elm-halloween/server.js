const Websocket = require('ws');
const https = require('https');
const fs = require('fs');

const server = https.createServer({
  cert: fs.readFileSync('/home/phillip/certificate.crt'),
  key: fs.readFileSync('/home/phillip/private.key')
});

function uuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substrin
}

const wss = new Websocket.Server({ server });
wss.binaryType = 'arraybuffer';

var clients = {};

wss.on("connection", client => {
  client.uuid = uuid();
  clients[client.uuid] = client;
  client.on("message", buf => {
    Object.keys(clients).forEach(to => {
      clients[to].send(buf);
    });
  });
  client.on("close", e => {
    delete clients[client.uuid];
  });
});

server.listen(9002);
