var x = 0;
var y = 0;
var spooky = false;
var currentTime = 0;

function setSound(src) {
    let audio = document.getElementById("porch-audio");
    if (audio != null) {
        audio.src = src;
        audio.currentTime = currentTime;
        audio.load();
        audio.play();
        audio.addEventListener('timeupdate', event => {
            currentTime = audio.currentTime;
        }, false);
    }
}

function setSpooky() {
    console.log("setspooky");
    eyeball.eyeColour = {"red": 255, "green": 0, "blue": 0};
    eyeball.irisOuterColour = {"red": 100, "green": 100, "blue": 100, "alpha": 0.0};
    eyeball.irisInternalColour = {"red": 0, "green": 0, "blue": 0};
    eyeball.eyeballGradient1 = {"red": 230, "green": 0, "blue": 0};
    eyeball.eyeballGradient2 = {"red": 200, "green": 0, "blue": 0};
    eyeball.eyeballGradient3 = {"red": 170, "green": 0, "blue": 0};
    eyeball.veinColour = {"red": 255, "green": 255, "blue": 255};
    eyeball.veinWidth = 3;
    eyeball.pupilColour = {"red": 255, "green": 255, "blue": 255};
    eyeball.init();
    eyeball.doDraw(x, y);

    setSound("spookwave.mp3");
}
function setNormal() {
    console.log("setnormal");
    eyeball.eyeColour = {"red": 0, "green": 255, "blue": 0};
    eyeball.irisOuterColour = {"red": 100, "green": 100, "blue": 100, "alpha": 0.0};
    eyeball.irisInternalColour = {"red": 0, "green": 0, "blue": 0};
    eyeball.eyeballGradient1 = {"red": 255, "green": 255, "blue": 255};
    eyeball.eyeballGradient2 = {"red": 255, "green": 238, "blue": 238};
    eyeball.eyeballGradient3 = {"red": 238, "green": 221, "blue": 221};
    eyeball.veinColour = {"red": 255, "green": 180, "blue": 180};
    eyeball.veinWidth = 1;
    eyeball.pupilColour = {"red": 0, "green": 0, "blue": 0};
    eyeball.init();
    eyeball.doDraw(x, y);

    setSound("spooktune.mp3");
}
var eyeball = new Eyeball("eyeball");
setNormal();
eyeball.doDraw(0, 0);


// TODO heartbeat

function initWebsocket() {
  var ws = new WebSocket("wss://kumail.org:9002");
  ws.binaryType = 'arraybuffer';
  ws.onopen = function(e) {
    console.log("open socket");
  }
  ws.onmessage = function(e) {
    let dv = new DataView(e.data);
    let nx = dv.getFloat32(0, true) * window.innerWidth;
    let ny = dv.getFloat32(4, true) * window.innerHeight;
    if (nx === 0 && ny === 0) {
      if (spooky) {
        setNormal();
        spooky = false;
      } else {
        setSpooky();
        spooky = true;
      }
    } else {
      x = nx
      y = ny
    }
    eyeball.doDraw(x, y);
  }
  ws.onclose = function(e) {
    console.log("close");
    setTimeout(initWebsocket, 1000);
  }
}
initWebsocket();

document.addEventListener("click", () => {
  let elem = document.getElementById("main-container");
  var requestFullScreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
  try {
    requestFullScreen.call(elem);
    let homeAudio = document.getElementById("lawn-audio");
    console.log("homeAudio ", homeAudio);
    if (homeAudio !== null) {
        homeAudio.play();
    }
  } catch (err) {
    console.log(err);
  }
});

/*
let streaming = true;
let video = document.getElementById('videoInput');
navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(stream => {
    video.srcObject = stream;
    video.play();
    startProcessing();
  })
  .catch(err => {
  });

function startProcessing() {
  console.log('starting processing');
  let cap = new cv.VideoCapture(video);
  console.log('video capture created');

  // take first frame of the video
  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  console.log('frame created');
  cap.read(frame);
  console.log('read frame');

  // hardcode the initial location of window
  let trackWindow = new cv.Rect(150, 60, 63, 125);

  // set up the ROI for tracking
  let roi = frame.roi(trackWindow);
  let hsvRoi = new cv.Mat();
  cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
  let mask = new cv.Mat();
  let lowScalar = new cv.Scalar(30, 30, 0);
  let highScalar = new cv.Scalar(180, 180, 180);
  let low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
  let high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
  cv.inRange(hsvRoi, low, high, mask);
  let roiHist = new cv.Mat();
  let hsvRoiVec = new cv.MatVector();
  hsvRoiVec.push_back(hsvRoi);
  cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
  cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

  // delete useless mats.
  roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();

  // Setup the termination criteria, either 10 iteration or move by atleast 1 pt
  let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

  let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  let hsvVec = new cv.MatVector();
  hsvVec.push_back(hsv);
  let dst = new cv.Mat();
  let trackBox = null;

  const FPS = 30;
  function processVideo() {
    try {
      if (!streaming) {
        // clean and stop.
        frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
        return;
      }
      let begin = Date.now();

      // start processing.
      cap.read(frame);
      cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
      cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
      cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

      // apply camshift to get the new location
      [trackBox, trackWindow] = cv.CamShift(dst, trackWindow, termCrit);

      // Draw it on image
      let pts = cv.rotatedRectPoints(trackBox);
      cv.line(frame, pts[0], pts[1], [255, 0, 0, 255], 3);
      cv.line(frame, pts[1], pts[2], [255, 0, 0, 255], 3);
      cv.line(frame, pts[2], pts[3], [255, 0, 0, 255], 3);
      cv.line(frame, pts[3], pts[0], [255, 0, 0, 255], 3);
      cv.imshow('canvasOutput', frame);

      // schedule the next one.
      let delay = 1000/FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    } catch (err) {
      utils.printError(err);
    }
  };

  // schedule the first one.
  setTimeout(processVideo, 0);
}
*/
