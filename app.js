import 'dotenv/config'
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import express  from "express";
import bodyParser from "body-parser";
import ejs from "ejs";

const port = 3000;
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/usersDB");

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:   true}))
app.use(express.static("public"));

const userSchema = new mongoose.Schema ({
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req,res)=>{
    res.render("home");
})


app.route("/login")
    .get((req,res)=>{
        res.render("login");
    })
    .post(async(req,res)=>{
        try{
            const user = await User.findOne({email: req.body.username})
            if(user){
                if(user.password === req.body.password){
                    res.render("secrets");
                }else{
                    res.render("login", {alert: "Password invalid"})
                }
            }else{
                res.render("login", {userAlert: "User does not exits"})
            }
        }catch(err){
            console.log(err);
        }

        
    })


app.route("/register")
    .get((req,res)=>{
        res.render("register");
    })
    .post( async(req,res)=>{

        try{
            const userName = await User.findOne({email: req.body.username})
            if(userName){
                res.render("register",{alert: "User already exits, Go to login page"})
            }else{
                const user = new User({
                    email: req.body.username,
                    password: req.body.password
                })
        
                try{
                   await user.save();
                   res.render("secrets");
                }catch(err){
                    console.log(err);
                }   
            }
        }catch(err){
            console.log(err);
        }
            
        
    })



app.listen(port, ()=>{
    console.log(`Your server is live on port ${port}`)
})