const express_app_router = require('express');
const router_app = express_app_router.Router();
const authMiddleware_app = require('../middleware/auth'); // In a real file system
// const { getAllApplications, ... } = require('../controllers/applicationController'); // In a real file system

router_app.get('/', authMiddleware, getAllApplications);
router_app.post('/', authMiddleware, createApplication);
// ... other application routes: /:id, /:id/report, etc.


module.exports = router_app;