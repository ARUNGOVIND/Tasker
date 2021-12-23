const  jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Task = require('../../src/models/task')
const User = require('../../src/models/user')

const useroneid= new mongoose.Types.ObjectId()
const userone ={
    _id:useroneid,
    name:'mike',
    email:'fenici6268@shirulo.com',
    password:'12345678',
    tokens:[{
        token: jwt.sign({_id:useroneid}, process.env.jwt_secret)
    }]
}
const usertwoid= new mongoose.Types.ObjectId()
const usertwo ={
    _id:usertwoid,
    name:'jess',
    email:'jess6268@shirulo.com',
    password:'12345678',
    tokens:[{
        token: jwt.sign({_id:usertwoid}, process.env.jwt_secret)
    }]
}

const taskone = {
    _id : new mongoose.Types.ObjectId(),
    description: "Task One",
    completed: false,
    owner: useroneid
} 

const tasktwo = {
    _id : new mongoose.Types.ObjectId(),
    description: "Task Two",
    completed: false,
    owner: useroneid
} 

const taskthree = {
    _id : new mongoose.Types.ObjectId(),
    description: "Task Three",
    completed: true,
    owner: usertwoid
} 

const setupDB = async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userone).save()
    await new User(usertwo).save()
    await new Task(taskone).save()
    await new Task(tasktwo).save()
    await new Task(taskthree).save()
}

module.exports = {
    useroneid,
    userone,
    setupDB,
    usertwoid,
    usertwo,
    taskone,
    tasktwo,
    taskthree
}