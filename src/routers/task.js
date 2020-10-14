const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()
const taskEndpoint = '/tasks'

/**
 * Creates new task
 */
router.post(taskEndpoint, auth,async (req,res) => {
    const task = new Task({
        ...req.body,
        user: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }
})

/**
 * Gets all tasks
 */
router.get(taskEndpoint, auth, async (req, res) => {
    const match = {}
    const options = {
        limit:10,
        skip: parseInt(req.query.skip)
    }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sort){
        const sort = {}
        const parts = req.query.sort.split(':')
        sort[[parts[0]]] = parts[1] === 'desc' ? -1 : 1
        options.sort = sort
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

/**
 * Gets task by id
 */
router.get(taskEndpoint+'/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne( {_id, user: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

/**
 * Updates specific task
 */
router.patch(taskEndpoint+'/:id',auth, async (req,res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, user:req.user})

        if(!task){
            return res.status(404).send()
        }

        const updates = Object.keys(req.body)
        updates.forEach((update) =>  task[update] = req.body[update])
        await task.save()
        
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

/**
 * Removes a task
 */
router.delete(taskEndpoint+'/:id', auth, async (req,res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOneAndDelete({_id, user:req.user})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e) {
        res.status(500).send()
    }
})

module.exports = router