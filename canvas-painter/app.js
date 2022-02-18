const canvas = document.querySelector("canvas.canvas");
const lineWidthControl = document.querySelector("input.range");
const colorControls = document.querySelectorAll(".color");
const btnMode = document.querySelector(".btnMode");
const btnSave = document.querySelector(".btnSave");

const ctx = canvas.getContext("2d");

//init
const LINE_WIDTH_DEFAULT = 1;
const COLOR_DEFAULT = "#2c2c2c";
const DEFAULT_BACKGROUND_COLOR = "#ffffff";

let painting = false;
let filling = false;
let color = COLOR_DEFAULT;

lineWidthControl.value = LINE_WIDTH_DEFAULT;

// pixel manipulating size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// initial setup
ctx.fillStyle = DEFAULT_BACKGROUND_COLOR;
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.lineWidth = `${LINE_WIDTH_DEFAULT}px`;
ctx.strokeStyle = COLOR_DEFAULT;
ctx.fillStyle = COLOR_DEFAULT;

// event handlers
function stopPainting() {
  painting = false;
}

function startPainting(event) {
  if (filling) {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);

    painting = true;
  }
}

function draw(event) {
  if (painting) {
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function changeLineWidth(event) {
  ctx.lineWidth = event.target.value;
}

function changeColor(event) {
  color = event.target.style.backgroundColor;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
}

function toggleMode(event) {
  if (filling) {
    event.target.innerText = "FILL";
  } else {
    event.target.innerText = "DRAW";
  }
  filling = !filling;
}

function save() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `image-${new Date().toLocaleString()}.png`;
  link.click();
}

canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mouseleave", stopPainting);

lineWidthControl.addEventListener("input", changeLineWidth);
[...colorControls].forEach((color) => {
  color.addEventListener("click", changeColor);
});

btnMode.addEventListener("click", toggleMode);
btnSave.addEventListener("click", save);
