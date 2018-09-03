const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization; //bug
        
        console.log(token); //bug
        var realtoken = token.split(' ')[1];
        console.log(realtoken); //bug
        const decoded = jwt.verify(token,process.env.JWT_KEY);
        res.userDate = decoded;
        next(); // if not erro continuo
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'

        });
    }
};