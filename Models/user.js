const mongoose = require('mongoose')

const UserSchema=mongoose.Schema({
    name:{
        type: String
    }, email:{
        type: String
    }, 
    password:{
        type: String
    },
    role:{
        type:String,
        default:"user"
       
    }

})

const UserModel =mongoose.model('user',UserSchema)
module.exports= UserModel ;