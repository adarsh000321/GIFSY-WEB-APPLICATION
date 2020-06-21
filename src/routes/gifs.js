const express = require("express");
const router = new express.Router();
const multer = require("multer");
const Gif = require("../models/gif");
const fs =  require("fs");
const path = require("path");
const gifDir = path.join(__dirname,"../../gif"); 
const auth = require("../middleware/auth");
const fetch = require("../data/fetch"); // tenor gif fetching
const cors = require("cors");
const User = require("../models/user");
const Map = require("../models/gifmap.js"); // maps name and buffer of gif


//config file upload
// const storage = multer.diskStorage({
//     filename:function(req,file,cb){
//         req.fileName = file.originalname.replace(".gif","-"+Date.now()+".gif");
//         cb(null,req.fileName);
//     },
//     destination(req,file,cb){
//         cb(null,"gif");
//     }
// });

const storage = multer.memoryStorage();
const upload = multer({
    // dest:"gif",  // (use dest or storage)
    storage:storage, // setting file name and storage 
    limits:{
        fileSize:1024*1024*2.5 // 2.5mb
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.gif$/)){
            return cb(new Error("GIF file must have .gif extension!"),undefined);
        }
        cb(undefined,true);
    },
});

//home page

router.get("/",async (req,res)=>{
    try{
        await auth(req,res,()=>{});
        res.render("gif/home",{page:"home",title:"Home",user:req.user}); //type=err/success , msg=error or success msg
    }catch(e){
        res.render("gif/home",{page:"home",title:"Home",user:req.user});
    }
});


let gifStoredFromSession; // stores last visited gif details
router.post("/show-tenor-gif",auth,async (req,res)=>{
    try{
        gifStoredFromSession = req.body;
        res.redirect("/show-tenor-gif"); //default redirect is get
    }catch(e){
        // req.flash("err",e.message);
        res.redirect("/");
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});


//
router.get("/show-tenor-gif",auth,async (req,res)=>{
    if(!gifStoredFromSession) return res.redirect("/");
    try{
        res.render("gif/show-tenor",{gif:gifStoredFromSession,title:"Show GIF",user:req.user});
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});


//get more gif
// query : next, limit
router.get("/get-more",cors(),async (req,res)=>{
    try{
        const {next,limit=2,q} = req.query;
        const data = await fetch.get(limit,next,q);
        res.send(data);
    }catch(e){
        // req.flash("err",e.message);
        res.redirect("/");
    }
});

//get random gifs
// query : search,limit
router.get("/random",cors(),auth,async (req,res)=>{
    try{
        const {limit=6,q} = req.query;
        const data = await fetch.random(q,limit);
        res.send(data);
    }catch(e){
        // req.flash("err",e.message);
        res.redirect("/");
    }
});

//seach gif
//query : q,server
router.get("/search",auth,async (req,res)=>{
    try{
        const search = req.query.q;
        if(!search)return res.redirect("/");
        res.render("gif/search",{title:search,server:req.query.server,user:req.user});
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

//q=skip,limit,q
router.get("/searchdb",auth,async (req,res)=>{
    try{
        let {skip=0,limit=10,search} = req.query;
        skip=Number(skip);
        limit=Number(limit);
        const gifs = await Gif.find({ // search in mongodg
            $or:[
                {keyWords:{$regex: new RegExp(search), $options: 'i'}},
                {title:{$regex: new RegExp(search), $options: 'i'}}
            ]}).skip(skip).limit(limit);
        return res.send(gifs);
    }catch(e){
        res.send();
    }
});




//create page
router.get("/gif-upload",auth,async (req,res)=>{
    res.render("gif/upload",{page:"upload",title:"Upload GIF",user:req.user});
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

router.post("/gif-upload",auth,async (req,res)=>{
    try{
        upload.single("gif")(req,res,async (err)=>{
            if(err){
                req.flash("err",err.message);
                res.redirect("/gif-upload");
            }else{
                const file = req.file;
                const name = file.originalname.replace(".gif","-"+Date.now()+".gif");

                //map it
                const map = new Map({name:name,buffer:file.buffer});
                await map.save();
                const gif = new Gif({...req.body,name:name,owner:req.user._id});
                // gif.name = req.fileName;
                // gif.owner = req.user._id;
                await gif.save();
                res.redirect("/show/gif/"+gif.name);
            }
        });

    }catch(e){
        req.flash("err",e.message);
        res.redirect("/gif-upload");
    }
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

//show gif
router.get("/show/gif/:id",auth,async (req,res)=>{ //id=name of gif
    try{
        const gif =await Gif.findOne({name:req.params.id});
        if(!gif){
            throw new Error("No such .gif file exist");
        }
        const user = await User.findById(gif.owner);
        res.render("gif/show",{owner:user,gif,title:gif.title,user:req.user});
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

//show all gifs created by this user
//query=skip,limit
router.get("/gif-json/:id",auth,async (req,res)=>{ // id=username
    try{
        const user = await User.findOne({username:req.params.id});
        if(!user){
            throw new Error("User does not exist!");
        }
        let {limit=6,skip=0}=req.query;
        limit=Number(limit);
        skip=Number(skip);
        await user.populate({
            path:"gifs",
            options:{
                limit:limit,
                skip:skip,
                sort:{
                    createdAt:-1 // most recent (desc order)
                }
            }
        }).execPopulate();
        res.send(user.gifs);
    }catch(e){
        console.log(e);
        res.send();
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

router.get("/gif/show-all/:id/",auth,(req,res)=>{ //id=username
    res.redirect(`/gif/show-all/${req.params.id}/1`);
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

router.get("/gif/show-all/:id/:id2" ,auth,async (req,res)=>{ //id=username,id2=page no.
    try{
        res.render("gif/showall",{username:req.params.id,page:req.params.id2,title:"Show GIFs",user:req.user});
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

// url for gif
router.get("/gif/:id",auth,async (req,res)=>{ //id=name of gif
    try{
        let gifFile = await Map.findOne({name:req.params.id});
        gifFile = gifFile.buffer;
        if(!gifFile){
            throw new Error("No such .gif file exist");
        }
        res.setHeader("Content-Type","image/gif");
        res.send(gifFile);
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});



// router.get("/gifs",auth,async (req,res)=>{
//     try{
//         const gifs = await Gif.find();
//         res.send(gifs);
//     }catch(e){
//         res.status(500).send();
//     }
// });

//update name and keyword of gif
router.patch("/gif/:id",auth,async (req,res)=>{
    try{
        const gif = await Gif.findOne({name:req.params.id,owner:req.user._id});
        if(!gif)throw new Error("No Such GIF found!");
        const title = req.body.title,keywords = req.body.keywords;
        if(title && title.length>0)gif.title = title;
        gif.keyWords = keywords;
        await gif.save();
        res.redirect("/show/gif/"+req.params.id);
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }

},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});

router.delete("/gif/:id",auth,async (req,res)=>{
    try{
        const gif = await Gif.findOne({name:req.params.id,owner:req.user._id});
        if(!gif)throw new Error("No such GIF found!");
        await gif.remove();
        const map = await Map.findOne({name:req.params.id});
        await map.remove();
        res.redirect('/');
    }catch(e){
        req.flash("err",e.message);
        res.redirect("/");
    }
},(err,req,res,next)=>{
    if(err){
        req.flash("err",err.message);
        res.redirect("/");
    }
});



module.exports = router;