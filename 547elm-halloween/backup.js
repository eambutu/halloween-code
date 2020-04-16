body {
  background-color: black;
}

.robot-eye {
  margin: 50px;
}

.robot-eye:nth-child(2) {
  transform: scaleX(-1);
}

.eye {
  height: 400;
  width: 400;
}

.eye-line {
  height: 9%;
  width: 100%;
  fill: rgba(0, 128, 255, 1);
}

/* blink
.robot-eye:hover .round-eyes rect {
  animation-name: round-eyes-rect;
  animation-duration: 0.05s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}
.robot-eye:hover .round-eyes circle {
  animation-name: round-eyes-circle;
  animation-duration: 0.00s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}
@keyframes round-eyes-rect {
  to {
    x: 0;
    y: 180;
    height: 40;
    width: 400;
  }
}
@keyframes round-eyes-circle {
  to {
    r: 0;
  }
}
*/

/* angry
*/
.container-2:hover .round-eyes rect:nth-child(1) {
  animation-name: round-eyes-angry-rect-1;
  animation-duration: 1s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}
@keyframes round-eyes-angry-rect-1 {
to {
  x: 0;
  y: 0;
  width: 1000;
  height: 200;
  transform: rotate(20deg);
}
}

.container-2:hover .round-eyes rect:nth-child(2) {
  animation-name: round-eyes-angry-rect-2;
  animation-duration: 1s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes round-eyes-angry-rect-2 {
to {
  width: 1000;
  height: 210;
  y: 150;
}
}

.container-2:hover .round-eyes circle {
  animation-name: round-eyes-angry-circle;
  animation-duration: 0s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes round-eyes-angry-circle {
to {
  r: 0;
}
}

.container-2:hover .robot-eye:nth-child(2) {
  animation-name: round-eyes-angry-second-eye;
  animation-duration: 1s;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes round-eyes-angry-second-eye {
to {
  transform: scale(-1.1, 1) translateX(0px);
}
}
