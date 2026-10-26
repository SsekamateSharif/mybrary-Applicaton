// this will be used for the index routes of our application 
//import express 
const express = require(`express`);
// import our book model
const Book = require('../models/book');
// use express to create the router 
const router = express.Router();

// main route that gets all users
router.get('/', async (req, res) => {
    let books; // create a variable for storing our books retrieved from the database 
    try{
        books = await Book.find().sort({ createdAt: 'desc'}).limit(10).exec(); // getting the books from the database
        // we sort the books in descending order depending on their publish date and only allow a maximum of 10 books to be showed 
    }catch{
        books = [];
    }
    // then we render our index page 
    res.render('index', {books: books});
})
// export our router for usage in the server 
module.exports = router; 
