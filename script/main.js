'use strict';

// ---- VARIABLES & INIT

// DOM
const addColorBtn    = document.getElementById('addColorBtn');
const canvas         = document.querySelector('canvas');
const downloadBtn    = document.getElementById('downloadBtn');
const closeModalBtn  = document.getElementById('closeModalBtn');
const modal          = document.getElementById('modal');
const openModalBtn   = document.getElementById('openModalBtn');
const palette        = document.querySelector('.palette-container')
const penColorInput  = document.getElementById('pen-color');
const redoBtn        = document.getElementById('redo');
const resetBtn       = document.getElementById('resetBtn');
const shapes         = document.getElementsByName('shapes')
const tools          = document.getElementsByName('tools');
const undoBtn        = document.getElementById('undo');
const widthInput     = document.getElementById('widthInput');
const widthValue     = document.getElementById('widthValue');

// INIT CANVAS
const ctx           = canvas.getContext('2d');
let canvasHeight    = getComputedStyle(canvas).height;
let canvasWidth     = getComputedStyle(canvas).width;
let currentTool     = 'pen';
let currentShape    = 'line'
let eraserColor     = "#FFF" // couleur de la gomme blanche par défaut
let isDrawing       = false;
let lineWidth       = 5;
let paletteEmpty    = true;
let penColor        = "#000"; // Couleur du trait noire par défaut
let posX;
let posY;
let redoTab         = []; // Tableau pour redo
let undoTab         = []; // Tableau pour undo

canvas.setAttribute('width', canvasWidth); 
canvas.setAttribute('height', canvasHeight);
ctx.fillStyle       = '#FFF'; 
ctx.lineCap         = "round";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// INIT COLOR PICKER
jscolor.presets.default = {
	format:'hex'
};



// ----- FONCTIONS 

function start(e){

    isDrawing = true;
    redoTab = [];
    posX = e.clientX - canvas.offsetLeft;
    posY = e.clientY - canvas.offsetTop;

    ctx.beginPath();
    ctx.strokeStyle = (currentTool == 'eraser') ? eraserColor : penColor; 
    ctx.fillStyle = (currentTool == 'eraser') ? eraserColor : penColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(posX, posY);

    if (currentShape == 'square'){
        ctx.fillRect(posX - lineWidth/2, posY-lineWidth/2, lineWidth, lineWidth);
        ctx.stroke();
    }
    if (currentShape == 'circle')
    {
        ctx.arc(posX, posY, lineWidth/2, 0, 2* Math.PI, false);
        ctx.stroke();
    }
    if (currentShape == 'triangle')
    {
        ctx.moveTo(posX, posY-lineWidth/2);
        ctx.lineTo(posX + lineWidth/2, posY + lineWidth/2)
        ctx.lineTo(posX - lineWidth/2, posY+lineWidth/2);
        ctx.closePath();
        ctx.stroke();
    }
}

function draw(e){
    posX = e.clientX - canvas.offsetLeft;
    posY = e.clientY - canvas.offsetTop;

    if(isDrawing){
        if (currentShape == 'line')
        {
        ctx.lineTo(posX, posY);
        ctx.stroke();
        }
        else if (currentShape == 'square')
        {
            ctx.fillRect(posX - lineWidth/2, posY-lineWidth/2, lineWidth, lineWidth);
            ctx.stroke();
        }
        else if (currentShape == 'circle')
        {
            ctx.arc(posX, posY, lineWidth/2, 0, 2* Math.PI, false);
            ctx.stroke();
        }
        else if (currentShape == 'triangle')
        {
            ctx.moveTo(posX, posY-lineWidth/2);
            ctx.lineTo(posX + lineWidth/2, posY + lineWidth/2)
            ctx.lineTo(posX - lineWidth/2, posY+lineWidth/2);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function stop(){
    if (isDrawing){
        isDrawing = false;
        undoTab.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    }
}

function resizeCanvas(){
    let currentDrawing = ctx.getImageData(0,0,canvas.width,canvas.height);
    canvas.setAttribute('width', getComputedStyle(canvas).width); 
    canvas.setAttribute('height', getComputedStyle(canvas).height);
    ctx.fillStyle = '#FFF';
    ctx.lineCap         = "round";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.putImageData(currentDrawing, 0,0);

    // Gestion conflits affichage responsive
    if (window.innerWidth >= 685){
        modal.style.display = 'block';
    }
    else
    {
        modal.style.display = 'none';
    }
}

function setPenColor(e){
    penColor = e.target.value;
}

function setWidth(e){
    lineWidth = e.target.value;
    widthValue.textContent = lineWidth;
}

function setTool(e){
    currentTool = e.target.value;
}

function setShape(e){
    currentShape = e.target.value;
}

function reset(){
    if (window.confirm('Voulez-vous vraiment effacer ?')){
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        redoTab = [];
        undoTab = [];
    }
}

function undo(){
    redoTab.push(undoTab[undoTab.length - 1]);
    undoTab.pop();

    if (undoTab.length > 0) {
        ctx.putImageData(undoTab[undoTab.length - 1], 0,0);
    }  
    else {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0,0,canvas.width, canvas.height)
    }
}

function redo() {
    if (redoTab.length > 0 ){
        ctx.putImageData(redoTab[redoTab.length - 1], 0,0);
        undoTab.push(redoTab[redoTab.length -1])
        redoTab.pop();
    }
}

function download(){
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = canvas.toDataURL();
    a.download = 'dessin.png';
    a.click();
    document.body.removeChild(a);
}

function addColorToPalette(){
    if (paletteEmpty){
        palette.nextElementSibling.innerHTML = '<p>Ctrl + click to delete</p>';
    }

    let newColor = penColorInput.value;
    palette.innerHTML += 
    `<div class='palette-element' style='background-color: ${newColor}'></div>`;
    paletteEmpty = false;

    for(let div of palette.children){
        div.addEventListener('click', function(e){
            penColor = div.style.backgroundColor;
            if (e.ctrlKey){
                palette.removeChild(e.currentTarget);
                if (palette.children.length <= 0){
                    palette.nextElementSibling.innerHTML = '<p>Palette vide</p>';
                    paletteEmpty = true;
                }
            }
        })
    }   
}

// ----- EVENEMENTS

//Canvas interactions
canvas.addEventListener('mousedown', start);
canvas.addEventListener('touchstart', start)
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('touchend', stop);


// Canvas resizing
window.addEventListener('resize', resizeCanvas);

//Tools 
for (let tool of tools){
    tool.addEventListener('click', setTool);
}

//Shapes
for (let shape of shapes){
    shape.addEventListener('click', setShape)
}

//Settings
penColorInput.addEventListener('change', setPenColor);
widthInput.addEventListener('input', setWidth)

//Undo / Redo
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

//Erase all 
resetBtn.addEventListener('click', reset);

//Download
downloadBtn.addEventListener('click', download);

//Color palette
addColorBtn.addEventListener('click', addColorToPalette);

//Modal (responsive)
openModalBtn.addEventListener('click', function(){
    modal.style.display = 'block';
})
closeModalBtn.addEventListener('click', function(){
    modal.style.display = 'none';
})
