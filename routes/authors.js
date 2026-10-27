// creating our authors router here 
// import express 
const express = require(`express`);
// we need to import our authors database model into our routes file
const Author = require(`../models/author`);
// we import the book model in our authors route 
const Book = require('../models/book');
// use express to create the router 
const router = express.Router();

// Getting All Authors; creates authors index page where i can view all the authors and also search for the authors by name 
router.get('/', async (req, res) => {
    // we need to create our search options here 
    let searchOptions = {}; // initialise them as an empty object, where we will store our search conditions 
    // we check if the user had any name input in the request
    // we check if the name in the query request is not null and if its not empty.
    if(req.query.name != null && req.query.name !== " "){ // we check if the user entered a name 
        // then we create our search options conditions using a regular expression (RegExp(req.query.name, 'i')) basing on the name
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    try{
        // we find the authors from our database 
        const authors = await Author.find(searchOptions); // we find the author from the database basing on the search options given to us by the user 
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query // we render our search options as well 
        }); // renders the index/home page of our authors
    }catch{
        res.redirect('/');
    }
});

// New Author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()}); // renders the new page of our authors 
});

// create Author route 
router.post('/', async (req, res) => {
    // we now create a new author inside of here 
    // this is our new author object.
    const author = new Author({
        name: req.body.name
    })
    // we need to catch our errors and do the necessary using a try catch block 
    try{
        // we need to save the new author that we created 
        const newAuthor = await author.save();
        // we redirect the users to the author show page after creating the author
        res.redirect(`authors/${newAuthor.id}`); // this redirects the user to the author's page that he created 
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
});

// we create the routes for showing our authors, editing our authors and deleting our authors
// here we will be working with specifically one author so we need their id 

// showing authors route 
// this route should render our show authors page 
router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id); // we find our author by their id from the database 
        // we find the books that are associated to that author from the database 
        const books = await Book.find({author: author.id}).limit(6).exec(); // we limit to only display 6 books only 
        // we then render the author's show page. 
        res.render('authors/show', {
            author: author,
            booksByAuthor: books // these are the books that the author made 
        })
    }catch{
        res.redirect('/');
    }
})
//editing author route 
router.get('/:id/edit', async (req,res) => {
    try{
        const author = await Author.findById(req.params.id); // we get the author by their id 
        res.render('authors/edit', {author: author}); // we render out the author's edit page 
    }catch{
        res.redirect('/authors'); // redirect back to the authors index page 
    }
})
// updating authors route
router.put('/:id', async (req, res) =>{
    // we create our author variable for storing our author that we retrieved from the database 
    let author; 
    // we need to catch our errors and do the necessary using a try catch block 
    try{
        // we find the author by their id
        author = await Author.findById(req.params.id);
        author.name = req.body.name; // update the author's name 
        // save the changes 
        await author.save();
        res.redirect(`/authors/${author.id}`); // this redirects the user to the author's page that he created 
    }catch{
        if(author == null){
            // if there is no author at all
            res.redirect('/'); // redirect back to the homepage
        }else{
            // if the author is not null and it is just another error
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error Updating Author'
            })
        }
    }
})
// deleting authors route
router.delete('/:id', async (req, res) => {
        // we create our author variable for storing our author that we retrieved from the database 
    let author; 
    // we need to catch our errors and do the necessary using a try catch block 
    try{
        // we find the author by their id
        author = await Author.findById(req.params.id);
        // we delete our author that we found from the database 
        await author.deleteOne(); 
        res.redirect(`/authors`); // this redirects the user to the author's index  page 
    }catch{
        if(author == null){
            // if there is no author at all
            res.redirect('/'); // redirect back to the homepage
        }else{
            res.redirect(`/authors/${author.id}`); // we redirect you back to the author's page if there is an author 
        }
    }
})
// export the router for usage in the app server 
module.exports = router;
