const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Image = new Schema({
    img:{data:Buffer,contentType: String}
});

module.exports = mongoose.model('Image', Image);