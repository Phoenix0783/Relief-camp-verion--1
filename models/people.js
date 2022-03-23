const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PeopleSchema = new Schema({
    name: String,
    age: String,
    phone: String, 
    date:String, 
});

module.exports = mongoose.model('People', PeopleSchema);