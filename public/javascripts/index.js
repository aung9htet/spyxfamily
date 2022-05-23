function initIndex() {
    if ('indexedDB' in window) {
        initStoryDatabase()
            .then(response => console.log("Database initialised"))
    }
    else {
        console.log('This browser doesn\'t support IndexedDB')
    }
    syncDatabase()
    // initialise for service workers
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function(){
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(registration) {
                    // registration successful
                    console.log('Service Worker Registered', registration.scope);
                }, function(err){
                    // registration failed
                    console.log('Service Worker Registration failed: ', err);
                });
        });}
    createStories()
}

function pat() {
    console.log("pat")
}

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
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
    document.getElementById('creating_story').style.display = 'none';
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
    document.getElementById('creating_story').style.display = 'block';
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
var storyI = 0;
async function createStories() {
    var row = document.createElement('div')
    const getData = await getAllStoryData()
    console.log(getData)
    var story_len = getData.length

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
        var image_btn = document.createElement('button')


        row.className = "row justify-content-md-center"
        col.className = "col"
        card.className = "card shadow mb-5 centerBlock"
        card_body.className = "card-body"
        card_body.style.width = "300px"
        story_image.style.width = "300px"
        story_image.style.height = "300px"
        story_image.style.objectFit = "cover"
        btn_with_image.className = "btnOnImage"
        image_btn.className = "imageBtn btn btn-light"
        image_btn.innerText = "Start Chat"


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
        btn_with_image.appendChild(image_btn)
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

        console.log(storyI)
    }
}