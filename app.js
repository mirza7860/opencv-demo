const video = document.getElementById("video");
const canvas = document.getElementById("calc");
const ctx = canvas.getContext("2d");

let expression = "";
const buttons = [
  ["7", "8", "9", "+"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "*"],
  ["C", "0", "=", "/"]
];

const buttonBoxes = [];

function drawCalculator() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  let x0 = 50, y0 = 100, w = 80, h = 60;
  buttons.forEach((row, i) => {
    row.forEach((label, j) => {
      let x = x0 + j * (w + 10);
      let y = y0 + i * (h + 10);
      ctx.strokeRect(x, y, w, h);
      ctx.fillText(label, x + 30, y + 35);
      buttonBoxes.push({label, x1: x, y1: y, x2: x + w, y2: y + h});
    });
  });
  ctx.fillText("Expression: " + expression, 50, 50);
}

function checkTouch(x, y) {
  for (let box of buttonBoxes) {
    if (x > box.x1 && x < box.x2 && y > box.y1 && y < box.y2) {
      if (box.label === "=") {
        try {
          expression = eval(expression).toString();
        } catch {
          expression = "Error";
        }
      } else if (box.label === "C") {
        expression = "";
      } else {
        expression += box.label;
      }
      break;
    }
  }
}

const hands = new Hands({locateFile: (file) =>
  `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});
hands.onResults(results => {
  drawCalculator();
  if (results.multiHandLandmarks.length > 0) {
    const tip = results.multiHandLandmarks[0][8]; // index fingertip
    const x = tip.x * canvas.width;
    const y = tip.y * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    checkTouch(x, y);
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({image: video});
  },
  width: 640,
  height: 480
});
camera.start();
