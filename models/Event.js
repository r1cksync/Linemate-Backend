const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Conference', 'Workshop', 'Meetup', 'Concert', 'Sports', 'Tech', 'Art', 'Food', 'Other'],
    default: 'Other'
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  organizer: {
    type: String,
    default: 'Linemate Events'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ name: 'text', description: 'text', venue: 'text' });

module.exports = mongoose.model('Event', eventSchema);
