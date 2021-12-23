const request = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')

const {useroneid,userone,setupDB,usertwo,usertwoid,taskone,tasktwo,taskthree}= require('./fixtures/db')

beforeEach(setupDB)

test('Should create a task for user',async()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send({
            description:"Test run"
        })
        .expect(200)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)

})

test('Fetch user task',async()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(201)
    expect(response.body.length).toEqual(2)
    console.log(response.body)
})

test('Should not delete tasks of other user ',async()=>{
    const response = await request(app)
        .delete(`/tasks/${taskone._id}`)
        .set('Authorization', `Bearer ${usertwo.tokens[0].token}`)
        .expect(404)
    const task = await Task.findById(taskone._id)
    expect(task).not.toBeNull()
})
test('Should not create task with invalid description/completed', async()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send({
            description:123456,
            completed:'blah'
        })
        .expect(400)
})
test('Fetch completed task only',async()=>{
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(201)
    expect(response.body.length).toEqual(0)
})

test('Sort tas by createdAt',async()=>{
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(201)
})
