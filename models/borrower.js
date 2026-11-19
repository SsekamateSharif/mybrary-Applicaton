// we will create our borrower schema here 
// borrower(the person Database Model);
// we import mongoose 
const mongoose = require('mongoose');
// we use mongoose to create a schema for our borrower
const borrowerSchema = new mongoose.Schema({
    // we put our borrower properties here 
    fullName: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true 
    },
    DateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    idType: {
        type: String,
        required: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true 
    }, 
    idIssuer: {
        type: String,
        required: true
    },
    idImage: {
        type: Buffer,
        required: true
    },
    idImageType: {
        type: String,
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true 
    }
});

// we create a virtual property that allows us access the images from the database and even use them in our views 
// we also add the virtual property name 
borrowerSchema.virtual('idImagePath').get(function(){
    // we check if there is an image in the database 
    if(this.idImage != null && this.idImageType != null){
        // then we return the image data of the image from the database 
        return `data:${this.idImageType};charset=utf-8;base64,${this.idImage.toString('base64')}`;
    }
});

// we now export the borrower schema 
module.exports = new mongoose.model(`Borrower`, borrowerSchema);
