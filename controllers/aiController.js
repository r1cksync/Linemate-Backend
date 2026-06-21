const Groq = require('groq-sdk');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @desc    AI Event Recommendations
// @route   POST /api/ai/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    
    const events = await Event.find({ 
      isActive: true, 
      date: { $gte: new Date() } 
    }).select('name description category venue date time price availableSeats totalSeats').lean();

    if (events.length === 0) {
      return res.json({ success: true, data: { events: [], aiMessage: 'No upcoming events available right now.' } });
    }

    const eventsSummary = events.map(e => ({
      id: e._id.toString(),
      name: e.name,
      category: e.category,
      venue: e.venue,
      date: new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: e.time,
      price: e.price === 0 ? 'Free' : `$${e.price}`,
      available: `${e.availableSeats}/${e.totalSeats} seats left`
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an event recommendation assistant. Based on user preferences and available events, recommend up to 5 events. Return ONLY valid JSON in this format: {"recommendedIds":["id1","id2"],"message":"friendly personalized message explaining recommendations"}. The message should be warm and helpful, 2-3 sentences max.'
        },
        {
          role: 'user',
          content: `User preferences: ${preferences || 'No specific preferences'}\n\nAvailable events: ${JSON.stringify(eventsSummary)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    const recommendedEvents = events.filter(e => 
      aiResponse.recommendedIds.includes(e._id.toString())
    );

    res.json({
      success: true,
      data: {
        events: recommendedEvents,
        aiMessage: aiResponse.message
      }
    });
  } catch (error) {
    console.error('AI Recommendation error:', error);
    // Fallback: return popular events
    const events = await Event.find({ isActive: true, date: { $gte: new Date() } })
      .sort({ availableSeats: -1 })
      .limit(5)
      .select('-__v');

    res.json({
      success: true,
      data: {
        events,
        aiMessage: 'Here are some popular upcoming events you might enjoy!'
      }
    });
  }
};

// @desc    AI Event Search Assistant
// @route   POST /api/ai/search
exports.smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const events = await Event.find({ 
      isActive: true, 
      date: { $gte: new Date() } 
    }).select('name description category venue date time price availableSeats totalSeats').lean();

    if (events.length === 0) {
      return res.json({ success: true, data: { events: [], aiMessage: 'No upcoming events to search through.' } });
    }

    const eventsSummary = events.map(e => ({
      id: e._id.toString(),
      name: e.name,
      description: e.description.substring(0, 200),
      category: e.category,
      venue: e.venue,
      date: new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: e.time,
      price: e.price === 0 ? 'Free' : `$${e.price}`,
      available: `${e.availableSeats}/${e.totalSeats} seats`
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an event search assistant. The user will describe what kind of event they want. Match their query to the best events from the list. Return ONLY valid JSON: {"matchedIds":["id1","id2"],"message":"helpful message explaining matches found"}. Be smart about matching - consider category, venue, event name, description semantics. Return up to 8 best matches.'
        },
        {
          role: 'user',
          content: `Search query: "${query}"\n\nAvailable events: ${JSON.stringify(eventsSummary)}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 800
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    const matchedEvents = events.filter(e => 
      aiResponse.matchedIds.includes(e._id.toString())
    );

    res.json({
      success: true,
      data: {
        events: matchedEvents,
        aiMessage: aiResponse.message
      }
    });
  } catch (error) {
    console.error('AI Search error:', error);
    // Fallback: regex search
    const events = await Event.find({ 
      isActive: true, 
      date: { $gte: new Date() },
      $or: [
        { name: { $regex: req.body.query, $options: 'i' } },
        { description: { $regex: req.body.query, $options: 'i' } },
        { venue: { $regex: req.body.query, $options: 'i' } },
        { category: { $regex: req.body.query, $options: 'i' } }
      ]
    }).select('-__v').limit(8);

    res.json({
      success: true,
      data: {
        events,
        aiMessage: `Found ${events.length} event(s) matching "${req.body.query}"`
      }
    });
  }
};

// @desc    AI Event Insights
// @route   GET /api/ai/insights/:eventId
exports.getEventInsights = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId).lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const bookings = await Booking.find({ event: req.params.eventId, status: 'confirmed' });
    const bookingCount = bookings.length;
    const fillRate = ((event.totalSeats - event.availableSeats) / event.totalSeats * 100).toFixed(1);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an event insights assistant. Generate a short, engaging insight about this event (2-3 sentences). Include tips like: popularity level, whether to book soon, what makes it special. Return ONLY the insight text, no JSON.'
        },
        {
          role: 'user',
          content: `Event: ${event.name}\nCategory: ${event.category}\nVenue: ${event.venue}\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.time}\nPrice: ${event.price === 0 ? 'Free' : '$' + event.price}\nFill rate: ${fillRate}%\nTotal bookings: ${bookingCount}\nSeats remaining: ${event.availableSeats}/${event.totalSeats}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 200
    });

    res.json({
      success: true,
      data: {
        insight: completion.choices[0].message.content,
        stats: {
          totalSeats: event.totalSeats,
          availableSeats: event.availableSeats,
          fillRate: parseFloat(fillRate),
          bookingCount
        }
      }
    });
  } catch (error) {
    console.error('AI Insights error:', error);
    res.json({
      success: true,
      data: {
        insight: 'This event is looking great! Check the details below and secure your spot.',
        stats: {
          totalSeats: event.totalSeats || 0,
          availableSeats: event.availableSeats || 0,
          fillRate: 0,
          bookingCount: 0
        }
      }
    });
  }
};
