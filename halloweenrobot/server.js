const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');

const server = https.createServer({
//    cert: fs.readFileSync('/etc/nginx/certificates/certificate.crt'),
//    key: fs.readFileSync('/etc/nginx/certificates/private.key',
   cert: fs.readFileSync('/etc/letsencrypt/live/kumail.org/fullchain.pem'),
   key: fs.readFileSync('/etc/letsencrypt/live/kumail.org/privkey.pem'),
});

const wss = new WebSocket.Server({ server })

id_to_socket = {}
pending_handshake = {};

wss.on("connection", client => {
  console.log("connected client");
  client.on("message", payload => {
    dec = JSON.parse(payload);
    evt = dec.event;
    data = dec.data;
    if (evt == "identify") {
      console.log("identify " + data);
      id_to_socket[data] = client;
      //console.log(id_to_socket);
      if (data in pending_handshake) {
        pending_handshake[data].forEach(payload => {
          console.log('sending pending handshake');
          id_to_socket[data].send(payload);
        })
      }
    } else {
      console.log("handshake message");
      let to = dec.to;
      let from = dec.from;
      payload = JSON.stringify({
        event: evt,
        data: data,
        from: from
      })
      if (to in id_to_socket) {
        console.log('sending to: ', to);
        id_to_socket[to].send(payload);
      } else {
        console.log('couldnt find ', to, 'putting in pending handshake');
        if (to in pending_handshake) {
          pending_handshake[to].push(payload);
        } else {
          pending_handshake[to] = [payload];
        }
      }
    }
  })
})

server.listen(9008);
