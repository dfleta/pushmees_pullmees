
var express = require('express');
var router = express.Router();

// Require controller modules
var boxController = require('../controllers/boxController');

/**
 * Box routes
 * 
 * No es necesario añadir /box a las rutas
 * pues en app especificamos la ruta /box
 * en el middleware use().
 */


// factory es la callback function del controller
router.get('/', boxController.boxAPI.factory);
router.get('/createMeeseeks', boxController.boxAPI.createMeeseeks);

router.get('/getMeeseeks/:position', boxController.boxAPI.getMeeseeks);

module.exports = router;