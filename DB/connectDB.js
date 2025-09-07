const mongoose = require('mongoose')

const connectDB = async () => {
    return mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("connection established successfully")
        })
        .catch((error) => {
            console.log(error)
        });

}

module.exports = connectDB;