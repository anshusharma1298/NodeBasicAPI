const express = require('express');
const router = express.Router();
const AuthenticationController = require('../controllers/AuthenticationController');
const verifyToken = require('../middleware/verifyToken');

/** Routes start  */
router.post('/register',AuthenticationController.register);
router.post('/login', AuthenticationController.login);
router.get('/get-users',verifyToken,AuthenticationController.getUsers);
router.get('/get-user/:id',verifyToken,AuthenticationController.getUser);
router.put('/update-user/:id', verifyToken,AuthenticationController.updateUser);
router.post('/forgot-password',AuthenticationController.forgotPassword);
router.post('/reset-password/:id/:token',AuthenticationController.resetPassword);


module.exports = router