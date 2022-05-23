var express = require('express');
const story = require("../controllers/stories");
var router = express.Router();

/* GET home page. */
router.get('/chat', function(req, res, next) {
  console.log(req.body);
  res.render('chat', { title: 'Image Browsing' });
});


module.exports = router;
