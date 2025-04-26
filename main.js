const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/user');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');

const app = express();
app.use(express.json());  // to parse JSON in request body
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const port =  process.env.PORT || 5000;
app.get('/User',async function(req,res){
    try{
        const newUser= await User.find();
        // const result = await newUser.save();
        res.status(200).json(newUser);
        
    }catch(err){
        console.log('error');
        res.status(500).json({error:'server error'});
    }
});
//mongodb connection
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('mongodb connected'))
.catch(err => console.log('mongo error',err));

app.listen(port, ()=>{
    console.log(`server running on ${port}`);
});


//for testing
// app.get('/test-user', async(req , res)=> {
//     try{
//         const user =  new User({
//             name : 'Yatika',
//             email: 'yatika@example.com',
//             password: '123456',
//             role: 'admin'
//         });
//         //save to DB
//         await user.save();
//         const isMatch = await user.matchPassword('123456');

//         res.json({
//             message: 'User created successfully',
//             user: {
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             },
//             passwordMatched: isMatch
//         });
//     }catch(err){
//         res.status(500).json({error : err.message});
//     }
// });
