const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  imgSrc: { type: String }
});

const subcategorySchema = new mongoose.Schema({
  subcategories: { type: [String] },
  courses: { 
    type: Map, 
    of: [courseSchema] // each subcategory has an array of courses
  }
});

const courseDetailsSchema = new mongoose.Schema({
  categories: {
    type: Map,
    of: subcategorySchema // each category has subcategories and courses
  }
});

const CourseDetails = mongoose.model('CourseDetails', courseDetailsSchema);

module.exports = CourseDetails;
