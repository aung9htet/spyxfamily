const mongoose = require('mongoose');
const Story = require('../models/stories');


exports.init= function() {
    // uncomment if you need to drop the database

    // Story.remove({}, function(err) {
    //     console.log('collection removed')
    // });

    /*    let story = new Story({
            short_text: 'wwddwwddw',
            author_name: 'Brandon',
            date_of_issue: Date.now()
        });
        story.save()
            .then ((results) => {
                console.log("object created in init: "+ JSON.stringify(results));
            })
            .catch ((error) => {
                console.log(JSON.stringify(error));
            });

        let story2 = new Story({
            short_text: 'wdwd',
            author_name: 'Jim',
            date_of_issue: Date.now()
        });
        story2.save()
            .then ((results) => {
                console.log("object created in init: "+ JSON.stringify(results));
            })
            .catch ((error) => {
                console.log(JSON.stringify(error));
            });*/
}