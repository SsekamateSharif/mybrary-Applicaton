// creating our authors router here 
// import express 
const express = require(`express`);
// we need to import our authors database model into our routes file
const Author = require(`../models/author`);
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
        //res.redirect(`authors/${newAuthor.id}`); // this redirects the user to the author's page that he created 
        // but for now we will redirect the users to the authors home page
        res.redirect('authors');
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
});
// export the router for usage in the app server 
module.exports = router;
