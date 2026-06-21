const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getUserBookings, 
  cancelBooking, 
  getBooking 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
