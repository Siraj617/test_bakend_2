const mongoose = require('mongoose');

// Schema for DailyTasks
const taskSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
    technology: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: Array, required: false },
    status: { type: String, required: true },
    hasViewedDescription: { type: Boolean, default: false }
}, {collection:'DailyTasks'});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
