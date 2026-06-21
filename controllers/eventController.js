const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { 
      category, 
      search, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { isActive: true, date: { $gte: new Date() } };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { date: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'date-desc') sortOption = { date: -1 };
    if (sort === 'price') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'seats') sortOption = { availableSeats: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Event.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).select('-__v');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event categories
// @route   GET /api/events/meta/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Event.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: ['All', ...categories]
    });
  } catch (error) {
    next(error);
  }
};
