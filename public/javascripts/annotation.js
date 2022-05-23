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
    loadDrawing()
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
let saved_color = NaN;

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
    sendDrawingData(x, y, x1, y1, x2, y2, painting, saved_color, context.lineWidth, knowledgeGraph.innerText)
}

function onMouseMoveRedraw(draw_x, draw_y, draw_x1, draw_y1, draw_x2, draw_y2, painting, passed_color, line_width, mode) {
    const x = draw_x;
    const y = draw_y;
    const painting_var = painting;
    const x1_ph = x1
    const y1_ph = x2
    const x2_ph = x2
    const y2_ph = y2
    x1 = draw_x1
    y1 = draw_y1
    x2 = draw_x2
    y2 = draw_y2
    // set for colors
    context.strokeStyle = passed_color;
    context.fillStyle = passed_color;
    // set for line width
    var cur_line = context.lineWidth;
    context.lineWidth = line_width
    if (mode === "Switch to Knowledge Graph Mode") {
        if (!painting_var) {
            context.beginPath();
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
            context.stroke();
        }
    } else{
        if (!painting_var) {
            rectDraw()
        }
    }
    x1 = x1_ph
    y1 = y1_ph
    x2 = x2_ph
    y2 = y2_ph
    context.strokeStyle = saved_color;
    context.fillStyle = saved_color;
    context.lineWidth = cur_line
}
window.onMouseMoveRedraw = onMouseMoveRedraw;

function rectDraw() {
    context.strokeRect(x1, y1, (x2 - x1), (y2 - y1));
}

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    saved_color = color
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
    sendAnnotationData(row.id, row.name, row.rc, row.gc, color)
    showAnnotation(row.id, row.name, row.rc, row.gc, color)
}

/**
 * Display annotation (To be fix to allow multiple displays)
 * @param resultId
 * @param resultName
 * @param resultDescription
 * @param resultUrl
 * @param resultColor
 */

function showAnnotation(resultId, resultName, resultDescription, resultUrl, resultColor){
    console.log(resultId, resultName, resultDescription, resultUrl, resultColor);

    var resPan = document.createElement('div');
    resPan.style.backgroundColor = "white";
    resPan.style.border = '5px solid ' +resultColor;
    resPan.className = 'mt-3 mb-3 card p-2 shadow';

    var resName = document.createElement('h3');
    resName.innerText= resultName;

    var resId = document.createElement('h4');
    resId.innerText= 'id: '+ resultId;

    var resDescript = document.createElement('div');
    resDescript.innerText= resultDescription;

    var resUrlCtn = document.createElement('div');
    var resUrl = document.createElement('a');
    resUrl.href= resultUrl;
    resUrl.innerText = "Link to Webpage";

    resPan.appendChild(resName);
    resPan.appendChild(resId);
    resPan.appendChild(resDescript);
    resUrlCtn.appendChild(resUrl);
    resPan.appendChild(resUrlCtn);

    document.getElementById("resultPanelContainer").prepend(resPan);
}
window.showAnnotation = showAnnotation



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