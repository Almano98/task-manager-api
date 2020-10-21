const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {setUp, baseUserId, baseUserData, baseTaskData} = require('./fixtures/db')

beforeEach(setUp)
test('Test create task succesfully', async () => {
    const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
            .send({
                description: 'Test task #1'
            }).expect(201)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Test return users tasks succesfully', async () => {
    const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
            .send()
            .expect(200)
    expect(response.body[0]._id).toBe(baseTaskData._id.toString())
})

test('Test user deletes task succesfully', async () => {
    await request(app)
            .delete('/tasks/' + baseTaskData._id)
            .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
            .send()
            .expect(200)
    const task = await Task.findById(baseTaskData._id)
    expect(task).toBeNull()
})