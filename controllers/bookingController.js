const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, seats } = req.body;

    if (!eventId || !seats) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId and number of seats'
      });
    }

    if (seats < 1 || seats > 10) {
      return res.status(400).json({
        success: false,
        message: 'You can book between 1 and 10 seats per transaction'
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This event is no longer active'
      });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book seats for past events'
      });
    }

    if (event.availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seat(s) available. Cannot book ${seats} seat(s).`
      });
    }

    // Use atomic operation to prevent race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      { 
        _id: eventId, 
        availableSeats: { $gte: seats },
        isActive: true
      },
      { $inc: { availableSeats: -seats } },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        message: 'Seats are no longer available. Please try again with fewer seats.'
      });
    }

    const totalPrice = event.price * seats;

    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      seats,
      totalPrice
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event', 'name date time venue imageUrl category')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'name date time venue imageUrl category totalSeats availableSeats price')
      .sort('-bookingDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Release seats back to event
    await Event.findByIdAndUpdate(
      booking.event,
      { $inc: { availableSeats: booking.seats } }
    );

    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('event', 'name date time venue imageUrl category')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'name date time venue imageUrl category totalSeats availableSeats price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
