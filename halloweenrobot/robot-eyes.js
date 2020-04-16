document.addEventListener("click", () => {
  let elem = document.querySelector(".container-1");
  var requestFullScreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
  try {
    requestFullScreen.call(elem);
  } catch (err) {
    console.log(err);
  }
});

var s = Snap(document.querySelector(".robot-eye:nth-child(1)")[0]);
const EyeOpen = (mask, anim, duration, next) => {
  document.querySelector(".container-2").classList.remove("anger");
  mask.animate({
    d: 'M80,0 h240 a80,80 0 0 1 80,80 v180 a80,80 0 0 1 -80,80 h-240 a80,80 0 0 1 -80,-80 v-180 a80,80 0 0 1 80,-80 z'
  }, duration, anim, next);
}

const EyeClosed = (mask, anim, duration, next) => {
  document.querySelector(".container-2").classList.remove("anger");
  mask.animate({
    d: 'M0,180 h400 a0,0 0 0 1 0,0 v40 a0,0 0 0 1 0,0 h-400 a0,0 0 0 1 0,0 v-40 a0,0 0 0 1 0,0 z'
  }, duration, anim, next);
};

const EyeAngry = (mask, anim, duration, next) => {
  document.querySelector(".container-2").classList.add("anger");
  mask.animate({
    d: 'M0,80 L400,200 v0 v100 v0 h-400 v0 v0 v0'
    //d: 'M80,0 L320,120 a80,80 0 0 1 80,80 v240 a80,80 0 0 1 -80,80 h-240 a80,80 0 0 1 -80,-80 v-240 a80,80 0 0 1 80,-80 z'
  }, duration, anim, next);
}

const EyeHappy = (mask, anim, duration, next) => {
  document.querySelector(".container-2").classList.remove("anger");
  mask.animate({
    d: 'M0,80 A220 100, 0, 0 1, 400 80, v0 v140 v0 A220 100, 0, 0 0, 0 220, v0 v-140 v0 z'
    //d: 'M80,0 L320,120 a80,80 0 0 1 80,80 v240 a80,80 0 0 1 -80,80 h-240 a80,80 0 0 1 -80,-80 v-240 a80,80 0 0 1 80,-80 z'
  }, duration, anim, next);
}


var eye1 = Snap.select("#round-eyes-mask-1");
var eye2 = Snap.select("#round-eyes-mask-2");

function changeExpression(type) {
  console.log(type);
  console.log(type === "open");
  if (type === "open") {
    EyeOpen(eye1, mina.backout, 1000, () => {});
    EyeOpen(eye2, mina.backout, 1000, () => {});
  } else if (type === "close") {
    EyeClosed(eye1, mina.bounce, 700, () => {});
    EyeClosed(eye2, mina.bounce, 700, () => {});
  } else if (type === "blink") {
    let anim = mina.backout;
    EyeClosed(eye1, anim, 200, () => {
      EyeOpen(eye1, anim, 200, () => {});
    });
    EyeClosed(eye2, anim, 200, () => {
      EyeOpen(eye2, anim, 200, () => {});
    });
  } else if (type === "wink") {
    let anim = mina.backout;
    EyeHappy(eye1, anim, 1000, () => {});
    EyeHappy(eye2, anim, 1000, () => {
      EyeClosed(eye2, anim, 300, () => {
        EyeHappy(eye2, anim, 200, () => {});
      });
    }); 
  } else if (type === "angry") {
    let anim = mina.bounce;
    EyeAngry(eye1, anim, 500, () => {});
    EyeAngry(eye2, anim, 500, () => {});
  } else if (type === "happy") {
    let anim = mina.backout;
    EyeHappy(eye1, anim, 500, () => {});
    EyeHappy(eye2, anim, 500, () => {});
  }
}
