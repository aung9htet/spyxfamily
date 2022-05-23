/**
 * The function is called on body
 * The function will be used for initialising the indexDb for use
 * The function will initiate the function to start the database synchronization between the MongoDb and the IndexDb
 * The function will register the service workers for usage
 * The function will be displaying the stories from the indexDb
 */
function initIndex() {
    // initialise indexdb
    if ('indexedDB' in window) {
        initStoryDatabase()
            .then(response => console.log("Database initialised"))
    }
    else {
        console.log('This browser doesn\'t support IndexedDB')
    }
    // sync mongodb and index db
    syncDatabase()
    // initialise for service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(function () {
                // registration successful
                console.log('Service Worker Registered');
            });
    }
    createStories()
}

/**
 * A helper function for posting to a URL.
 * @param url The target URL of the axios query.
 * @param data The data to be POSTED to the url.
 * @return The response from the server.
 */

function sendAxiosQuery(url, data) {
    axios.post(url, data)
        .then((dataR) => {// no need to JSON parse the result, as we are using
            // we need to JSON stringify the object
            document.getElementById('results').innerHTML = JSON.stringify(dataR.data);
            console.log(dataR);
        })
        .then(window.location="/index")
        .catch(function (response) {
            return response.toJSON();
        })
}

/**
 * When the client gets off-line, it shows an offline warning to the user
 * so that it is clear that the data is stale
 * Makes the page ready for offline usage by disabling some features, i.e. to disable the button that lead to creating stories
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
    document.getElementById('creating_story').style.display = 'none';
}, false);

/**
 * When the client gets off-line, it shows an offline warning to the user
 * so that it is clear that the data is stale
 * Makes the page ready for offline usage by disabling some features, i.e. to disable the button that lead to creating stories
 */
window.addEventListener('online', function(e) {
    // Queue up events for server.
    console.log("You are online");
    alert("You are online");
    hideOfflineWarning();
    document.getElementById('creating_story').style.display = 'block';
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

}
/**
 * This function is called when the form is submitted. The function prepares the data for submission to "/insert".
 * The function also coverts the image into BASE64, so it can be stored in MongoDB/IDB.
 * @param route
 */
function onSubmit(route) {
    var formArray = $("form").serializeArray();
    var data = {};
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var file = document.getElementById("myImage").files[0];

    //var fileInput = document.querySelector('input');

    // var img = new Image();
    //
    //
    // img.onload = function() {
    //     ctx.drawImage(img, 0, 0);
    // }
    // img.src = URL.createObjectURL(file);
    //
    //
    // console.log(img.src);
    //
    var imgBase = canvas.toDataURL();
    //var imageBlob = imgBase.replace(/^data:image\/\w+;base64,/, "");
    for (index in formArray) {
        data[formArray[index].name] = formArray[index].value;
    }
    data.image = imgBase;
    // const data = JSON.stringify($(this).serializeArray());
    res = sendAxiosQuery(route, data);
    console.log(res);
    event.preventDefault();
}

/**
 * The function checks if there is any discrepancy between the IndexDb and the MongoDb using the title of the stories
 * The function will input data from the MongoDb into the IndexDb if there is anything missing
 */
async function syncDatabase(){
    axios.get("/retrievedata").then(async (dataR) => {
        const Stories = dataR;
        console.log("Syncing...")
        for (let story of Stories.data) {
            const getStory = await getStoryData(story.title)
            if (getStory.length == 0) {
                await storeStoryData(story.title, {
                    title: story.title,
                    shorttext: story.short_text,
                    authorname: story.author_name,
                    dateofissue: story.date_of_issue,
                    img: story.img
                })
                console.log("Added: " + story.title)
            } else {
                console.log("Not added: " + story.title)
            }
            console.log("Story Synced!")
        }
    });
}

/**
 * This function generates the index to be displayed from the back-end.
 */
var storyI = 0;
async function createStories() {
    var row = document.createElement('div')
    const getData = await getAllStoryData()
    console.log(getData)
    var story_len = getData.length
    var counter = 0

    for (let story of getData) {
        console.log("TEST")
        var col = document.createElement('div')
        var card = document.createElement('div')
        var card_body = document.createElement('div')
        var title_p = document.createElement('div')
        var short_text_p = document.createElement('div')
        var author_name_p = document.createElement('div')
        var story_p = document.createElement('div')
        var story_image = document.createElement('img')
        var btn_with_image = document.createElement('div')


        row.className = "row justify-content-md-center"
        col.className = "col"
        card.className = "card shadow mb-5 centerBlock"
        card_body.className = "card-body"
        card_body.style.width = "300px"
        story_image.style.width = "300px"
        story_image.style.height = "300px"
        story_image.style.objectFit = "cover"
        btn_with_image.className = "btnOnImage"




        story_image.src = story.img

        title_p.innerText = 'Title: ' + story.title
        console.log(story.title)
        short_text_p.innerText = 'Short Text: ' + story.shorttext
        author_name_p.innerText = 'Author Name: ' + story.authorname
        story_p.innerText = 'Date of Issue: ' + story.dateofissue
        card_body.appendChild(title_p)
        card_body.appendChild(short_text_p)
        card_body.appendChild(author_name_p)
        card_body.appendChild(story_p)
        btn_with_image.appendChild(story_image)
        card.appendChild(btn_with_image)
        card.appendChild(card_body)
        col.appendChild(card)

        row.appendChild(col)
        storyI = storyI + 1;
        if (storyI % 3 === 0 && storyI != 0) {
            document.getElementById("my_container").appendChild(row)
            row = document.createElement('div')
        }
        else if (storyI === story_len){
            document.getElementById("my_container").appendChild(row)
            break
        }
        counter = counter + 1
    }
}
