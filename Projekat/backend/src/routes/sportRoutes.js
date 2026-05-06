const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');

router.get('/', sportController.dohvatiSveSporte);

module.exports = router;
