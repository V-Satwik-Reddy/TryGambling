const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    googleId:{
        type:String,
    },
    money:{
        type:Number,
        default:0
    }
},
{ timestamps:true})

module.exports = mongoose.model("User", userSchema);