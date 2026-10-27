// here we will create a mongoose schema 
// import mongoose 
const mongoose = require('mongoose');
// import the book database model
const Book = require(`../models/book`);
// create the schema
const authorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true 
    }
});

// we create a pre function that runs before we delete a book
// we have to access the author schema to create this pre function 
// We create a pre function that runs before we delete an author
// this function is a middle-ware function that prevents us from deleting an author that is associated to a book
authorSchema.pre('deleteOne', {document: true, query: false}, async function(){
    // getting the books related to the author from the database 
    const books = await Book.find({author: this.id}); 
    
    // check if a book was found if so throw an error
    if(books.length > 0){
        throw new Error("The Author still has books");
    }
});
// we export this schema
module.exports = mongoose.model(`Author`, authorSchema);