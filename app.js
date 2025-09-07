// server creation using express 
const express =require('express')
const app=express()
const cors =require('cors')
require("dotenv").config();

// requiring the router of web 
const web =require('./routes/web')

const cookieParser = require('cookie-parser');

// Middleware to parse JSON and cookies
app.use(cookieParser());
// DB connection 
const connectDB= require('./DB/connectDB')
const fileUpload = require('express-fileupload')
connectDB()
app.use(express.json())

//Image upload
app.use(fileUpload({
    useTempFiles:true,
    // tempFileDir:'/tmp/'
}));

//route the urls from frontend
app.use(
    cors({
        origin:"https://travelbuckey.netlify.app",//your frontend domain
        credentials: true,//allow creadentials (cookie)
    })
)

//Ai use openai



//to route the all requests of the path to web 
app.use('/api',web)
app.listen(process.env.PORT, console.log('server started at the  PORT ',process.env.PORT)) 