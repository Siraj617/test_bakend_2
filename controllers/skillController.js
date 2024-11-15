const mongoose = require('mongoose');
const config = require('../config'); // Adjust path as necessary
const Skill = require('../model/skillModel'); // Adjust path as necessary
const Savecode = require('../model/Savecode')
const GetSavedCode = require('../model/GetSavedCode')
const moment = require('moment'); // Import moment for date formatting
const SheduleInterview = require('../model/SheduleInterview')
const sendEmail = require('./utils/mailer'); // Adjust path as necessary
const DailyTasks = require('../model/Getdailytask')
const axios = require('axios');
const Savenotes = require('../model/SaveNotes');
const FcmToken = require('../model/fcmTokenModel')
const CourseDetails = require('../model/courseDetails');
const Postcourse = require('../model/Postcourse');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: "dgipgstvo",
  api_key: "948166186923696",
  api_secret: "Nyh6YRpK1HUreOdhDxvSkzI6K-w"
});


exports.addSkills = async (req, res) => {
    const { user, skills } = req.body;

    try {
        console.log(user, skills, "problem area")
        const newSkill = new Skill({ user, skills });
        const data = await newSkill.save();
        console.log(data)
        res.status(200).json({ message: 'Skills and user data added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



const getQuestionsFromCloud = async (userDetails) => {
  const questions = [];

  for (const { skill, level } of userDetails) {
    // Convert skill and level to lowercase for folder paths
    const folderPath = `${skill.toLowerCase()}/${level.toLowerCase()}`;

    try {
      console.log(`Fetching questions for skill: ${skill}, level: ${level}`);

      // List all JSON files in the specified Cloudinary folder
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath, // Use dynamic folder path
        resource_type: 'raw',
        max_results: 500,
      });

      // Filter to get only .json files
      const jsonFiles = result.resources.filter(file => file.url.endsWith('.json'));

      for (const file of jsonFiles) {
        // Fetch the content of each JSON file
        const response = await axios.get(file.secure_url);

        if (response.status === 200) {
          const retrievedQuestions = response.data;

          questions.push({
            skill,
            level,
            questions: retrievedQuestions,
          });

          console.log(`Successfully retrieved questions for ${skill} at ${level} level.`);
        } else {
          console.error(`Failed to fetch questions: Received status code ${response.status}`);
        }
      }
    } catch (error) {
      console.error(`Error retrieving questions for ${skill} at ${level} level:`, error.message);
    }
  }

  return questions;
};


exports.getQuestions = async (req, res) => {
    const { username, email, role } = req.body;

    console.log( username, email, role, "getquestions")

    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Username, email, and role are required' });
    }

    try {
       

        const user = await Skill.findOne({ "user.username": username, "user.email": email });

        if (user) {
            console.log('User found:');

            console.log(user.skills);

            const questions = await getQuestionsFromCloud(user.skills);
            console.log(questions, "cloud questions")
            
            res.status(200).json({ questions:questions });
        } else {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error finding user:', err);
        res.status(500).json({ message: 'Server error' });
    } 
};

exports.Savecode = async (req, res) =>{
  
    const { filename, username, email, code , date} = req.body;

    if (!filename || !username || !email || !code || !date ) {
        return res.status(400).json({ message: 'All fileds Are Must Required' });
    }

    try {
      const newEntry = new Savecode({filename : filename, code : code , date : date, email : email, username : username})

      const result = await newEntry.save()

      if(!result) { 

        return res.staus(400).json({error : "error While Saving record"})
      }

      res.status(200).json({message : "Record Saved Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }

}



exports.getSavedCode = async (req, res) =>{
    const { username, email} = req.body;

    if (!username || !email  ) {
        return res.status(400).json({ message: 'Some Fields Are Missing While Getting Saved code' });
    }

    try {
      const result = await Savecode.find({username:username, email : email})
      console.log(result, "res")

      if(!result) { 

        return res.staus(400).json({error : "error While Getting record"})
      }

      res.status(200).json({data : result})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }

}

exports.deleteCode = async (req, res) => {
    const { filename } = req.body;
  
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required to delete the code' });
    }
  
    try {
      await Savecode.deleteOne({ filename: filename });
      res.status(200).json({ message: 'Code deleted successfully' });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  };


  const isAllowedDate = (date) => {
    const day = date.getDay();
    return day === 5 || day === 6 || day === 0;
  };

  function generateUniqueBookingID(startDigit = 1) {
    const min = Math.pow(10, 4); // 10000
    const max = Math.pow(10, 5) - 1; // 99999
    let id;

    do {
        id = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (id.toString()[0] !== startDigit.toString());

    return id;
}

exports.SheduleInterview = async (req, res) => {
    const { selectedDate, username, email } = req.body;
    const date = new Date(selectedDate);
  
    if (!selectedDate || !username || !email) {
      return res.status(400).json({ message: "Username and Email are missing" });
    }
  
    if (!isAllowedDate(date)) {
      return res.status(400).json({ message: "Selected date is not allowed. Please choose a Friday, Saturday, or Sunday." });
    }
  
    try {
        const existingInterview = await SheduleInterview.findOne({ username, email, interviewDate: date.toISOString() });
        if (existingInterview) {
            return res.status(400).json({ message: "You have already booked this slot. Please choose another date and time." });
        }
  
        const bookingID = generateUniqueBookingID();
  
        const setInterviewDate = new SheduleInterview({
            interviewDate: date.toISOString(),
            username: username,
            email: email,
            bookingID: bookingID // Assuming you have this field in your schema
        });
  
        const storeData = await setInterviewDate.save();
  
        // Send email with booking ID
        const emailText = `Your interview is scheduled on ${date.toDateString()} with booking ID: ${bookingID}`;
        try {
            await sendEmail(email, 'Interview Scheduled', emailText);
            res.status(200).json({ message: "Successfully Interview Scheduled" });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ message: 'Failed to send confirmation email' });
        }
    } catch (error) {
        console.error('Error saving interview date:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.CheckBookingID = async (req, res) => {
  const { bookingID } = req.params;
  console.log(typeof(bookingID), "testid");
  console.log(bookingID);
  
  try {
    const interview = await SheduleInterview.findOne({ bookingID: bookingID });
    console.log(interview, "interview");

    if (interview) {  
      // Delete the found interview
      await SheduleInterview.deleteOne({ bookingID: bookingID });
      return res.status(200).json({ match: true });
    } else {
      return res.status(404).json({ match: false });
    }
  } catch (error) {
    console.error('Error checking booking ID:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}




  exports.getInterviewDate = async (req, res) => {
    const { username, email } = req.body;
  
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }
  
    try {
      const interview = await SheduleInterview.findOne({ username, email });
  
      if (interview) {
        res.status(200).json({ interviewDate: interview.interviewDate });
      } else {
        res.status(404).json({ message: 'No interview scheduled' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  


  exports.getAllTasks = async (req, res) => {
    console.log("Controller called");
    try {
        const tasks = await DailyTasks.find();
        console.log(tasks, "tasks");
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error retrieving tasks", error); 
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
  };


  exports.AiService = async (req, res) => {
    console.log(req.body);

    try {
        const userInput = req.body.responses; // Extract the user's message from the request body
        console.log(userInput, "user data");

        // Prepare the message to send to the Gemini AI API
        const formattedMessage = `
            {
                "responses": ${JSON.stringify(userInput , null, 2)}
            }

            Note:
            Gemini, please analyze each question and answer pair provided in the JSON format accurately. Your task is to:
            1. Provide a score out of 100 based on the correctness and completeness of the answers.
            2. Identify the strengths of the answers, focusing on the user's knowledge and skills.
            3. Identify the weaknesses, pointing out any inaccuracies, incomplete answers, or lack of detail.
            4. Provide tips on how to improve the answers effectively and deeply.
            Please ensure your analysis is accurate and concise. This is for theory questions only, not coding examples.
            5. Don't type all the questions and answers score separately, just tell me the total overall scores with strengths, weaknesses, and improvement tips (in mostly 3 to 4 lines).
        `;

        // Send the user's message to the Gemini AI API
        const bardApiResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            contents: [
                {
                    parts: [
                        {
                            text: formattedMessage
                        }
                    ]
                }
            ]
        }, {
            params: {
                key: process.env.GEMINI_API_KEY // Replace with your actual Bard AI API key
            }
        });

        const responseData = bardApiResponse.data;
        const text = responseData.candidates[0].content.parts[0].text;

        console.log(text);

        // Send the entire response text back to the client
        res.json({ analysis: text });
    } catch (error) {
        console.error('Error handling Bard AI request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

  exports.saveNote = async (req, res) => {
    try {
      const { username, email, role, title, keyPoint, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      // Store the current date as an ISO string
      const newNote = new Savenotes({
        username,
        email,
        role,
        title,
        keyPoint,
        description,
        createdAt: new Date(), // Use a Date object which automatically gets stored as an ISO string
      });

      const savedNote = await newNote.save();

      res.status(201).json({
        message: 'Note saved successfully',
        note: savedNote,
      });
    } catch (error) {
      console.error('Error saving note:', error);
      res.status(500).json({
        error: 'Failed to save the note',
      });
    }
  };

  exports.getNotesByUser = async (req, res) => {
    try {
      const { username, email } = req.body;

      if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
      }

      const notes = await Savenotes.find({ username, email });

      res.status(200).json({
        message: 'Notes retrieved successfully',
        notes,
      });
    } catch (error) {
      console.error('Error retrieving notes:', error);
      res.status(500).json({
        error: 'Failed to retrieve notes',
      });
    }
  };

  // Edit Note (Update an existing note by its ID)
  // Other controller methods...

  exports.editNote = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, keyPoint, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const updatedNote = await Savenotes.findByIdAndUpdate(
        id,
        { title, keyPoint, description, updatedAt: new Date() },
        { new: true } // Return the updated document
      );

      if (!updatedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json({
        message: 'Note updated successfully',
        note: updatedNote,
      });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update the note' });
    }
  };

  // Make sure to export other functions if they exist as well.



  // Delete Note (Remove a note by its ID)
  exports.deleteNote = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedNote = await Savenotes.findByIdAndDelete(id);

      if (!deletedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json({
        message: 'Note deleted successfully',
        note: deletedNote,
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        error: 'Failed to delete the note',
      });
    }
  };

  exports.saveFcmToken = async (req, res) => {
    const { userId, token } = req.body; // Expecting userId and token from request body
  
    if (!userId || !token) {
        return res.status(400).json({ message: 'User ID and token are required.' });
    }

    try {
        // Check if the user already has a token
        const existingToken = await FcmToken.findOne({ userId });
        
        // Log the existing token for debugging
        console.log(existingToken ? 'Existing token found' : 'No existing token found', existingToken);

        if (existingToken) {
            // If a token exists, update it
            existingToken.token = token; // Update the token
            const updatedToken = await existingToken.save(); // Save the updated token
            console.log('Updated token in DB:', updatedToken); // Log the updated token
            return res.status(200).json({ message: 'FCM token updated successfully.' });
        } else {
            // If no token exists, create a new one
            const newToken = new FcmToken({ userId, token }); // Create new token document
            const savedToken = await newToken.save(); // Save the new token
            console.log(savedToken, "save tone success")
            console.log('Saved new token in DB:', savedToken); // Log the new token
            return res.status(201).json({ message: 'FCM token saved successfully.' });
        }
    } catch (error) {
        console.error('Error saving FCM token:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};



exports.addCourseDetails = async (req, res) => {
  try {
    const courseData = req.body;

    // Initialize a new CourseDetails document
    const newCourseDetails = new Postcourse();
    newCourseDetails.categories = {};

    // Loop through each category in the payload
    Object.keys(courseData).forEach(categoryName => {
      const categoryData = courseData[categoryName] || {}; // Default to an empty object if undefined

      // Only proceed if subcategories or courses exist in categoryData
      const hasSubcategories = Array.isArray(categoryData.subcategories);
      const hasCourses = categoryData.courses && typeof categoryData.courses === 'object';

      if ((hasSubcategories && categoryData.subcategories.length > 0) || (hasCourses && Object.keys(categoryData.courses).length > 0)) {
        const categoryCourses = {
          subcategories: hasSubcategories ? categoryData.subcategories : [],
          courses: {}
        };

        // Process each subcategory and its courses if available
        if (hasSubcategories) {
          categoryData.subcategories.forEach(subcategoryName => {
            const coursesInSubcategory = categoryData.courses?.[subcategoryName] || [];

            // Only add subcategory if courses exist for it
            if (coursesInSubcategory.length > 0) {
              categoryCourses.courses[subcategoryName] = coursesInSubcategory.map(course => ({
                courseId: new mongoose.Types.ObjectId(), // Automatically generate unique courseId
                title: course.title,
                instructor: course.instructor,
                rating: course.rating,
                reviews: course.reviews,
                price: course.price,
                originalPrice: course.originalPrice,
                imgSrc: course.imgSrc,
                documentURL: course.documentUrl,  // Document URL field
                createdDate: new Date() // Automatically set the created date to current date
              }));
            }
          });
        }

        // Only add to categories if there's valid data in the category
        newCourseDetails.categories[categoryName] = categoryCourses;
      }
    });

    // Save the new document to the database
    await newCourseDetails.save();
    console.log('Course Details Saved:', newCourseDetails);

    res.status(201).json({ message: 'Course details added successfully' });
  } catch (error) {
    console.error('Error adding course data:', error);
    res.status(500).json({ error: 'Failed to add course data' });
  }
};


// Controller to fetch the course details
exports.getCourseDetails = async (req, res) => {
  console.log('hello');
  try {
    // Fetch all documents in the CourseDetails collection
    const courseDetails = await Postcourse.find(); // Fetching all documents

    // Debugging: Check what courseDetails contains
    console.log('Fetched course details:', courseDetails);

    // Check if the courseDetails array is empty
    if (!courseDetails || courseDetails.length === 0) {
      return res.status(404).json({ error: 'No course data found' });
    }

    // Initialize the final structure
    const finalStructure = {
      categories: {}
    };

    // Loop through each document (course data) returned by the find query
    courseDetails.forEach(document => {
      // Access the `categories` field within each document
      const data = document._doc.categories;

      // Ensure `data` is valid
      if (!data || typeof data !== 'object') {
        console.error('Invalid categories data');
        return;
      }

      // Loop through each category (e.g., 'Web Development', 'Data Science')
      Object.keys(data).forEach(categoryName => {
        const categoryData = data[categoryName];

        // Log categoryData to check its structure
        console.log(`Category: ${categoryName}`, categoryData);

        // Make sure categoryData is not null or undefined
        if (!categoryData || typeof categoryData !== 'object') {
          console.error(`Invalid category data for ${categoryName}`);
          return; // Skip invalid data
        }

        // Initialize the structure for each category if it doesn't exist
        if (!finalStructure.categories[categoryName]) {
          finalStructure.categories[categoryName] = {
            subcategories: categoryData.subcategories || [],
            courses: {}
          };
        }

        // Check for valid subcategories and courses
        if (Array.isArray(categoryData.subcategories)) {
          finalStructure.categories[categoryName].subcategories = categoryData.subcategories;
        }

        // Loop through each subcategory and map the courses
        if (categoryData.courses && typeof categoryData.courses === 'object') {
          Object.keys(categoryData.courses).forEach(subcategoryName => {
            const courses = categoryData.courses[subcategoryName];

            // Check if courses are valid
            if (Array.isArray(courses)) {
              // Add each subcategory with its courses array
              finalStructure.categories[categoryName].courses[subcategoryName] = courses.map(course => {
                return {
                  courseId: course.courseId,         // Added course ID
                  title: course.title,
                  instructor: course.instructor,
                  rating: course.rating,
                  reviews: course.reviews,
                  price: course.price,
                  originalPrice: course.originalPrice,
                  imgSrc: course.imgSrc,
                  documentUrl: course.documentURL,   // Added document URL
                  createdDate: course.createdDate    // Added created date
                };
              });
            }
          });
        } else {
          console.error(`Invalid courses data for ${categoryName}`);
        }
      });
    });

    // Send the final structured JSON as a response
    console.log(finalStructure)
    res.json(finalStructure);
  } catch (error) {
    console.error('Error fetching and structuring course data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
