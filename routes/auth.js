const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');
const User = require('../models/user');

//Register Route
router.post('/register',[
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({min: 6})
],async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    
    const { name, email, password, role } = req.body;

    try{
        const userExists = await User.findOne({email});
        if(userExists) return res.status(400).json({message : 'User Already Exists'});

        const user = new User({name, email, password, role});
        await user.save();

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET,{expiresIn:'1d'});

        res.status(201).json({token, user:{name: user.name, email:user.email, role:user.role} });
    }catch (err){
        res.status(500).json({error: err.message});
    }
});

// Login Route
router.post('/login', [
    body('email').isEmail(),
    body('password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;