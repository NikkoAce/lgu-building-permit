const bcrypt = require('bcryptjs');
const jwt_controller = require('jsonwebtoken');
const User_controller = require('../models/Users');

const JWT_SECRET_CONTROLLER = process.env.JWT_SECRET || 'your_super_secret_key_change_this_later';

const registerUser = async (req, res) => {
    try {
           const { userAccessLevel, employeeId, name, email, office, password } = req.body;
           if (!employeeId || !password || !name || !email || !office) {
               return res.status(400).json({ message: 'Please fill out all required fields.' });
           }
           const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
           if (existingUser) {
               return res.status(400).json({ message: 'User with this Employee ID or Email already exists.' });
           }
           const salt = await bcrypt.genSalt(10);
           const hashedPassword = await bcrypt.hash(password, salt);
           const newUser = new User({ userAccessLevel, employeeId, name, email, office, password: hashedPassword });
           await newUser.save();
           res.status(201).json({ message: 'User registered successfully.' });
       } catch (error) {
           res.status(500).json({ message: 'Server error during registration.', error: error.message });
       }
   };
   

const loginUser = async (req, res) => {
 try {
        const { userAccessLevel, employeeId, password } = req.body;
        if (!employeeId || !password) {
            return res.status(400).json({ message: 'Employee ID and password are required.' });
        }
        const user = await User.findOne({ employeeId, userAccessLevel });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or user access level.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const payload = { user: { id: user.id, name: user.name, level: user.userAccessLevel } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

module.exports = { registerUser, loginUser };
