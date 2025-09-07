// , images hotels, and restaurants.

const mongoose = require('mongoose')

const tripSchema=mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    budget:{
        type: String
    }, location:{
        type: String
    }, 
    vehicle:{
        type: String
    },
    duration:{
        type:String
    },
    destinationImage:{
        public_id: {
            type: String,
            required:true
        },
        url:{
            type:String,
            required:true     
    }   
       
    },
    status: {
        type: String,
        enum: ["pending", "active", "cancelled", "completed"],
        default: "pending"  
    }

})

const tripModel =mongoose.model('trip',tripSchema)
module.exports=tripModel;