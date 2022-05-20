let name = null;
let roomNo = null;
let chat= io.connect('/chat');

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';
    //initialise chat socket
    initChatSocket()
}

/**
 *
 * @param chatDetails details contained in the chat
 * will write the chat messages locally for the user
 */
function writeLoadedData(chatDetails){
    const curr_usr = name;
    name = chatDetails.name;
    const msg = chatDetails.msg;
    writeOnChatHistory('<b>' + name + ':</b> ' +  msg);
    name = curr_usr
}

/**
 * to rewrite for loaded data
 */
async function loadData(roomNo, forceReload) {
    // get chat data by name and currently set room id
    let chatData = await getChatData(roomNo)
    if (!forceReload && chatData && chatData.length > 0) {
        for (let chat of chatData)
            writeLoadedData(chat)
    }
}
/**
 * called to generate a random room number with 10 alphanumeric letters
 */
function generateRoom() {
    roomNo = (Math.random() * 1000000000000000000).toString(36).substring(0,10);
    document.getElementById('roomNo').value = roomNo;
}

/**
 * initialises the socket for /chat
 */
function initChatSocket(){
    /** initialise the database */
    if ('indexedDB' in window) {
        initDatabase()
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    chat.on('joined', function(room, userId) {
        if (userId === name) {
            hideLoginInterface(room, userId, image)
            console.log('loading data')
            loadData(roomNo, false)
        } else {
            writeOnChatHistory('<b>' + userId + '</b> ' + 'joined room ' + room);
        }
    });
    chat.on('chat', function (room, userId, chatText) {
        let who = userId
        // store data for both those who received or send
        storeChatData(roomNo, {roomId: room, name: name, msg: chatText})
            .then(response => console.log('inserting data worked!!'))
            .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
        if (userId === name) who = 'Me'
        writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
    });
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    // @todo send the chat message
    chat.emit('chat', roomNo, name, chatText);
}

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
    if (file) {
        img.src = URL.createObjectURL(file)
    }
    if (!name) name = 'Unknown-' + Math.random();
    //check if room id is in correct format
    if (checkRoomId(roomNo) == true) {
        chat.emit('create or join', roomNo, name);
    } else {
        document.getElementById('commentErr').innerHTML = 'Room ID should have 10 lowercase alphanumeric characters';
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

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId, image) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
    document.getElementById('image').innerHTML = image;
}
