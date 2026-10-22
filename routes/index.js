// this will be used for the index routes of our application 
//import express 
const express = require(`express`);
// use express to create the router 
const router = express.Router();

// main route that gets all users
router.get('/', (req, res) => {
    res.render(`index`); // we render our index page (home page for testing purposes.)
})
// export our router for usage in the server 
module.exports = router; 
