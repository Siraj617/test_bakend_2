const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

router.post('/', skillController.addSkills);
router.post('/getQuestions', skillController.getQuestions);
router.post('/PostQuestion', skillController.AiService)
router.post('/StoreCode', skillController.Savecode)
router.post('/GetCode', skillController.getSavedCode)
router.delete('/DeleteCode', skillController.deleteCode); // Add this line
router.post('/selected-date', skillController.SheduleInterview)
router.post('/checkdatestatus', skillController.getInterviewDate)
router.get('/:bookingID', skillController.CheckBookingID)
router.post('/scoreMyAnswer', skillController.AiService)
router.get('/today', skillController.getAllTasks);
router.post('/Savenotes', skillController.saveNote);
router.post('/Getnotes', skillController.getNotesByUser);
router.put('/editNote/:id', skillController.editNote);
router.delete('/deleteNote/:id', skillController.deleteNote); // Add this line
router.post('/save-token', skillController.saveFcmToken)

module.exports = router;
