const express = require("express");
const app = express();
require("dotenv").config();
const userRoutes = require("./routes/users");
const gifRoutes = require("./routes/gifs");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session"); //required for connect-flash package


//mongoose connect
mongoose.connect(process.env.DB,{
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true,
    useNewUrlParser:true
});

app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"../public")));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRETE));// this key will be used to unsign the cookie 
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({resave:false,saveUninitialized:false,secret:process.env.SESSION_SECRETE})); // required for connect-flash
app.use(flash());
app.use((req,res,next)=>{ // res.locals variables can be accessed in ejs file
    res.locals.err = req.flash("err"); 
    res.locals.success = req.flash("success");
    next();
});

app.use(userRoutes);
app.use(gifRoutes);




app.listen(process.env.PORT,()=>{
    console.log("Server has started");
});