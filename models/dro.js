const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DROSchema = new Schema({
    orgname: String,
    type: String,
    regnum: String, 
    proof:String,
    name:String,
    phone:String,
    email:String 
});

module.exports = mongoose.model('DRO', DROSchema);