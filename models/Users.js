const mongoose_user = require('mongoose');   
   // User Schema
const userSchema = new mongoose.Schema({
    userAccessLevel: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    office: { type: String, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

module.exports = User;


