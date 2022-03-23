const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
    name: String,
    location:String,
    phone: String, 
    date:String, 
    time:String
});

module.exports = mongoose.model('Alert', AlertSchema);