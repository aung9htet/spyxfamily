let Story = require('../models/stories');

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
