const mongooes = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongooes.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: String,
    password: String,
});
userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword;
        next()
    } catch (error) {
        next(error)
    }
});
module.exports = mongooes.model('User', userSchema);