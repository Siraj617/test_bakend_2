const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const Task = require('./model/Getdailytask')

const skillRoutes = require('./routes/skillRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://e-workspace-peach.vercel.app/',
    credentials: true,
}));    
app.use(bodyParser.json());

// Routes

app.use('/api/skills', skillRoutes);
app.use('/api/startinterview/', skillRoutes);
app.use('/api/SaveCode/', skillRoutes)
app.use('/api/getSavedCode/', skillRoutes)
app.use('/api/start-interview/', skillRoutes)
app.use('/api/preBookedUser/', skillRoutes)
app.use('/api/checkBooking/', skillRoutes)
app.use('/api/Aiservice/', skillRoutes)
app.use('/api', skillRoutes)
app.use('/api/fcm', skillRoutes)

app.get('/api/getDailyTasks/today', async (req, res) => {
    try {
        const tasks = await Task.find();
        console.log(tasks, "tasks retrieved");
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});

// app.use('/api/getDailyTasks', skillRoutes); // This mounts the route for daily tasks



// Connect to MongoDB
mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
    

const PORT = config.port || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
