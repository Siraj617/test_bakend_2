const mongoose = require('mongoose');

// Define course schema for each course
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  imgSrc: { type: String }
});

// Define subcategory schema to contain an array of subcategory names and a Map of courses
const subcategorySchema = new mongoose.Schema({
  subcategories: { type: [String], default: [] },
  courses: { 
    type: Map,
    of: [courseSchema] // each subcategory has an array of courses
  }
});

// Define the main course details schema
const courseDetailsSchema = new mongoose.Schema({
  categories: {
    type: Map,
    of: subcategorySchema // each category has subcategories and courses
  }
});

// Create and export the CourseDetails model
const CourseDetails = mongoose.model('CourseDetails', courseDetailsSchema);
module.exports = CourseDetails;
