var express = require('express');
const story = require("../controllers/stories");
var router = express.Router();

/* GET home page. */
router.get('/chat', function(req, res, next) {
  console.log(req.body);
  res.render('chat', { title: 'Image Browsing' });
});

router.post('/chat', function(req, res, next) {
  // const myPromise = new Promise((resolve, reject) => {
  //   story.insert(req, res);
  // });
  // myPromise.then(res.redirect("/index"));
  console.log(req.body);
  res.render('chat', {data: req.body});

});

module.exports = router;
