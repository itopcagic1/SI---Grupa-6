const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');

// GET /api/homepage
router.get('/', homepageController.getHomepageData);

module.exports = router;
