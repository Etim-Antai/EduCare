const express = require('express');
const router = express.Router();
const classMaterialController = require('../controllers/classMaterialController');

// Class Materials CRUD operations
router.post('/', classMaterialController.create);
router.delete('/:id', classMaterialController.deleteMaterial);
router.get('/', classMaterialController.getAllMaterials);

module.exports = router;
