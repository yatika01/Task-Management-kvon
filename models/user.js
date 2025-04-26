const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    }
},{timestamps:true});

//hashing password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
//comparing when logging in
userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
};



module.exports = mongoose.model('user', userSchema);