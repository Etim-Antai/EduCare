const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Class CRUD operations
router.post('/', classController.addClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.get('/', classController.getClasses);

module.exports = router;
