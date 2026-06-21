const express = require('express');
const router = express.Router();
const { getEvents, getEvent, getCategories } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/meta/categories', getCategories);
router.get('/:id', getEvent);

module.exports = router;
