const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

// GET Routes (non-parameterized first, parameterized last)
router.get('/CourseData',skillController.getCourseDetails);
router.get('/today', skillController.getAllTasks);
router.get('/:bookingID', skillController.CheckBookingID); // Parameterized route

// POST Routes (specific paths first, avoid conflicts with parameterized ones)
router.post('/', skillController.addSkills);
router.post('/getQuestions', skillController.getQuestions);
router.post('/PostQuestion', skillController.AiService);
router.post('/StoreCode', skillController.Savecode);
router.post('/GetCode', skillController.getSavedCode);
router.post('/selected-date', skillController.SheduleInterview);
router.post('/checkdatestatus', skillController.getInterviewDate);
router.post('/scoreMyAnswer', skillController.AiService);
router.post('/Savenotes', skillController.saveNote);
router.post('/Getnotes', skillController.getNotesByUser);
router.post('/save-token', skillController.saveFcmToken);

// PUT Routes
router.put('/editNote/:id', skillController.editNote);

// DELETE Routes
router.delete('/DeleteCode', skillController.deleteCode);
router.delete('/deleteNote/:id', skillController.deleteNote);

module.exports = router;
