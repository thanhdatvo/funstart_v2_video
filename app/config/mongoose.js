/**
 * Created by andh on 7/19/16.
 */
var config = require('./config.js'),
    mongoose = require('mongoose');
module.exports = function(callback) {
    var db = mongoose.connect(config.db);
    //mongoose.Promise = global.Promise;
    var dbc = mongoose.connection;
    dbc.on('error', console.error.bind(console, 'connection error:'));
    dbc.once('open', function() {
        console.log("DB connect successfully!");
        callback();
    });
    require('../models/user.server.model');
    require('../models/game.server.model');
    require('../models/activity.server.model');
    require('../models/topic.server.model');
    return db;
};