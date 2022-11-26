const User = require('../models/User');
const bcrypt = require('bcrypt')
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const jwtKey = process.env.SECRET_KEY;
require('../database/dbConfig');
/**Signup API Or Register API */
exports.register = async (req, resp) => {
    try {
        const schema = {
            user: Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().trim(true).required(),
                mobile: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
                password: Joi.string().min(6).max(8).required()
            })
        }
        const validation = schema.user.validate(req.body);
        if (validation.error) {
            resp.status(400).json({
                message: validation.error.details,
                status: 400
            });
        }
        else {
            const checkUser = await User.findOne({ email: req.body.email });
            if (checkUser) {
                resp.status(400).json({
                    result: "Email is already Exists!",
                    status: "400",
                });
            }
            else {
                let user = new User(req.body)
                let result = await user.save();
                //   this code is used to hide the password
                result = result.toObject();
                delete result.password
                if (result) {
                    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                        if (err) {
                            resp.status(400).json({ result: "No User Found!" })
                        }
                        resp.status(200).json({ result, token: token })
                    })
                    // resp.send(user);
                }
                else {
                    resp.status(400).json({ result: "No User Found" })
                }
            }
        }
    } catch (err) {
        resp.status(500).json({
            message: err,
            status: 500
        });
    }
}
/**Login API or Signin API */
exports.login = async (req, resp) => {
    try {
        const schema = {
            user: Joi.object({
                email: Joi.string().email().trim(true).required(),
                password: Joi.string().required()
            })
        }
        const validation = schema.user.validate(req.body);
        if (validation.error) {
            resp.status(400).json({
                message: validation.error.details,
                status: 400
            });
        }
        else {
            let user = await User.findOne({
                email: req.body.email,
            });
            result = user.toObject();
            delete result.password
            if (user) {
                const passwordMatch = await bcrypt.compare(req.body.password, user.password);
                if (passwordMatch) {
                    Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                        if (err) {
                            resp.send({ result: 'No User Found', status: 'error' });
                        }
                        resp.send({ result, token: token })
                    })
                }
                else {
                    resp.status(401).json({
                        message: "Email and Password both are required",
                        status: 401
                    });
                }
            }
            else {
                resp.status(422).json({
                    message: "Unknown Email and password!",
                    status: 422
                });
            }
        }
    }
    catch (err) {
        resp.status(500).json({
            message: err,
            status: 500
        });
    }
}
/** Get all users */
exports.getUsers = async (req, resp) => {
    try {
        let result = await User.find().select('-password');;
        if (result.length > 0) {
            resp.status(200).json({
                "message": "All Registered Users",
                "Data": result
            });
        }
        else {
            resp.status(400).json({ result: "No User Found!" })
        }
    }
    catch (err) {
        resp.status(500).json({
            message: err,
            status: 500
        });
    }
}
/**get single user */
exports.getUser = async (req, resp) => {
    try {
        let user = await User.findOne({ _id: req.params.id }).select('-password');
        if (user) {
            resp.status(200).json({
                "message": "Signle  User",
                "Data": user
            });
        }
        else {
            resp.status(400).json({ result: "No User Found!" })
        }
    }
    catch (err) {
        resp.status(500).json({
            message: err,
            status: 500
        });
    }
}
/**Update User Profile */
exports.updateUser = async (req, resp) => {
    try {
        let result = await User.updateOne(
            { _id: req.params.id },
            {
                $set: req.body
            }
        );
        if (result) {
            resp.status(200).json({
                'user': result,
                'message': 'Profile Updated successfully!',
                'status': 200
            })
        }
        else {
            resp.status(400).json({ result: "No User Found!" })
        }
    }
    catch (err) {
        resp.status(500).json({
            message: err,
            status: 500
        });
    }
}
/**Forgot Password with reset link */
exports.forgotPassword = async (req, resp) => {
    const checkUser = await User.findOne({ email: req.body.email });
    if (!checkUser) {
        resp.status(400).json({
            result: "Email is not registered with Us!",
            status: "400",
        });
    }
    else {
        /** Create One time password link send over email. */
        const screet = jwtKey + checkUser.password;
        const payload = {
            email: checkUser.email,
            id: checkUser._id
        }
        const token = Jwt.sign(payload, screet, { expiresIn: '15m' })
        const protocol = req.protocol;
        const host = req.hostname;
        // const url = req.originalUrl;
        const port = process.env.PORT;
        const fullUrl = `${protocol}://${host}:${port}/auth/reset-password/${checkUser._id}/${token}`
        resp.status(400).json({
            status: fullUrl,
        });
    }
}
/**reset password or update password */
exports.resetPassword = async (req, resp) => {


    const { id, token } = req.params;

    const checkUser = await User.findOne({ _id: id });
    if (checkUser) {
        const screet = jwtKey + checkUser.password;
        try {
            const payload = Jwt.verify(token, screet);/** verify the token come via email link */
            const schema = {
                user: Joi.object({

                    password: Joi.string().min(3).max(15).required(),
                    password_confirmation: Joi.any().valid(Joi.ref('password')).required()
                })
            }
            const validation = schema.user.validate(req.body);
            if (validation.error) {
                resp.status(400).json({
                    message: validation.error.details,
                    status: 400
                });
            }
            else {
                try {
                    let result = await User.updateOne(
                        { _id: checkUser._id },
                        {
                            $set: req.body
                        }
                    );
                    if (result) {
                        resp.status(200).json({
                            'user': result,
                            'message': 'Password updated successfully!',
                            'status': 200
                        })
                    }
                    else {
                        resp.status(400).json({ result: "No User Found!" })
                    }
                }
                catch (err) {
                    resp.status(500).json({
                        message: err,
                        status: 500
                    });
                }
            }

        } catch (error) {
            resp.status(400).json({
                message: error.message,
                status: 400,
            });
        }
    }
    else {
        resp.status(400).json({
            message: 'Invalid link Provided..',
            status: 400,
        });
    }
}

