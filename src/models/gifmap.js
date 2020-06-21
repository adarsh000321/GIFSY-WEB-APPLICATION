const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema({
    name:{
        type:String
    },
    buffer:{
        type:Buffer
    }
});

const Map = mongoose.model("Map",mapSchema);

module.exports = Map;