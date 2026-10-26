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
        // res.redirect(`books/${newBook.id}`);
        res.redirect('books'); // for now
    }catch{
        renderNewPage(res, book, true); // hasError = true;
    }
});

// we create a function that renders the new book page 
async function renderNewPage(res, book, hasError = false){
    try{
        // we first get the authors from the database 
        const authors = await Author.find({});
        // then we set the parameters to be rendered on the new page
        const params = {
            authors: authors,
            book: book
        }
        // we check if it has error
        if (hasError){
            params.errorMessage = 'Error Creating the book';
        }
        // if everything goes well we render the book's new page and we display our params on the page 
        res.render('books/new', params);
    }catch{
        // we redirect them to the books home or index page
        res.redirect('books'); 
    }
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