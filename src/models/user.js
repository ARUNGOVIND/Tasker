const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = mongoose.Schema({
    name: {
    type: String,
    required : true,
    trim:true
},
email:{
    type : String,
    required : true,
    unique:true,
    trim : true,
    lowercase : true,
    validate(value){
        if (!validator.isEmail(value)) {
            throw new Error("Email is invalid")               
        }
    }
},
age: {
    type: Number,
    required: true,
    default:19,
    validate(value){
        if (value<18) {
            throw new Error("User must be an adult")
        }
    }

},
password:{
    type: String,
    required:true,
    minlength:7,
    trim:true,
    validate(value){
        if (value.includes('password')) {
            throw new Error("Password cannot contain 'password'")
        }
    }
},
avatar:{
    type:Buffer
}
,
tokens:[{
    token:{
        type:String,
        required: true
    }
}]
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner' 
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.jwt_secret)
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials= async (email,password)=>{
    const user = await User.findOne({email})
    if (!user) {
        return null
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) {
        return null
    }
    return user
}

userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password =  await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User