const express = require('express');
const router = express.Router();
const tabelaController = require('../controllers/tabelaController');

// Javna ruta – svi korisnici mogu vidjeti tabelu
router.get('/:id/tabela', tabelaController.getTabelaZaTakmicenje);

module.exports = router;