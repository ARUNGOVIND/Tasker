const jwt= require('jsonwebtoken')
const User= require('../models/user')

const Auth = async (req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.jwt_secret)
        const user = await User.findOne({_id:decoded._id, "tokens.token":token})

        if (!user) {
            throw new error()
        }
        req.token = token
        req.user =user
        next()
    } catch (e) {
        res.status(401).send({error:"Please Authenticate"})
    }
}

module.exports =Auth