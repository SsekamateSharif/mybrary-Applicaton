// we are going to create our database model here 
// import mongoose
const mongoose = require('mongoose');
// we create our database schema using mongoose 
const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    // here we will add a reference to the author data for the author of the specific book, links the books to their specific authors 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author' // we reference the author database model exported 
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    }
});
// we create a cover image path virtual property
bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
});

// we need to export our database model that we created 
module.exports = mongoose.model(`Book`, bookSchema);
