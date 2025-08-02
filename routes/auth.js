const express_auth_router = require('express');
const router_auth = express_auth_router.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router_auth.post('/register', registerUser);
router_auth.post('/login', loginUser);


module.exports = router_auth;