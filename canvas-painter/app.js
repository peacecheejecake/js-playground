const canvas = document.querySelector("canvas.canvas");
const lineWidthControl = document.querySelector("input.range");
const colorControls = [...document.querySelectorAll(".color")];
const btnMode = document.querySelector(".btnMode");
const btnSave = document.querySelector(".btnSave");

const ctx = canvas.getContext("2d");

//init
const LINE_WIDTH_DEFAULT = 1;
const COLOR_DEFAULT = colorControls[0].style.backgroundColor;
const DEFAULT_BACKGROUND_COLOR = COLOR_DEFAULT;
const currentColorBorderStyle = "5px solid #9c9c9c";

let painting = false;
let currentColorControl = colorControls[0];

lineWidthControl.value = LINE_WIDTH_DEFAULT;
currentColorControl.style.border = currentColorBorderStyle;

// pixel manipulating size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// initial setup
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height); // initially white canvas

ctx.lineWidth = `${LINE_WIDTH_DEFAULT}px`;
ctx.strokeStyle = COLOR_DEFAULT;
ctx.fillStyle = COLOR_DEFAULT;

// event handlers
function stopPainting() {
  painting = false;
}

function startPainting(event) {
  const x = event.offsetX;
  const y = event.offsetY;

  ctx.beginPath();
  ctx.moveTo(x, y);

  painting = true;
}

function draw(event) {
  if (painting) {
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function fill(event) {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function changeLineWidth(event) {
  ctx.lineWidth = event.target.value;
}

function changeColor(event) {
  currentColorControl.style.border = "none";
  currentColorControl = event.target;
  currentColorControl.style.border = currentColorBorderStyle;

  const color = currentColorControl.style.backgroundColor;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
}

function save() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `image-${new Date().toLocaleString()}.png`;
  link.click();
}

function preventRightClick(event) {
  event.preventDefault();
}

canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mouseleave", stopPainting);
canvas.addEventListener("click", preventRightClick);

lineWidthControl.addEventListener("input", changeLineWidth);
colorControls.forEach((color) => {
  color.addEventListener("click", changeColor);
});

btnMode.addEventListener("click", fill);
btnSave.addEventListener("click", save);
