// we need to create our book router and routes here 
// import express 
const express = require('express');
// we first import the path library to enable us access and use the coverImageBasePath that we exported from the book's database model
const path = require('path');
// we need to import our exported book database model to our routes file
const Book = require(`../models/book`);
// we also import our authors database model into our books route file
const Author = require(`../models/author`);
const req = require('express/lib/request');
const book = require('../models/book');
//we use express to create a router 
const router = express.Router();

// we then need to configure the destination of our cover image using multer
const imageMimeTypes =['image/jpeg', 'image/png', 'image/gif']; // these are the types of images. array of image types accepted 


// we then use our router to create all the book routes 

// Getting All books
router.get('/', async (req, res) => {
    try{
        // we create our querries based on our specific search options 
        let query = Book.find();
        // title search option; 
        if (req.query.title != null && req.query.title != ''){
            query = query.regex('title', new RegExp(req.query.title, 'i')); // create a regular expression for the title query and make it case in-sensitive
        }
        // published Before date search option
        if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
            query = query.lte('publishDate', req.query.publishedBefore); // lte: less than or equal to
        } 
        // published After date search option
        if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
            query = query.gte('publishDate', req.query.publishedAfter); // gte: greater than or equal to
        }
        // execute our query and its search options 
        const books = await query.exec();
        // rendering our index page 
        res.render('books/index', {
            books: books,
            searchOptions: req.query 
        });
    }catch{
        res.redirect('/'); // redirect back to the home page 
    }
});

// New Book route 
// this route helps us to render our book's new page
router.get('/new', async (req, res) =>{
    // create a book object
    const book = new Book();
    // we will use our middle ware function that we created to render our new book page
    renderNewPage(res, book);
});

// creating book route
// we use this route to create our book according to the details passed in in the new books page
// we have to tell multer that we are uploading a single file
router.post('/', async (req, res) => {
    // we need to create a book object basing on the database model for the books
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: req.body.publishDate,
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover) // we save our book cover 
    try{
        const newBook = await book.save(); // we save the book that we just created 
        res.redirect(`books/${newBook.id}`);
    }catch{
        renderNewPage(res, book, true); // hasError = true;
    }
});

// now we need to create the show/edit/update/delete page routes 
// now we create the show route 
router.get('/:id', async (req, res) => {
    try{
        // we find a book from the database by their id.
        const book = await Book.findById(req.params.id).populate('author').exec();
        // then we render out the book's show page 
        res.render('books/show', {book: book});
    }catch{
        res.redirect('/'); // we redirect to the homepage 
    };
});   

// edit book route 
router.get('/:id/edit', async (req, res) =>{ 
    try{
        // we get a book by its id from the database 
        const book = await Book.findById(req.params.id);
        // we will create a renderEditPage function so we call it to render our edit page for us
        renderEditPage(res, book);
    }catch{
        // if there is an error
        res.redirect('/'); // redirect the user to the home page 
    }
});

// updating book route
router.put('/:id', async (req,res) =>{
    // we create a variable for storing our books 
    let book;
    try{
        // we get the book from the database by their id and store them in the database variable
        book = await Book.findById(req.params.id);
        // now we list the properties that we would love to update when a user updates them 
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        // we have to check if the user updated the cover image  then we have to save the new cover image 
        if (req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover);
        }
        // we have to save the book updates 
        await book.save();
        // then we redirect the user to the individual book's page 
        res.redirect(`/books/${book.id}`);
    }catch{
        // we have to check if there is no book
        if(book != null){
            renderEditPage(res, book, true); // has an error in rendering page 
        }else{
            // redirect to the main home or index page
            res.redirect('/');
        }
    }
});

// delete book route 
router.delete('/:id', async (req, res) =>{
    // we create a function for storing our book that we retrieve from the database 
    let book;
    try{
        // we get the book by its id from the database 
        book = await Book.findById(req.params.id);
        // we delete the book from the database 
        await book.deleteOne();
        // then we redirect our users to the books home / index page 
        res.redirect('/books');
    }catch{
        // we first check if there is a book found 
        if(book != null){
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove the book'
            });
        }else{
            // then we redirect the user to the home or index page 
            res.redirect('/');
        }
    }
})

// we need to create our renderFormPage that will render our forms the edit and new page forms 
async function renderFormPage(res,book, form, hasError = false){
    try{
        // we find all the authors from our database and store them in a variable
        const authors = await Author.find({});
        // we initiate our parameters to display on our forms 
        const params = {
            authors: authors,
            book: book
        }
        // if there is an error
        if(hasError) params.errorMessage = 'Error occured';
        res.render(`books/${form}`, params); // if all good we render that form that we passed as a parameter 
    }catch{
        // redirect to the books index page
        res.redirect('/books');
    }
}

// we create a function that renders the new book page using our renderFormPage function that we created above 
async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError);
}

// we create the renderEditPage function using the renderFormPage function that we just created 
async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError); // we create the render edit page by calling the renderFormPage that we created 
}

// we create function that saves our book cover 
function saveCover(book, coverEncoded){
    if(coverEncoded == null) return; // we check if there is any cover image information in the system 
    const cover = JSON.parse(coverEncoded); // if there is convert it from json form into js object form 
    if(cover != null && imageMimeTypes.includes(cover.type)){ // then check if it is of the desired image type
        book.coverImage = new Buffer.from(cover.data, 'base64'); // save it as the book cover image 
        book.coverImageType = cover.type; // and save its image type as the cover image type.
    }
}

// we export the router that we created 
module.exports = router;