const endpoint = "wss://kumail.org:9008"

let p;

function initializeVideoStreams() {
  console.log('initializeVideoStreams');
  console.log(window.location.hash);
  const videoSettings = {
  }

  let mediaSettings;
  // tablet's side
  if (window.location.hash === '') {
    console.log('getting usermedia x');
    //initialize(null);
    mediaSettings = { video: true, audio: true };
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.mediaDevices.getUserMedia(mediaSettings)
      .then(stream => {
        console.log("got stream", stream);
        initialize(stream);
      })
      .catch(err => console.log('media devices err', err));
  } else if (window.location.hash === "#1") {
    initialize(null);
  } else if (window.location.hash === "#2") {
    mediaSettings = { audio: true };
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.mediaDevices.getUserMedia(mediaSettings)
      .then(stream => initialize(stream))
      .catch(err => console.log('media devices err', err));
  } else if (window.location.hash === "#3") {
    mediaSettings = { audio: true, video: true};
    navigator.mediaDevices.getUserMedia(mediaSettings)
      .then(stream => initialize(stream))
      .catch(err => console.log('media devices err', err));
  }
  
  function initialize (stream) {
    console.log('in initialize ', endpoint);
    const ws = new WebSocket(endpoint);
    ws.isConnected = false;
    console.log('initialize hash', window.location.hash);

    let pendingSends = [];
    ws.addEventListener("open", () => {
      console.log("normal open");
      ws.isConnected = true;
      ws.send(JSON.stringify({
        "event": "identify",
        "data": window.location.hash
      }));

      pendingSends.forEach(send => {
        ws.send(send);
      })
      pendingSends = [];
    })

    if (window.location.hash === '') {
      let peers = [];

      for (var idx = 0; idx < 3; idx++) {
        let tempIdx = idx;
        peers[idx] = new SimplePeer({
          initiator: true,
          trickle: false,
          reconnectTimer: 100,
          iceTransportPolicy: 'relay',
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
          stream: (stream !== null ? stream : null)
        })

        peers[idx].on('signal', data => {
          console.log("signal");
          //console.log('SIGNAL', JSON.stringify(data))
          if (ws.isConnected) {
            ws.send(JSON.stringify({
              "event": "handshake",
              "to": '#' + (tempIdx + 1),
              "data": JSON.stringify(data)
            }));
          } else {
            pendingSends.push(JSON.stringify({
              "event": "handshake",
              "to": '#' + (tempIdx + 1),
              "data": JSON.stringify(data)
            }));
          }
        })

        peers[idx].on('data', data => {
          console.log('data: ' + data)
          changeExpression(String.fromCharCode.apply(null, data));
        })

        peers[idx].on('error', err => console.log('error', err));

        peers[idx].on('connect', () => console.log('connect'));

        if (idx === 1 || idx === 2) {
          peers[idx].on('stream', stream => {
            console.log('got stream');
            // got remote video stream, now let's show it in a video tag
            var video = document.querySelector('video')

            if (video !== null) {
              if ('srcObject' in video) {
                video.srcObject = stream
              } else {
                video.src = window.URL.createObjectURL(stream) // for older browsers
              }
              video.onloadedmetadata = (e) => {
                  video.play();
              }

              var audioCtx = new AudioContext();
              var source = audioCtx.createMediaStreamSource(stream);

              let jungle1 = new Jungle(audioCtx);
              let compressor1 = audioCtx.createDynamicsCompressor();
              source.connect(jungle1.input);
              jungle1.output.connect(compressor1);
              jungle1.setPitchOffset(0.12);

              let jungle2 = new Jungle(audioCtx);
              let compressor2 = audioCtx.createDynamicsCompressor();
              compressor1.connect(jungle2.input);
              jungle2.output.connect(compressor2);
              jungle2.setPitchOffset(-0.25);

              let jungle3 = new Jungle(audioCtx);
              let compressor3 = audioCtx.createDynamicsCompressor();
              compressor2.connect(jungle3.input);
              jungle3.output.connect(compressor3);
              jungle3.setPitchOffset(0.38);
              compressor3.connect(audioCtx.destination);

              /*
              let tuna = new Tuna(audioCtx);
              let effect = new tuna.Phaser({
                rate: 8,
                depth: 0.16,
                feedback: 0.5,
                stereoPhase: 100,
                baseModulationFrequency: 500,
                bypass: 0
              });
              compressor.connect(effect);
              effect.connect(audioCtx.destination);
              */
            }
          })   
        }
      }

      ws.addEventListener("message", json => {
        console.log("message");
        console.log(json.data);
        let data = JSON.parse(json.data);
        console.log(data);
        if (data.event === "handshake") {
          if (data.from === "#1") {
            peers[0].signal(JSON.parse(data.data));
          } else {
            peers[1].signal(JSON.parse(data.data));
          }
        }
      });
    } else {
      p = new SimplePeer({
        initiator: false,
        trickle: false,
        reconnectTimer: 100,
        iceTransportPolicy: 'relay',
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
        stream: (stream ? stream : null)
      })

      ws.addEventListener("message", json => {
        console.log("message");
        console.log(json.data);
        let data = JSON.parse(json.data);
        console.log(data);
        if (data.event === "handshake") {
           p.signal(JSON.parse(data.data));
        }
      });

      p.on('error', err => console.log('error', err))

      p.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data));
        if (ws.isConnected) {
          ws.send(JSON.stringify({
            "event": "handshake",
            "from": window.location.hash,
            "to": '',
            "data": JSON.stringify(data)
          }));
        } else {
          pendingSends.push(JSON.stringify({
            "event": "handshake",
            "from": window.location.hash,
            "to": '',
            "data": JSON.stringify(data)
          }));
        }
      })

      p.on('connect', () => {
        console.log('CONNECT')
      })

      p.on('data', data => {
        console.log('data: ' + data)
      })

      p.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
        //
        stream.getTracks().forEach(track => {
            track.addEventListener('mute', () => console.log('mute'))
        })
        console.log('got stream');
        var video = document.querySelector('video')

        if (video !== null) {
          if ('srcObject' in video) {
            video.srcObject = stream
          } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
          }
          video.onloadedmetadata = (e) => {
              video.play();
          }
        }
      })
    }
  }
}

function sendExpression(type) {
  console.log('in expression with type ', type);
  p.send(type);
}

window.send = sendExpression;

if (window.location.hash === '') {
  console.log('here');
  initializeVideoStreams();
}

var eyeControlWs;
function initEyeControlWebsocket() {
  eyeControlWs = new WebSocket("wss://kumail.org:9002");
  eyeControlWs.binaryType = 'arraybuffer';
  eyeControlWs.onopen = function(e) {
    console.log("eyecontrol open");
  }
  eyeControlWs.onclose = function(e) {
    console.log("close");
    setTimeout(initWebsocket, 1000);
  }
}
initEyeControlWebsocket();
window.sendEyeSpookToggle = function () {
  var pos = new Float32Array([0, 0]);
  eyeControlWs.send(pos.buffer);
}
/* x, y are floats in (0, 1) */
window.sendEyePosition = function (x, y) {
  try {
    var pos = new Float32Array([x, y]);
    eyeControlWs.send(pos.buffer);
  } catch (err) {
    console.log(err);
  }
}

/*
var old = console.log;
var logger = document.getElementById('log');
console.log = function (message) {
    if (typeof message == 'object') {
        logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
    } else {
        logger.innerHTML += message + '<br />';
    }
}
*/
