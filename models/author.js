// here we will create a mongoose schema 
// import mongoose 
const mongoose = require('mongoose');
// create the schema
const authorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true 
    }
});

// we export this schema
module.exports = mongoose.model(`Author`, authorSchema);