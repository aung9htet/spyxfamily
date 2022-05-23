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
 * The function uses the params to set the image for the page, load the data from the indexdb to the chat function and to load the data of the knowledge graph onto the page
 * @param roomNo room no of the client
 * @param forceReload
 * @returns {Promise<void>}
 */
async function loadData(roomNo, forceReload) {
    // get chat data by name and currently set room id
    let chatData = await getChatData(roomNo)
    let imageData = await getImageData(roomNo)
    let annotationData = await getAnnotationData(roomNo)
    // load image set for the page
    if (imageData) {
        setBackground(imageData.img);
    }
    // load the chat data
    if (!forceReload && chatData && chatData.length > 0) {
        for (let chat of chatData)
            writeLoadedData(chat)
    }
    // load the knowledge graph
    if (!forceReload && annotationData && annotationData.length > 0) {
        for (let annotation of annotationData) {
            showAnnotation(annotation.resultId, annotation.resultName, annotation.resultDescription, annotation.resultUrl, annotation.resultColor);
        }
    }
}

/**
 * the function draws the annotation data that has been saved into the annotation for the current room number of the client
 * @returns {Promise<void>}
 */
async function loadDrawing(){
    let drawData = await getDrawData(roomNo)
    if (drawData && drawData.length > 0) {
        for (let draw of drawData)
            onMouseMoveRedraw(draw.draw_x, draw.draw_y, draw.draw_x1, draw.draw_y1, draw.draw_x2, draw.draw_y2, draw.painting, draw.color, draw.line, draw.mode)
    }
}
window.loadDrawing = loadDrawing;

/**
 * A function designed to draw an image to a canvas, so that it can be converted to BASE64.
 * @param input The image data.
 */
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
 * When the client gets off-line, it shows an offline warning to the user
 * so that it is clear that the data is stale
 * Makes the page ready for offline usage by disabling some features, i.e. to disable chat and knowledge graph function
 * since knowledge requires internet and chat requires interaction between client
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
    online_status = false;
    // knowledge graph
    document.getElementById('typeForm').style.display = 'none';
    document.getElementById('widget').style.display = 'none';
    // chat
    document.getElementById('chat_set').style.display = 'none';
}, false);

/**
 * When the client gets online, it shows an online warning to the user
 * Features are re-enabled for the user to send chat and use/share knowledge graph
 * */
window.addEventListener('online', function(e) {
    // Queue up events for server.
    console.log("You are online");
    alert("You are online");
    hideOfflineWarning();
    online_status = true;
    syncDatabase()
        .then(response => console.log("Data inserted"))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
    // knowledge graph
    document.getElementById('typeForm').style.display = 'block';
    // chat
    document.getElementById('chat_set').style.display = 'block';
}, false);

/**
 * Notifies the user that it is now set to offline mode
 */
function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
        alert("You are offline");

}

/**
 * Notifies the user that it is available to use online now
 */
function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

/**
 * The function generates a random alpha-numeric string of length 10
 * This will be used to call upon for usage in generating the roomId
 */
function generateRoom() {
    roomNo = (Math.random() * 1000000000000000000).toString(36).substring(0,10);
    document.getElementById('roomNo').value = roomNo;
}

/**
 * The function is used for emitting the chat messages when the user has pressed the send button
 * The function will also be recording the message details in the indexDb to recall them on re-load and for offline function
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
 * The function stores the drawing data into the indexDb
 * The function emits the drawing data so this can be data can be shared to the other clients
 * @param x x coordinate of the mouse position for the normal drawing
 * @param {int}     x          x coordinate of the mouse position for the normal drawing
 * @param {int}     y          y coordinate of the mouse position for the normal drawing
 * @param {int}     x1         x1 coordinate of the mouse position for the square drawing
 * @param {int}     y1         y1 coordinate of the mouse position for the square drawing
 * @param {int}     x2         x2 coordinate of the mouse position for the square drawing
 * @param {int}     y2         y2 coordinate of the mouse position for the square drawing
 * @param {boolean} painting   check if the user is currently drawing
 * @param {color}   color      get the color that user used for drawing
 * @param {int}     line       get the line width that user used for drawing
 * @param {string}  mode       determine if the user is currently using knowledge graph mode or normal drawing mode
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
 * The function stores the knowledge graph data into the indexDb
 * The function emits the knowledge graph data so this can be data can be shared to the other clients
 * @param   {String}    resultId                    id of the result selected
 * @param   {String}    resultName                  title of the result
 * @param   {String}    resultDescription           short description of the result
 * @param   {URL}       resultUrl                   link to the results
 * @param   {Color}     resultColor                 the annotation color that is related to the knowledge graph
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
 * The function checks whether the format of the roomId is correct
 * Used if the user decides to input their own roomId for joining/creating
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
 * The function is used to connect to a room and set variables(image, name, roomId) that may be necessary for the room
 * The function creates a random name if the user has not set their own name
 * The function checks if the roomId is value or not
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
 * It appends the given html text to the history div
 * This is to be called when the socket receives the chat message (socket.on ('message'...)
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
