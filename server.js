// import and configure the dotenv dev dependency
// we need to check and see if we are not running in a production environment    
if(process.env.NODE_ENV !== `production`){
    require(`dotenv`).config();
}
// import express
const express = require('express');
// import express-ejs-layouts dependency
const expressLayouts = require('express-ejs-layouts'); // this will aid with our app views 
// use express to make an express app that wil run our server
const app = express();

// import our index router into our server 
const indexRouter = require(`./routes/index`); // import the exported router from this directory.
// tell our app to use that router 
app.use('/', indexRouter);  // for the main page routes 

// we then have to set up our view engine 
app.set('view engine', 'ejs'); // this will also aid in our app views by converting ejs templates into understandable html for our system 
// we then set the origin of our views
app.set('views', __dirname + '/views'); // our views will be coming from the views folder 
// we then need to hookup the express layouts 
app.set('layout', 'layouts/layout'); 
// enable our server to use express layouts 
app.use(expressLayouts);
// tell the app to use public files from our public folder that we will create 
app.use(express.static('public')); // tells the app to use files from the public folder 
// we let our app to use json data
app.use(express.json());

// we make our app to listen for requests on port 3000
app.listen(3000, () =>{console.log("server is running on port 3000.")});

// we connect our server to mongodb database 
// first import mongoose
const mongoose = require('mongoose');
// we establish the connection to the mongodb database 
mongoose.connect(process.env.DATABASE_URL);
// store the connection in a variable
const db = mongoose.connection;
// check for errors
db.on('error', (error) => {console.error(error)});
// no error
db.once('open', ()=> {console.log("connected to the database successfully.")});