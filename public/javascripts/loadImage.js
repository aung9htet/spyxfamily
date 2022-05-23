/**
 * The function will be used to call the images depending on the client's roomId from the link acquired from the indexDb
 * and loads them into the chat ejs file
 * @returns {Promise<void>}
 */
async function loadImage(){
    let imageData = await getImageData(roomNo);
    imageData = imageData.img;
    console.log(imageData);
    var canvas = document.getElementById('my_canvas');
    var img = document.getElementById('img');
    var imgSrc = img.src;
    console.log(imgSrc);
    var context = canvas.getContext('2d');
    var imageObj = new Image();
// To set the resolution use the canvas width and height properties
    canvas.width = 850;
    canvas.height = 600;

// To set the display size use the style width and height

    var prop = img.width/img.height;

    if (img.height > img.width){
        var height = canvas.height;
        var width = height*prop;
    }
    else {
        var width = canvas.width;
        var height = width/prop;
    }

    imageObj.onload = function () {
        context.drawImage(imageObj, (canvas.width-width)/2, (canvas.height-height)/2, width, height);
    };
    imageObj.src = imageData;
}
