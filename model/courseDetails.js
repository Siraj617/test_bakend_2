const mongoose = require('mongoose');

// Define a schema for individual courses
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  imgSrc: { type: String },
});

// Define a schema for categories, which includes subcategories and an array of courses
const categorySchema = new mongoose.Schema({
  subcategories: { type: [String], default: [] },
  courses: [courseSchema] // Array of courses under each subcategory
});

// Define the main CourseDetails schema with a categories map
const courseDetailsSchema = new mongoose.Schema({
  categories: {
    type: Map,
    of: categorySchema, // Maps each main category to a category schema
  },
});

module.exports = mongoose.model('CourseDetails', courseDetailsSchema, 'CourseDetails');
