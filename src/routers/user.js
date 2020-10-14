const express = require('express')
const { update } = require('../models/user')
const User = require('../models/user')
const router = new express.Router()
const userEndpoint = '/users'
const auth = require('../middleware/auth')

/**
 * Signup route for creating a user
 */
router.post(userEndpoint, async (req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

/**
 * Returns user profile
 */
router.get(userEndpoint+'/profile', auth ,async (req, res) => {
    res.send(req.user)
})

/**
 * Updates currently logged in user
 */
router.patch(userEndpoint+'/update', auth, async (req,res) => {
    try {
        const user = req.user
        const updates = Object.keys(req.body)
        updates.forEach((update) =>  user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

/**
 * Deletes currently logged in user
 */
router.delete(userEndpoint+'/delete', auth, async (req,res) => {
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e) {
        res.status(500).send()
    }
})

/**
 * Endpoint for logging in and return user object with jwt token
 */
router.post(userEndpoint + '/login', async(req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

/**
 * Endpoint for logging out a user
 */
router.post(userEndpoint + '/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

/**
 * Endpoint for logging out all users
 */
router.post(userEndpoint + '/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router