const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VolunteerSchema = new Schema({
    name: String,
    age:String,
    phone: String, 
    gender:String
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);