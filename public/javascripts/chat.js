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
    //initialise chat socket
    initChatSocket()
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
    writeOnChatHistory('<b>' + chatDetails.name + ':</b> ' +  msg);
}

/**
 * to rewrite for loaded data
 */
async function loadData(roomNo, forceReload) {
    // get chat data by name and currently set room id
    let chatData = await getChatData(roomNo)
    let imageData = await getImageData(roomNo)
    if (imageData) {
        img.src = imageData.img;
    }
    if (!forceReload && chatData && chatData.length > 0) {
        for (let chat of chatData)
            writeLoadedData(chat)
    } else {
        const input = JSON.stringify({roomId: roomNo});
        $.ajax({
            url: '/',
            data: input,
            contentType: 'application/json',
            type: 'POST',
            success: function (dataR) {
                // no need to JSON parse the result, as we are using
                // dataType:json, so JQuery knows it and unpacks the
                // object for us before returning it
                writeLoadedData(dataR);
                storeChatData(dataR.roomId, dataR);
                if (document.getElementById('offline_div') != null)
                    document.getElementById('offline_div').style.display = 'none';
            },
            error: async function (xhr, status, error) {
                showOfflineWarning();
                let cachedData=await getChatData(roomNo);
                if (cachedData && cachedData.length>0)
                    writeLoadedData(cachedData[0])
                const dvv = document.getElementById('offline_div');
                if (dvv != null)
                    dvv.style.display = 'block';
            }
        });
    }
}

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
    document.getElementById("callImageBtn").innerText = img.src;
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

    if (online_status == true) {
        chat.on('joined', function (room, userId) {
            if (userId === name) {
                hideLoginInterface(room, userId)
                console.log('loading data')
                loadData(roomNo, false).then(response => console.log("Successfully loaded data"))
            } else {
                writeOnChatHistory('<b>' + userId + '</b> ' + 'joined room ' + room);
            }
        });
        chat.on('chat', function (room, userId, chatText) {
            let who = userId
            // store data for both those who received or send
            storeChatData(roomNo, {roomId: room, name: name, msg: chatText})
                .then(response => console.log('inserting data worked!!'))
                .catch(error => console.log('error inserting: ' + +JSON.stringify(error)))
            if (userId === name) who = 'Me'
            writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
        });
    }
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
    if (online_status == true){
        if (file) {
            img.src = URL.createObjectURL(file)
            var canvas = document.getElementById('canvas');
            var imgBase = canvas.toDataURL();
            storeImageData(roomNo, {roomId: roomNo, img: imgBase})
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
