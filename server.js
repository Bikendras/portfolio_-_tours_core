var express=require("express");
var cors = require('cors')
var app= express();
app.use(cors())
var multer= require("multer");
var upload= multer();
const nodemailer=require("nodemailer");
const bcrypt = require("bcrypt");

var {MongoClient}=require("mongodb");
async function dbconnect(collection){ 
    var url= 'mongodb://127.0.0.1:27017'; 
    var client=new MongoClient(url);
    var connect= client.db("Projects");
    if(collection=='portFolio'){
        var collection= connect.collection("portFolio");
        return collection;
    }
    else{
        var collection= connect.collection("tours");
        return collection;
    }
}

app.get("/", function (req, res) {
    var email = 'bikendra7848@gmail.com';
    var name = "bikendra_singh";
    res.send("hello all");
});

// Navbar Registration
app.post("/registerNav",upload.single(),async function(req,res){
    const {name,email,password,confirmPassword,mobile} = req.body;
    if(name&&email&&password&&confirmPassword&&mobile){
        var user = await dbconnect("navbar");
        const hashpassword = await bcrypt.hash(password,10);
        const finduser = await user.findOne({email: email});
        if(finduser){
            res.send({message: "user Already registered", status: 1});
        }else{
            const insertuser = await user.insertOne({
                name: name,
                email: email,
                password: hashpassword,
                confirmPassword: confirmPassword,
                mobile: mobile,
            })
            if(insertuser){
                res.send({message: "Registration Successfully", status: 1})
            }else{
                res.send({message: "Registration Failure", status: 0});
            }
        }
    }else{
        res.send({message: "Please enter All fields", status: 0});
    }
})


// Navbar Login...
app.post('/login',upload.single(),async function(req,res){
    const {email,password} = req.body;
    if (email && password){
        if(email){
            const user = await dbconnect("navb");
            const findemail = await user.findOne({email: email});
            if(findemail){
                if(findemail.email == email){
                    bcrypt.compare(password,findemail.password,async function(error,result){
                        if(result){
                            const transport= nodemailer.createTransport({
                                host: "smtp.gmail.com",
                                port: 465,
                                auth:{
                                    user: "myselfbikendra7848@gmail.com",
                                    pass: "6677767675768"
                                }
                            });
                            const info = await transport.sendMail({
                                from: "myselfbikendra7848@gmail.com",
                                to: "bikendra7848@gmail.com",
                                subject: "Login Confirmation",
                                text: "Welcome to product page",
                                html: "Welcome to product page send user infomation",
                            })
                            res.send({message: "Login successful", status:1, data: "findemail"});
                        }
                    })
                }else{
                    res.send({message: "Login failed", status: 0});
                }
            }else{
                res.send({message: "email not found", status: 0});
            }
        }else{
            res.send({message: "Please enter email", status: 0});
        }
    }else{
        res.send({message: "Please enter your email && password", status: 0});
    }
})


// portFolio..
app.post('/register',upload.single(),async function(req,res){
    const {name,email,subject,message}=req.body;
    if(name&&email&&subject&&message){
        var user=await dbconnect("portFolio");
        const finduser= await user.findOne({email:email})
        if(finduser){
            res.send({message: "user already Registered", status: 1})
        }else{
            var inserdata= await user.insertOne({
                name: name,
                email: email,
                subject: subject,
                message: message,
            })
            if(inserdata){
                const transport = nodemailer.createTransport({
                    host: "smtp.gmail.com", // provider or host name
                    port: 465,
                    auth: {
                      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                      user: "myselfbikendra@gmail.com", // sender email address
                      pass: "voxy cdyv aatl hkjb" // original gmail ke 2 way verification password hai..
                    }
                  });
                  const info = await transport.sendMail({
                    from: "myselfbikendra@gmail.com", // sender email address
                    to: "bikendra7848@gmail.com", // list of receivers Reac
                    subject: "confirmation ✔", // Subject line
                    text: `Congratulation dear user, myselfbikendra@gmail.com your Registraction successfully`, // plain text body
                    html: `<b>Congratulation dear user, "myselfbikendra@gmail.com" your Registraction successfully </b>`, // html body send to customer message.
                  });
                res.send({message: "Registration Successful", status: 1, data: inserdata});
            }else{
                res.send({message: "Registration failed", status: 0});
            }
        }
    }else{
        res.send({message: "Please enter your data"});
    }
})

// Tours Websites...
app.post('/registers',upload.single(),async function(req,res){
    const {name,email,subject,message}=req.body;
    if(name&&email&&subject&&message){
        var user=await dbconnect("tours");
        const userdata= await user.findOne({email:email})
        if(userdata){
            res.send({message: "user already Registered", status: 1})
        }else{
            var inserdata= await user.insertOne({
                name: name,
                email: email,
                subject: subject,
                message: message,
            })
            if(inserdata){
                const transport = nodemailer.createTransport({
                    host: "smtp.gmail.com", // provider or host name
                    port: 465,
                    auth: {
                      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                      user: "myselfbikendra@gmail.com", // sender email address
                      pass: "voxy cdyv aatl hkjb" // original gmail ke 2 way verification password hai..
                    }
                  });
                  const info = await transport.sendMail({
                    from: "myselfbikendra@gmail.com", // sender email address
                    to: "bikendra7848@gmail.com", // list of receivers Reac
                    subject: "Tour booked confirmation ✔", // Subject line
                    text: `Congratulation dear user, myselfbikendra@gmail.com your Tour booked successfully`, // plain text body
                    html: `<b>Congratulation dear user, "myselfbikendra@gmail.com" your Tour booked successfully </b>`, // html body send to customer message.
                  });
                res.send({message: "Registration Successful", status: 1, data: inserdata});
            }else{
                res.send({message: "Registration failed", status: 0});
            }
        }
    }else{
        res.send({message: "Please enter your data"});
    }
})

app.listen(8000, function () {
    console.log("server listening on http://localhost:8000/");
});



