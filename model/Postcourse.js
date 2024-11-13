const mongoose = require('mongoose');

// Define course schema for each course
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  imgSrc: { type: String },
  documentURL: { type: String },  // New field for document URL
  createdDate: { type: Date, default: Date.now }  // New field for created date
});

// Define the main course details schema
const courseDetailsSchema = new mongoose.Schema({
  categories: {
    type: Map,  // Use Map instead of Object for categories
    of: {
      subcategories: { type: [String], default: [] },
      courses: { type: Object, required: true }  // Store courses under subcategories as objects
    },
    required: true
  }
});

// Create and export the CourseDetails model
const Postcourse = mongoose.model('Postcourse', courseDetailsSchema);
module.exports = Postcourse;
