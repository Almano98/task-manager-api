const express = require('express')
const User = require('../models/user')
const userEndpoint = '/users'
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('File type not supported. Suppored File types: .jpg, .jpeg, .png'))
        }
        cb(undefined, true)
    }
})
/**
 * Signup route for creating a user
 */
router.post(userEndpoint, async (req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
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
 * Allows user to upload a profile picture
 */
router.post(userEndpoint+'/profile/avatar',auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

/**
 * Allows user to delete their profile picture
 */
router.delete(userEndpoint+'/profile/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

/**
 * Allows user to get their profile picture
 */
router.get(userEndpoint+'/profile/avatar', auth, async (req, res) => {
    if (!req.user.avatar) {
        res.status(400).send({error: 'You do not have a avatar linked to your profile picture'})
    }

    res.set('Content-Type', 'image/png')
    res.send(req.user.avatar)
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
        sendCancellationEmail(req.user.email, req.user.name)
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