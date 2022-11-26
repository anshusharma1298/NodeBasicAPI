const Jwt = require('jsonwebtoken');
const jwtKey = process.env.SECRET_KEY || "BackendAPI"

/** Verify Token Middleware  */
module.exports = (req, resp, next) => {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];

        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).json({
                    message:"Add Authorization Token",
                    status:401
                })
            } else {
                next();
            }
        })
    }
    else {
        resp.status(403).json({
            message:"Authentication Failed!",
            stauts:403,

        });
    }

}