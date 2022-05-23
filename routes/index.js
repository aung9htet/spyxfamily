var express = require('express');
var router = express.Router();

let Story = require('../models/stories');

var story = require('../controllers/stories');

var initDB = require('../controllers/init');
initDB.init();

router.get('/', (req, res) => {
  res.redirect('/index');
});


router.get('/index',(req,res,next) =>{
  //Here fetch data using mongoose query like
  // object of all the users
  res.render('index2');
  });
/* GET home page. */

/*router.get('/index', function(req, res, next) {
  console.log((story.getAll()));
  res.render('index', { stories: story.getAll });
});*/

router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'My Form' });
});

router.get('/retrievedata', function(req, res, mnext){
  Story.find({}, function(err, stories) {
    if (err) throw err;
    res.send(stories);
  })
})

router.post('/insert', function(req, res, next) {
  // const myPromise = new Promise((resolve, reject) => {
  //   story.insert(req, res);
  // });
  // myPromise.then(res.redirect("/index"));
  story.insert(req, res);

});

/*router.post('/insert', story.insert) {
  redirect("/");
};*/


module.exports = router;
