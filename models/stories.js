const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Story = new Schema(
    {
        title: {type: String, required: true, max: 50},
        short_text: {type: String, required: true, max: 200},
        author_name: {type: String, required: true, max: 100},
        date_of_issue: {type: Date},
        img: {type: String},
    }
);

// Virtual for a character's age
/*Character.virtual('age')
    .get(function () {
        const currentDate = new Date().getFullYear();
        return currentDate - this.dob;
    });

Character.set('toObject', {getters: true, virtuals: true});*/

module.exports = mongoose.model('Story', Story, 'stories');
