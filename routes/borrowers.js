// here we will create our borrowers routes and router 
// import express 
const express = require('express'); 
// we need to import our borrower(the person) and our borrowing(the action) database models
const Borrower = require('../models/borrower');
const Borrowing = require('../models/borrowing');
const Book = require('../models/book');
// use express to create a router 
const router = express.Router();
// we create an array of the accepted image types
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; // these are the acceptable image types to be uploaded 

// we create our routes here 

// we create a route that gets all our borrowers and displays them on a borrower's index page / homepage 
router.get('/', async (req, res) =>{

    // we create our search options for our borrowers basing on their names 
    let searchOptions = {}; // we initialise it as an empty object where we will populate the searching conditions for our borrowers 

    // then we create the searching conditions for our borrowers 
    if(req.query.fullName != null && req.query.fullName != ''){
        // we check is the user entered a name in our borrower search field
        searchOptions.fullName = new RegExp(req.query.fullName, 'i'); // we create a regular expression for our fullname search field for our borrowers and it is case insensitive 
    }
    try{
        // we get the borrowers from the database 
        const borrowers = await Borrower.find(searchOptions);

        // we then render our borrowers home / index page
        res.render('borrowers/index', {
            borrowers: borrowers,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/');
    }
});


// to implement our get registration route we need to create a new borrower route 
router.get('/new', async (req, res) => {
    try{
        // we need to create a new borrower object that we will be populating 
        const books = await Book.find({});
        const borrower = new Borrower();
        const borrowing = new Borrowing();

        //we then render our new page 
        res.render('borrowers/new', {
            books: books,
            borrower: borrower,
            borrowing: borrowing
        });
    }catch{
        res.redirect('/borrowers');
    }
});

// we create a create borrower route that implements the creation process of the borrower 
router.post('/', async(req, res) =>{
    // this route will implement the creating of our borrower and it will post all the input borrower details to the database 
    // we create the borrower object according to the properties inputs by the administrator creating the borrowing element
    const borrower = new Borrower({
        fullName: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        DateOfBirth: req.body.DateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
        idType: req.body.idType,
        idNumber: req.body.idNumber,
        idIssuer: req.body.idIssuer,
        createdAt: req.body.createdAt
    });
    // we call the function that saves our uploaded id images to the database 
    SaveIdImage(borrower, req.body.idImage);
    // we need to save our new borrower that we created to the database 
    try{
        // we save our borrower object information 
        const newBorrower = await borrower.save();
        
        // we create a borrowing action object as well where the borrowing action properties will be passed by the database 
        const borrowing = new Borrowing({
            borrower: newBorrower._id,
            bookBorrowed: req.body.bookBorrowed,
            borrowDate: req.body.borrowDate,
            dueDate: req.body.dueDate,
            approvedBy: req.body.approvedBy,
            returnDate: req.body.returnDate,
            status: req.body.status
        });

        // save our borrowing information 
        await borrowing.save();

        // we redirect the user to the borrower show page 
        // for now we redirect to the borrowers index page
        res.redirect('/borrowers');
        //res.redirect(`/borrowers/${newBorrower.id}`);
    }catch(err){
        console.log(err);
        const books = await Book.find({});
        res.render('borrowers/new', {
            books: books,
            borrower: borrower,
            borrowing: new Borrowing(req.body),
            errorMessage: "Error Creating The Borrower"
        })
    }
});

// we create a function that saves our id images to our mongoose database 

function SaveIdImage(borrower, idEncoded){
    // borrower; is the borrower object that we are creating and uploading an image for.
    // idEncoded; is our image base64 string that has been created when our filepond file encode plugin encodes our binary data image into a base64 string 
    // we have to check if the user uploaded an image 
    if(idEncoded == null || idEncoded === '') return; // this means that the user never uploaded an image 
    // if they uploaded an image we can convert the base64 encoded string into a JSON object so that we can access its object properties easily
    const id = JSON.parse(idEncoded); // this converts the id image base64 string to a js object 
    // we check is the image is of the prefered type
    if(id != null && imageMimeTypes.includes(id.type)){
        // if the user uploaded the image and its of the accepted image type as well 
        // we convert the image data from base64 to a buffer so that we can save it into our mongoDB database
        borrower.idImage = new Buffer.from(id.data, 'base64'); // converting the image data from a base64 string into a buffer 
        borrower.idImageType = id.type;
    };
}
// we export the router for usage in our server file 
module.exports = router;