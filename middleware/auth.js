const jwt = require('jsonwebtoken');

const protect = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'unauthorized: no token provided'});
    }
    const token = authHeader.split(' ')[1];

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    }catch(err){
        res.status(401).json({error:"Invalid token"});
    }
}

//role checking
const authorizedRoles = (...roles)=> {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({error: 'Access Denied'});
        }
        next();
    };
};

module.exports = {protect, authorizedRoles};