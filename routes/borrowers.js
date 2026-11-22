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

// we need to build the show , edit, update and delete routes for the borrowers 

// show borrower route 
router.get('/:id', async (req, res) =>{
    // we use an id since we are going to get a specific borrower from the database and show them to the user
    try{
        const borrower = await Borrower.findById(req.params.id);
        const borrowing = await Borrowing.findOne({borrower: req.params.id}).populate('borrower').populate('bookBorrowed').exec();
 
        // we render our show page 
        res.render('borrowers/show', {
            borrower: borrower,
            borrowing: borrowing
        });
    }catch(err){
        console.log(err);
        res.redirect('/borrowers');
    } 
});

// edit page router for a borrower 
router.get('/:id/edit', async(req, res)=>{
    // renders a specific borrowers edit page so that they can be updated 
    // first get the borrower by their id from the database 
    try{
        const borrower = await Borrower.findById(req.params.id);
        const books = await Book.find();
        const borrowing = await Borrowing.find();

        // then we render our edit page for our user 
        // we are rendering the edit.ejs view file from our views folder and this is its directory borrowers/edit
        res.render(`borrowers/edit`, {
            borrower: borrower,
            books: books,
            borrowing: borrowing
        });
    }catch{
        // if an error occurs 
        res.redirect('/borrowers'); // redirect to the borrowers home page 
    }
});

// update route 
router.put('/:id', async (req,res)=>{
    // here we will implement our borrower updating 
    let borrower; // here we will store the borrower that we will retrieve from the database 
    let borrowing;
    try{
        // we get our borrower that we want to update from the database by their id 
        borrower = await Borrower.findById(req.params.id); 
        borrowing = await Borrowing.findOne({borrower: req.params.id}); // we find a borrowing whose borrower's id matches the id of our borrower 
        // we use findOne but not find since it returns objects but not strings and we can easily access our properties of our 
        // database schema 
        // we implement the changes that the user might want to make according to our properties 
        borrower.fullname = req.body.fullname;
        borrower.email = req.body.email;
        borrower.phoneNumber = req.body.phoneNumber;
        borrower.DateOfBirth = req.body. DateOfBirth;
        borrower.gender = req.body.gender;
        borrower.address = req.body.address;
        borrower.idType = req.body.idType;
        borrower.idNumber = req.body.idNumber;
        borrower.idIssuer = req.body.idIssuer;
        // we check if the user has changed the id image 
        if(req.body.idImage != null && req.body.idImage !== ''){
            // we save the new image of the id uploaded by the user 
            SaveIdImage(borrower, req.body.idImage);
        }
        borrowing.bookBorrowed = req.body.bookBorrowed;
        borrowing.borrowDate = req.body.borrowDate;
        borrowing.dueDate = req.body.dueDate;
        borrower.createdAt = req.body.createdAt;
        borrowing.returnDate = req.body.returnDate;
        borrowing.approvedBy = req.body.approvedBy;
        borrowing.status = req.body.status;

        // now we save our new changes to the database 

        await borrower.save();
        await borrowing.save();

        // after saving our changes we render the borrowers show page 
        res.redirect(`/borrowers/${borrower.id}`);

    }catch(err){
        console.log(err);
        // we render an error on the edit page
        const books = await Book.find({});
        res.render('borrowers/edit', {
            books: books,
            borrower: borrower,
            borrowing: borrowing,
            errorMessage:'Error Updating The Borrower'
        }) 
    }
});

// delete borrower route 
router.delete('/:id', async (req, res)=>{
    // we implement the delete action of our borrowers in this router
    let borrower;
    let borrowing;
    try{
        // we first find our borrower 
        borrower = await Borrower.findById(req.params.id);
        // we also find the borrowing associated to this borrower 
        borrowing = await Borrowing.findOne({borrower:  req.params.id}); // we use findOne since we need it in Js Object form
        // we find a borrowing whose borrower's object id is the same as our borrowers id 
        // this means the borrower links to the borrowing 

        // then we implement the deleting of the borrower and the borrowing they are linked to.
        await borrower.deleteOne();
        await borrowing.deleteOne();

        // we delete the borrower and also delete the borrowing that they have associated with in order not to live any redundant 
        // borrowings with out any borrowers they have linked to. 

        // then we render the borrowers index page 
        res.redirect('/borrowers');
    }catch{
        if(borrower == null || borrowing == null){
            res.redirect('/');
        }else{
            res.redirect(`/borrowers/${borrower.id}`);
        }
    }
});
// we export the router for usage in our server file 
module.exports = router;  