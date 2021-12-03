const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/Auth')
const {sendWelcomemail} = require('../mails/account')
const {sendCancelmail}= require('../mails/account')
const router = new express.Router()

router.get('/users/me',auth ,async (req,res)=>{
    res.send(req.user)
})


router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =["name","email","password","age"]
    const isValid = updates.every((update)=>allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({error:"Invalid Updates!"})
    }
    try {
        updates.forEach((update) =>req.user[update]= req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users',async (req,res)=>{
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomemail(user.email,user.name)
        res.status(201).send({user,token})
        
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth ,async (req,res)=>{
    try {
        await req.user.remove()
        sendCancelmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)   
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter (req,file,cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Upload image file'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height:250, width:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("Successfully added profile picture")
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    
    req.user.avatar = undefined
    await req.user.save()
    res.send("Successfully deleted profile picture")
})

router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user= await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})



module.exports = router