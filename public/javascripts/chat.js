let name = null;
let roomNo = null;
let chat= io.connect('/chat');
let online_status = true;

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    // initialise the database
    if ('indexedDB' in window) {
        initDatabase()
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    //initialise chat socket
    initChatSocket()
}

/**
 * initialises the socket and indexdb for chat, draw, annotations
 */
function initChatSocket(){
    // chat socket
    chat.on('joined', function(room, userId) {
        if (userId === name) {
            hideLoginInterface(room, userId)
            console.log('loading data')
            loadData(room, false)
        } else {
            writeOnChatHistory('<b>' + userId + '</b> ' + 'joined room ' + room);
        }
    });
    chat.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me'
        writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
    })
    chat.on('draw', function(room, userId, x, y, x_1, y_1, x_2, y_2, painting, color, line, mode){
        // make sure the user does not repeat drawing itself
        if (userId !== name) {
            onMouseMoveRedraw(x, y, x_1, y_1, x_2, y_2, painting, color, line, mode)
        }
    })
    chat.on('send', function(room, userId, resultId, resultName, resultDescription, resultUrl, resultColor){
        // make sure the user does not repeat drawing itself
        if (userId !== name) {
            showAnnotation(resultId, resultName, resultDescription, resultUrl, resultColor)
        }
    })
}

/**
 *
 * @param chatDetails details contained in the chat
 * will write the chat messages locally for the user
 */
function writeLoadedData(chatDetails){
    const msg = chatDetails.msg;
    let loadName = chatDetails.name;
    if (loadName === name) (loadName = "Me")
    writeOnChatHistory('<b>' + loadName + ':</b> ' +  msg);
}

/**
 * to rewrite for loaded data
 */
async function loadData(roomNo, forceReload) {
    // get chat data by name and currently set room id
    let chatData = await getChatData(roomNo)
    let imageData = await getImageData(roomNo)
    let annotationData = await getAnnotationData(roomNo)
    if (imageData) {
        setBackground(imageData.img);
    }
    if (!forceReload && chatData && chatData.length > 0) {
        for (let chat of chatData)
            writeLoadedData(chat)
    }
    if (!forceReload && annotationData && annotationData.length > 0) {
        for (let annotation of annotationData) {
            showAnnotation(annotation.resultId, annotation.resultName, annotation.resultDescription, annotation.resultUrl, annotation.resultColor);
        }
    }
}

async function loadDrawing(){
    let drawData = await getDrawData(roomNo)
    if (drawData && drawData.length > 0) {
        for (let draw of drawData)
            onMouseMoveRedraw(draw.draw_x, draw.draw_y, draw.draw_x1, draw.draw_y1, draw.draw_x2, draw.draw_y2, draw.painting, draw.color, draw.line, draw.mode)
    }
}
window.loadDrawing = loadDrawing;

function readImage(input) {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    let imgSrc = '';
    if (input.value !== '') {
        imgSrc = window.URL.createObjectURL(input.files[0]);
    }

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
    }
    img.src = imgSrc;
    console.log(imgSrc);
}

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
    online_status = false;
    document.getElementById('input').style.display = 'none';
}, false);

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('online', function(e) {
    // Queue up events for server.
    console.log("You are online");
    alert("You are online");
    hideOfflineWarning();
    online_status = true;
    syncDatabase()
        .then(response => console.log("Data inserted"))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
    document.getElementById('input').style.display = 'block';
}, false);

function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
        alert("You are offline");

}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

/**
 * called to generate a random room number with 10 alphanumeric letters
 */
function generateRoom() {
    roomNo = (Math.random() * 1000000000000000000).toString(36).substring(0,10);
    document.getElementById('roomNo').value = roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    chat.emit('chat', roomNo, name, chatText);
    // store data being emitted
    storeChatData(roomNo, {roomId: roomNo, name: name, msg: chatText})
        .then(response => console.log('inserting data worked!!'))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
}

/**
 * Store and emit drawing data
 * @param x
 * @param y
 * @param x_1
 * @param y_1
 * @param x_2
 * @param y_2
 * @param painting
 * @param color
 * @param line
 * @param mode
 */
function sendDrawingData(x, y, x_1, y_1, x_2, y_2, painting, color, line, mode){
    // store data being drawn then emit
    storeDrawData(roomNo, {roomId: roomNo, name: name, draw_x: x, draw_y: y, draw_x1: x_1, draw_y1: y_1, draw_x2: x_2, draw_y2: y_2, painting: painting, color: color, line: line, mode: mode})
        .then(response => console.log('inserting drawing data worked!!'))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
    chat.emit('draw', roomNo, name, x, y, x_1, y_1, x_2, y_2, painting, color, line, mode)
}
window.sendDrawingData = sendDrawingData;

/**
 * Store and emit annotation data
 * @param resultId
 * @param resultName
 * @param resultDescription
 * @param resultUrl
 * @param resultColor
 */
function sendAnnotationData(resultId, resultName, resultDescription, resultUrl, resultColor){
    // store data being drawn then emit
    storeAnnotationData(roomNo, {roomId: roomNo, name: name, resultId: resultId, resultName: resultName, resultDescription: resultDescription, resultUrl: resultUrl, resultColor: resultColor})
        .then(response => console.log('inserting annotation data worked!!'))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
    chat.emit('send', roomNo, name, resultId, resultName, resultDescription, resultUrl, resultColor)
}
window.sendAnnotationData = sendAnnotationData;

/**
 * check if room id is in correct format
 */
function checkRoomId(roomId) {
    if (roomId.length == 10) {
        for (const c of roomId) {
            if (c >= '0' && c <= '9') {
                continue
            } else if (c.toUpperCase() != c && c.toLowerCase() == c) {
                continue
            } else {
                return false
            }
        }
    }
    else {
        return false
    }
    return true
}

/**
 * used to connect to a room. It gets the name and room id from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    image = document.getElementById('myImage');
    file = image.files[0];
    if (online_status == true){
        if (file) {
            img.src = URL.createObjectURL(file)
            var canvas = document.getElementById('canvas');
            var imgBase = canvas.toDataURL();
            storeImageData(roomNo, {roomId: roomNo, img: imgBase})
            setBackground(imgBase);
        }
        if (!name) name = 'Unknown-' + Math.random();
        //check if room id is in correct format
        if (checkRoomId(roomNo) == true) {
            chat.emit('create or join', roomNo, name);
        } else {
            alert('Room ID should have 10 lowercase alphanumeric characters');
        }
    } else {
        hideLoginInterface(name, roomNo)
        loadData(roomNo, false).then(response => console.log("Successfully loaded local data"))
    }
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnChatHistory(text) {
    if (text==='') return;
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    // scroll to the last element
    history.scrollTop = history.scrollHeight;
    document.getElementById('chat_input').value = '';
}

async function syncDatabase(){
    let Story = require('../models/stories');
    const Stories = Story.getAll()
    console.log("Syncing...")
    for (let story of Stories){
        if (getStoryData(story.id) !== null){
            storeStoryData(story.title, {title: story.title, shorttext: story.short_text, authorname: story.author_name, dateofissue: story.date_of_issue})
            storeStoryImg(story.title, {img: story.img})
            console.log("Added story during sync")
        }
    }
    console.log("Story Synced!")
}
/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId, image) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('container_interface').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('canvas_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
    document.getElementById('image').innerHTML = image;
}
