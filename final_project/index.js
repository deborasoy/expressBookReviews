import express from "express"
import jwt from "jsonwebtoken"
import session from "express-session"
import regd_users from "./router/auth_users.js"
import genl_routes from "./router/general.js"
import axios from "axios"
import public_users from "./router/general.js"

const app = express();

app.use(express.json());
app.use("/", public_users);
app.use(session({secret:"123466", resave: true, saveUninitialized: true}))
app.use("/customer", regd_users);

app.use("/customer/auth", function auth(req,res,next){
 //Write the authenication mechanism here
 if(req.session) {
      const  token = req.session['accessToken'];
       jwt.verify(token, "access",(err)=>{
           if(!err){
               next()
           }
           else{
               return res.status(403).json({message: "User not authenticated"})
           }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
})
const PORT = 3000;
app.listen(PORT,()=> console.log("Server is running"));
