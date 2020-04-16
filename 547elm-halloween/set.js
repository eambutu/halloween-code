var ws;
function initWebsocket() {
  ws = new WebSocket("wss://kumail.org:9002");
  ws.binaryType = 'arraybuffer';
  ws.onopen = function(e) {
    console.log("open");
  }
  ws.onclose = function(e) {
    console.log("close");
    setTimeout(initWebsocket, 1000);
  }
}

initWebsocket();

var spooky = false;
$("#spooktoggle").click(() => {
  var pos = new Float32Array([0, 0]);
  ws.send(pos.buffer);
});

$("#set").bind("touchmove", (e) => {
  e.preventDefault();
  var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
  try {
    x = (touch.pageX - e.target.offsetLeft)/e.target.offsetWidth;
    y = (touch.pageY - e.target.offsetTop)/e.target.offsetHeight;
    var pos = new Float32Array([x, y]);
    ws.send(pos.buffer);
  } catch (err) {
    console.log(err);
  }
});

/*
$("#set").on("mousemove", (e) => {
  try {
    var x = (e.pageX - e.target.offsetLeft)/e.target.offsetWidth;
    var y = (e.pageY - e.target.offsetTop)/e.target.offsetHeight;
    var pos = new Float32Array([x, y]);
    ws.send(pos.buffer);
  } catch (err) {
    console.log(err);
  }
});
*/
