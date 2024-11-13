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

// Define subcategory schema to contain an array of subcategory names and a Map of courses
const subcategorySchema = new mongoose.Schema({
  subcategories: { type: [String], default: [] },
  courses: { 
    type: [courseSchema], // Changed Map to Array of courseSchema
    required: true
  }
});

// Define the main course details schema
const courseDetailsSchema = new mongoose.Schema({
  categories: {
    type: Object,  // Use Object instead of Map for categories
    required: true
  }
});

// Create and export the CourseDetails model
const Postcourse = mongoose.model('Postcourse', courseDetailsSchema);
module.exports = Postcourse;

