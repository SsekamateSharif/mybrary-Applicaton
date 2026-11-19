// i will create my borrowing (action) database model here 
// i import mongoose
const mongoose  = require('mongoose');
// create my schema
const borrowingSchema = new mongoose.Schema({
    // we add a book reference; i.e. referencing the book that was borrowed 
    bookBorrowed:{
        type: mongoose.Schema.Types.ObjectId, // this references the id of the book being borrowed to the borrower who is borrowing it 
        required: true,
        ref: 'Book' // we refer to the book schema i.e. the book database model 
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId, // we create a relationship between the borrowing activity and the borrower i.e. the person borrower 
        required: true,
        ref: 'Borrower' // this creates a relationship between the borrower and the borrowing activity 
    },
    borrowDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    approvedBy: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false
    }
});


// we then export our borrowing action schema
module.exports = new mongoose.model(`Borrowing`, borrowingSchema);