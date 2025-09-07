const jwt=require('jsonwebtoken')
const UserModel = require('../Models/user')


const checkAuth= async (req,res,next)=>{
    // console.log("middleware Funcstion")

    const token=req.cookies.token
    if(!token) {return res.status(401).json({message:"Unauthorized"})}
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET )
        console.log(decoded);
        //fetch Full user 
        const user = await UserModel.findById(decoded.ID)
        if(!user){return res.status(401).json({message:"User Not Found"})}
        req.user=user
        next();

    } catch (error) {
        console.log("Error in the auththentication Check !")
    }
}

module.exports=checkAuth