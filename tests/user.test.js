const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {setUp, baseUserId, baseUserData} = require('./fixtures/db')

beforeEach(setUp)

test('Test Signup user succesfully', async () => {
    const response = await request(app).post('/users').send({
        name: 'Test_User',
        email: "test@gmail.com",
        password: "testing"
    }).expect(201)
    
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Test_User',
            email: 'test@gmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('testing')
})

test('Test User login succesful', async () => {
    const response = await request(app).post('/users/login').send({
        email: baseUserData.email,
        password: baseUserData.password
    }).expect(200)

    const user = await User.findById(baseUserId)
    expect(response.body).toMatchObject({
        token: user.tokens[1].token
    })
})

test('Test User login failure', async () => {
    await request(app).post('/users/login').send({
        email: baseUserData.email,
        password: 'bad_password'
    }).expect(400)
})

test('Test return user profile succesfully', async () => {
    await request(app)
        .get('/users/profile')
        .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Test return user profile unauthenticated failure', async () => {
    await request(app)
        .get('/users/profile')
        .send()
        .expect(401)
})

test('Test delete user account succesfully', async () => {
    await request(app)
        .delete('/users/delete')
        .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(baseUserId)
    expect(user).toBeNull()
})

test('Test delete user account unauthenticated failure', async () => {
    await request(app)
    .delete('/users/delete')
    .send()
    .expect(401)
})

test('Test upload avatar succesfully', async () => {
    await request(app)
        .post('/users/profile/avatar')
        .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(baseUserId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Test update user succesfully', async () => {
    await request(app)
        .patch('/users/update')
        .set('Authorization', `Bearer ${baseUserData.tokens[0].token}`)
        .send({
            name: 'Updated Name'
        })
        .expect(200)
    const user = await User.findById(baseUserId)
    expect(user.name).toBe('Updated Name')
})