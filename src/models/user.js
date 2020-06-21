const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:function(email){
            if(!validator.isEmail(email)){
                throw new Error("Please enter a valid email address!");
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        trim:true
    },
    active:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String
    },
    forgotPasswordToken:{
        type:String
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

userSchema.virtual("gifs",{
    ref:"Gif",
    localField:"_id",
    foreignField:"owner"
});

userSchema.pre("save",async function(next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,8);
    }
    next();
});


userSchema.statics.findUser = async (username,password)=>{
    if(!username || !password){
        throw new Error("Username/Password is empty!");
    }
    const user =await User.findOne({$or:[{email:username},{username:username}]});
    if(!user){
        throw new Error("Invalid password/username");
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error("Invalid password/username");
    }
    return user;
};

userSchema.methods.genToken = async function(){
    //user _id will be hashed and gets stored in token
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRETE);
    this.tokens.push({token});
    await this.save();
    return token;
};

userSchema.statics.getRandomToken = ()=>{
    const token = jwt.sign({rand:"RandomToken"},process.env.JWT_SECRETE);
    return token; 
};

userSchema.methods.toJSON =  function(){
    const userCopy = this.toObject();

    delete userCopy.password;
    delete userCopy.tokens;
    delete userCopy.avatar;
    
    return userCopy;
};

const User = mongoose.model("User",userSchema);

module.exports=User;