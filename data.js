const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({

    images:{
        type: Array
    }

});

module.exports = mongoose.model('images', pageSchema);