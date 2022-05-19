var express = require('express');
var router = express.Router();

let Story = require('../models/stories');

var story = require('../controllers/stories');

var initDB = require('../controllers/init');
initDB.init();


router.get('/index',(req,res,next) =>{
  //Here fetch data using mongoose query like
  Story.find({}, function(err, stories) {
    if (err) throw err;
    // object of all the users
    console.log(stories)
    res.render('index2',{stories:stories});
  })});
/* GET home page. */

/*router.get('/index', function(req, res, next) {
  console.log((story.getAll()));
  res.render('index', { stories: story.getAll });
});*/

router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'My Form' });
});

router.post('/insert', function(req, res, next) {
  res.redirect("/index")
  story.insert(req, res)


});

/*router.post('/insert', story.insert) {
  redirect("/");
};*/

router.get('/insert', function(req, res, next) {
  res.render('insert', { title: 'My Form' });
});

module.exports = router;
