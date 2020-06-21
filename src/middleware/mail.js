const nodemailer = require("nodemailer");


async function sendVerificationMail(user,url){
    try{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
            user: process.env.EMAIL, // generated ethereal user
            pass: process.env.PASSWORD, // generated ethereal password
            },
            tls:{
                rejectUnauthorized:false
            }

        });
        
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: `"GIFSY" <${process.env.EMAIL}>`, // sender address
        to: user.email, // list of receivers
        subject: "[GIFSY] Please confirm your email address", // Subject line
        // text: "Hello world?", // plain text body
        html: `<h1>Hey ${user.username}!</h1>
               <p>Thanks for joining GIFSY. To finish registration, please click the link below to verify your account.</p>
               <a href = "${url}">Click Here To Verify Your Account</a>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
    }catch(e){
        console.log(e);
    }
}

async function sendForgotPasswordMail(user,url){
    try{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
            user: process.env.EMAIL, // generated ethereal user
            pass: process.env.PASSWORD, // generated ethereal password
            },
            tls:{
                rejectUnauthorized:false
            }

        });
        
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: `"GIFSY" <${process.env.EMAIL}>`, // sender address
        to: user.email, // list of receivers
        subject: "[GIFSY] Reset Password", // Subject line
        // text: "Hello world?", // plain text body
        html: `<h1>Hey ${user.username}!</h1>
               <p>To reset password, please click the link below to verify your account.</p>
               <a href = "${url}">Click Here To Reset your Password</a>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
    }catch(e){
        console.log(e);
    }
}

module.exports = {
    sendVerificationMail,
    sendForgotPasswordMail
};

