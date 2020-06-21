const User = require("../models/user");
const jwt = require("jsonwebtoken");


const auth = async (req,res,next)=>{
    try{
        const token = req.signedCookies["auth-token"] || req.header("Authorization").replace("Bearer ","");
        const decoded = await jwt.verify(token,process.env.JWT_SECRETE);
        const user = await User.findOne({_id:decoded._id,"tokens.token":token}); //.(dot) operator to find objs in array
        if(!user){
            next(new Error("Please login!"));
        }
        req.user = user;
        req.token =token;
        next();
    }catch(e){
        next(new Error(e));
    }
};


module.exports = auth;