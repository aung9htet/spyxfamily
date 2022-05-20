var canvas = document.getElementById('my_canvas');
var img = document.getElementById('my_image');
var context = canvas.getContext('2d');
var imageObj = new Image();


// To set the resolution use the canvas width and height properties
canvas.width = 1120;
canvas.height = 650;
// To set the display size use the style width and height

var prop = img.height/img.width;
var width = canvas.width;
var height = width*prop;

imageObj.onload = function() {
    context.drawImage(imageObj, 0, 0, width, height);
};
imageObj.src = '/images/cathedral.jpg';

// Painting
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");
const saveBtn = document.getElementById("jsSave");

context.lineWidth = 2.5; /* 라인 굵기 */

let painting = false;
let filling = false;

function stopPainting() {
    painting = false;
}

function startPainting() {
    painting = true;
}

function onMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    if (!painting) {
        context.beginPath();
        context.moveTo(x, y);
    } else{
        context.lineTo(x, y);
        context.stroke();
    }
}

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    context.strokeStyle = color;
    context.fillStyle = color;
}

function handleRangeChange(event) {
    const size = event.target.value;
    context.lineWidth = size;
}

function handleCanvasClick() {
    if (filling) {
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
}
//To prevent right click
/*
function handleCM(event) {
   event.preventDefault();
 }
 */
if (canvas) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
    canvas.addEventListener("click", handleCanvasClick);
    // canvas.addEventListener("contextmenu", handleCM);

}

Array.from(colors).forEach(color =>
    color.addEventListener("click", handleColorClick));


if (range) {
    range.addEventListener("input", handleRangeChange);
}
