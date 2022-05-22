function init() {
    if ('indexedDB' in window) {
        initStoryDatabase()
            .then(response => console.log("Database initialised"))
    }
    else {
        console.log('This browser doesn\'t support IndexedDB')
    }
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
    var title = formArray[0];
    var short_text = formArray[1];
    var author_name = formArray[2];
    var date_of_issue = formArray[3];
    storeStoryData(title, {title: title, shorttext: short_text, authorname: author_name, dateofissue: date_of_issue})
        .then(response => console.log('inserting data worked!!'))
        .catch(error => console.log('error inserting: ' + + JSON.stringify(error)))
    data.image = imgBase;
    console.log(data);
    // const data = JSON.stringify($(this).serializeArray());
    res = sendAxiosQuery(route, data);
    console.log(res);
    event.preventDefault();
}

//Currently not being used
function applyImageOffCanvas(image){
    document.getElementById("octext").innerText = "asdnaskdnasjkldnaslkn";
    document.getElementById("offCanvasImg").src = image;
}