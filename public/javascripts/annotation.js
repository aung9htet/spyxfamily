function setBackground(image) {
    var canvas = document.getElementById('my_canvas');
    console.log(canvas);
    var context = canvas.getContext('2d');
    console.log(context);
    canvas.width = 850;
    canvas.height = 600;
    var imageObj = new Image();

    imageObj.onload = function() {
        // To set the display size use the style width and height
        var width = imageObj.naturalWidth;
        var height = imageObj.naturalHeight;
        var prop = imageObj.naturalWidth/imageObj.naturalHeight;

        if (height >  width){
            var new_height = canvas.height;
            var new_width = new_height*prop;
        }
        else {
            var new_width = canvas.width;
            var new_height = new_width/prop;
        }

        console.log(imageObj.src);
        context.drawImage(imageObj, (canvas.width-new_width)/2, (canvas.height-new_height)/2, new_width, new_height);
    }
    imageObj.src = image;
}

var canvas = document.getElementById('my_canvas');
var context = canvas.getContext('2d');


// To set the resolution use the canvas width and height properties
canvas.width = 850;
canvas.height = 600;

// Painting
const colors = document.getElementsByClassName("colorPalette");
const range = document.getElementById("lineWidth");
const currentColor = document.getElementById("currentColor");
const knowledgeGraph = document.getElementById("switchMode");

context.lineWidth = 2.5; /* 라인 굵기 */

let painting = false;

var x1;
var y1;
var x2;
var y2;

function stopPainting() {
    painting = false;
    if(knowledgeGraph.innerText === "Switch to Draw Mode") {
        rectDraw()
    }
}

function startPainting(e) {
    painting = true;
    if(knowledgeGraph.innerText === "Switch to Draw Mode") {
        x1 = e.offsetX;
        y1 = e.offsetY;
    }
}

function onMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    if (knowledgeGraph.innerText === "Switch to Knowledge Graph Mode") {
        if (!painting) {
            context.beginPath();
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
            context.stroke();
        }
    } else{
        if (!painting) {
        } else {
            x2 = event.offsetX;
            y2 = event.offsetY;
        }
    }
}

function rectDraw() {
    context.strokeRect(x1, y1, (x2 - x1), (y2 - y1));
}

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    context.strokeStyle = color;
    context.fillStyle = color;
    document.getElementById('currentColor').style.backgroundColor= color;
}

function handleRangeChange(event) {
    const size = event.target.value;
    context.lineWidth = size;
}

function handleModeClick() {
    if (knowledgeGraph.innerText === "Switch to Knowledge Graph Mode") {
        knowledgeGraph.innerText = "Switch to Draw Mode";
        document.getElementById('typeForm').style.display = 'block';
    } else {
        knowledgeGraph.innerText = "Switch to Knowledge Graph Mode";
        document.getElementById('typeForm').style.display = 'none';
        document.getElementById('widget').style.display = 'none';
    }
}

//To prevent right click

function handleCM(event) {
    event.preventDefault();
}

if (canvas) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
    canvas.addEventListener("contextmenu", handleCM);
}

Array.from(colors).forEach(color =>
    color.addEventListener("click", handleColorClick));


if(range) {
    range.addEventListener("input", handleRangeChange);
}

// Annotation mode

if(knowledgeGraph){
    knowledgeGraph.addEventListener("click", handleModeClick);
}

/// Knowledge Graph ------------------------------------------------


const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML= 'of type: '+type;
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row= event.row;
    const color = document.getElementById('currentColor').style.backgroundColor
    // document.getElementById('resultImage').src= row.json.image.url;
    document.getElementById('resultId').innerText= 'id: '+row.id;
    document.getElementById('resultName').innerText= row.name;
    document.getElementById('resultDescription').innerText= row.rc;
    document.getElementById("resultUrl").href= row.qc;
    document.getElementById('resultPanel').style.display= 'block';
    document.getElementById('resultPanel').style.border= '5px solid ' +color;
}

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type){
    const  params = {
        'query': mainEntityName,
        'types': type,
        'limit': 10,
        'indent': true,
        'key' : apiKey,
    };
    $.getJSON(service_url + '?callback=?', params, function(response) {
        $.each(response.itemListElement, function (i, element) {

            $('<div>', {text: element['result']['name']}).appendTo(document.body);
        });
    });
}