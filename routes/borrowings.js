// here i will create a router for the borrowings 
// import express 
const express = require('express');
// use express to make a router 
const router = express.Router();
// we need to import our database models 
const Borrowing = require('../models/borrowing');
const Borrower = require('../models/borrower');
const Book = require('../models/book');

// we will create our borrowing routes here 
// to get and display all the borrowings 
router.get('/', async(req, res) =>{
    // this gets all borrowings and displays them on the borrowings home page 
    try{
        // we need to retrieve our borrowings from the database 
        // we have to populate them with the referenced database models 
        // we create our query that we will use to create the search options
        let query =  Borrowing.find().populate('bookBorrowed').populate('borrower');
        // we start creating the search options for each individual input
        // name search options
        if(req.query.fullName != null && req.query.fullName != ''){
             // Find borrowers whose names match the search from the database
            const borrowers = await Borrower.find({
                fullName: new RegExp(req.query.fullName, 'i')
            });

            // Extract the IDs of the matching borrowers and map each borrower in the borrowers array to their matching ids 
            const borrowerIds = borrowers.map(borrower => borrower._id);

            // Find borrowings belonging to those borrowers in reference to the borrowers ids and the borrowerIds array
            query = query.where('borrower').in(borrowerIds);
        };
        // due date search option
        if(req.query.dueDate != null && req.query.dueDate != ''){
            // we check if the date entered by the user in our query matches any due dates in the database and we retrieve those borrowings 
            query = query.where('dueDate').equals(req.query.dueDate);
        };
        // borrow date search options
        if(req.query.borrowDate != null && req.query.borrowDate != ''){
            // we check if the date entered by the user in our query matches any due dates in the database and we retrieve those borrowings 
            query = query.where('borrowDate').equals(req.query.borrowDate);
        };
        // return date search options 
        if(req.query.returnDate != null && req.query.returnDate != ''){
            // we check if the date entered by the user in our query matches any due dates in the database and we retrieve those borrowings 
            query = query.where('returnDate').equals(req.query.returnDate);
        };

        // after creating all our query input search options then we need to execute our query 
        const borrowings = await query.exec(); // we execute our query

        // then we render our borrowings home page 
        res.render('borrowings/index', {
            borrowings: borrowings,
            searchOptions: req.query // represents our inputs search options 
        })
    }catch{
        res.redirect('/');  
    }
} );

// route that renders 
// export the router 
module.exports = router;