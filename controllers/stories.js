let Story = require('../models/stories');

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
        })
        .then(window.location="/index")
        .catch(function (response) {
            alert(response.toJSON());
        })
}

/**
 * A function for receiving every entry in the Story MongoDB.
 * @param req
 * @param res
 */
exports.getAll = function (req, res) {
    console.log("Hello")
    Story.find({})
        .then(stories => {
            res.json(stories);
        })
        .catch((err) => {
            res.status(500).send('Invalid data or not found!' + JSON.stringify(err));
        });
}
/**
 * A function for inserting a new story into MongoDB.
 * @param req
 * @param res
 */
exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null)
        res.status(403).json('No data sent!')


    let story = new Story({
        title: userData.title,
        short_text: userData.shorttext,
        author_name: userData.authorname,
        date_of_issue: userData.dateofissue,
        img: userData.image,
    });
    // console.log('dob: '+character.dob);

    story.save()
        .then ((results) => {
            console.log("object created: "+ JSON.stringify(results._id));
            var id = results._id;
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
    return res.redirect('/index');

}


/*exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null)
        res.status(403).json('No data sent!')



    let character = new Character({
        first_name: userData.firstname,
        family_name: userData.lastname,
        dob: userData.year
    });
    // console.log('dob: '+character.dob);

    character.save()
        .then ((results) => {
            console.log("object created in init: "+ JSON.stringify(results));
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
}*/
