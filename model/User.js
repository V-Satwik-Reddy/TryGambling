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
    balance:{
        type:Number,
        default:0
    },
    claimed:{
        type:Boolean,
        default:false
    },
    claimedAt:{
        type:Date,
        default:null
    },
},
{ timestamps:true})

module.exports = mongoose.model("User", userSchema);