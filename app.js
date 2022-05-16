var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var fs = require('fs');
var bodyParser = require("body-parser");





var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})

var upload = multer({storage: storage})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// app.post("/uploadphoto",upload.single('myImage'),(req,res)=>{
//   var img = fs.readFileSync(req.file.path);
//   var encode_img = img.toString('base64');
//   var final_img = {
//     contentType:req.file.mimetype,
//     image:new Buffer(encode_img,'base64')
//   };
//   image.create(final_img,function(err,result){
//     if(err){
//       console.log(err);
//     }else{
//       console.log(result.img.Buffer);
//       console.log("Saved To database");
//       res.contentType(final_img.contentType);
//       res.send(final_img.image);
//     }
//   })
// })

app.post('/uploadphoto', upload.single('myImage'), (req, res, next) => {
  console.log("Upload photo")
  const file = req.myImage;
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file)

})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
