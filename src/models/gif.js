const mongoose = require("mongoose");

const gifSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    keyWords:{
        type:String,
        trim:true
    },
    name:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
},{
    timestamps:true
});


const Gif = mongoose.model("Gif",gifSchema);

module.exports = Gif;
