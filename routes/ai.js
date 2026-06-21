const express = require('express');
const router = express.Router();
const { getRecommendations, smartSearch, getEventInsights } = require('../controllers/aiController');

router.post('/recommendations', getRecommendations);
router.post('/search', smartSearch);
router.get('/insights/:eventId', getEventInsights);

module.exports = router;
