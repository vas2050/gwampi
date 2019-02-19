const mongoose = require('mongoose');

//connect to db
mongoose.connect('mongodb://localhost:<port>/<db>', {useNewUrlParser: true, useCreateIndex: true});
//var db = mongoose.connection;
