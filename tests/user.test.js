const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {useroneid,userone,setupDB}= require('./fixtures/db')

beforeEach(setupDB)

test('Should signup new user',async()=>{
    const response= await request(app).post('/users').send({
        name:'Arun',
        email:'gnarun1998@gmail.com',
        password:'12345678'
    }).expect(201)

    //Assert that DB changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    
})

test('Should login existing user',async()=>{
    const response= await request(app).post('/users/login').send({
        email:userone.email,
        password:userone.password
    }).expect(200)
    const user = await User.findById(userone._id)
    expect(response.body.token).toBe(user.tokens[1].token)

})

test('Should not login non-existing user',async()=>{
    await request(app).post('/users/login').send({
        email:'arung@gmail.com',
        password:'userone.password'
    }).expect(400)
})

test('Get profile', async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for Unauthorized',async()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete existing user', async()=>{
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(200)
    const user= await User.findById(userone._id)
    expect(user).toBeNull()
})
test('Should not delete non-existing user', async()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('avatar upload',async()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(useroneid)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user', async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send({
            name: "Myke"
        })
        .expect(200)
    const user =  await User.findById(useroneid)
    expect(user.name).toEqual('Myke')
})

test('Should not update invalid user fields',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userone.tokens[0].token}`)
        .send({
            location: 'India'
        })
        .expect(400)
})