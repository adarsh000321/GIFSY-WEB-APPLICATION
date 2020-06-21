const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const mail = require("../middleware/mail");

//login form
router.get("/user/login",async (req,res)=>{
  
    try{
        await auth(req,res,()=>{}); // if user arleady logged in
        if(!req.user)throw new Error();
        res.redirect("/");
    }catch(e){
        res.render("user/login",{page:"login",title:"Login"});
    } 

});

//signup form
router.get("/user/sign-up",async (req,res)=>{
    try{
        await auth(req,res,()=>{}); // if user arleady logged in
        if(!req.user)throw new Error();
        res.redirect("/");
    }catch(e){
        res.render("user/signup",{page:"signup",title:"Sign Up"});
    }
    
});


//POST sign-up
router.post("/user/sign-up",async (req,res)=>{
    try{
        await auth(req,res,()=>{}); // if user arleady logged in
        if(!req.user)throw new Error();
        res.redirect("/");
    }catch(e){
       try{
            const user = new User(req.body);
            user.active=false; // set to false
            const verify_token = User.getRandomToken();
            user.verificationToken = verify_token;
            await user.save();
            
            const url = `${req.get("origin")}/verify/${verify_token}`;
            //send email
            await mail.sendVerificationMail(user,url);

            req.flash("success","An email has been sent to your email address. Please verify you account!");
            res.status(201).redirect("/user/login");
       }catch(e){
            req.flash("err",e.message);
            res.redirect("/user/sign-up");
       }
    }
});


//POST login
router.post("/user/login",async (req,res)=>{
    try{
        await auth(req,res,()=>{}); // if user arleady logged in
        if(!req.user)throw new Error();
        res.redirect("/");
    }catch(e){
        try{
            const user = await User.findUser(req.body.username,req.body.password);
            if(!user)return res.redirect("/");
            if(!user.active)return res.redirect("/");
            const token = await user.genToken();
            res.cookie("auth-token",token,{maxAge:60*60*72*1000, signed:true});//1

            req.flash("success",`Welcome ${user.username}!`);
            res.redirect("/");
        }catch(e){
            req.flash("err",e.message);
            res.redirect("/user/login");
        }
        
    }
});

//logout
router.get("/user/logout",auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>token.token!==req.token);
        await req.user.save();

        req.flash("success","Logged out!");
        res.redirect("/");
    }catch(e){
        console.log(e);
        res.send();
    }
});


router.get("/about",async (req,res)=>{
    try{
        await auth(req,res,()=>{});
        if(!req.user)throw new Error();
        res.render("user/about",{page:"about",user:req.user,title:"About - GIFSY"});
    }catch {
        res.render("user/about",{page:"about",user:req.user,title:"About - GIFSY"});
    }

});

router.get("/verify/:id",async (req,res)=>{ // id=token
    const user = await User.findOne({verificationToken:req.params.id});
    if(!user){
        req.flash("err","Invalid/Expired Token");
        return res.redirect("/");
    }
    user.active = true;
    delete user.verificationToken;
    const token = await user.genToken();
    await user.save();
    res.cookie("auth-token",token,{maxAge:60*60*72*1000, signed:true});//1

    req.flash("success","Account verified successfully!");
    res.redirect("/");
});


//forgot and reset password

router.get("/user/forgot",async (req,res)=>{
    try{
        await auth(req,res,()=>{});
        if(!req.user)throw new Error();
        res.render("user/forgot",{title:"Reset Password - GIFSY",user:req.user});
    }catch(e){
        res.render("user/forgot",{title:"Reset Password - GIFSY",user:req.user});
    }
    
});

router.post("/user/forgot",async (req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email});
        if(!user)throw Error("Invalid Email Address");
        user.forgotPasswordToken = User.getRandomToken();
        await user.save();
        const url = `${req.get("origin")}/reset/${user.forgotPasswordToken}`;
        await mail.sendForgotPasswordMail(user,url);

        req.flash("success","Reset password link has been sent to your email address!");
        res.redirect("/user/forgot");
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/user/forgot");
    }
});

router.get("/reset/:id",async (req,res)=>{ //id=token
 
    try{
        await auth(req,res,()=>{});
        if(!req.user)throw new Error();
        res.redirect("/");// already logged in
    }catch(e){
        try{
            const user = await User.findOne({forgotPasswordToken:req.params.id});
            if(!user)throw new Error("Invalid Request");
            await user.save();
            res.render(`user/reset`,{title:"Reset Password",token:user.forgotPasswordToken});
        }catch(e){
            req.flash("err",e.message);
            res.redirect("/");
        }
    }

});

router.patch("/reset/:id",async(req,res)=>{ // id=token // update password here
    try{
        const user = await User.findOne({forgotPasswordToken:req.params.id});
        if(!user)throw new Error("Invalid Token");
        user.password = req.body.password;
        delete user.forgotPasswordToken;
        await user.save();

        req.flash("success","Password updated successfully!");
        res.redirect("/user/login");
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }
});

module.exports=router;




//1. signed = true makes sure that the cookie is not changed externally