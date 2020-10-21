const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const baseUserId = new mongoose.Types.ObjectId()
const baseUserData = {
    _id: baseUserId,
    name: 'test_user',
    email: 'test_user@gmail.com',
    password: 'testing',
    tokens: [{
        token: jwt.sign({_id: baseUserId}, process.env.JWT_SECRET)
    }]
}

const baseTaskData = {
    _id: new mongoose.Types.ObjectId(),
    description: 'testing task',
    user: baseUserId
}

const setUp = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(baseUserData).save()
    await new Task(baseTaskData).save()
}

module.exports = {
    setUp,
    baseUserData,
    baseUserId,
    baseTaskData
}