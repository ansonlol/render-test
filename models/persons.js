const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI; // Ensure this is set in your environment variables
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

// Define the schema and model
const PersonSchema = new mongoose.Schema({
    name: String,
    number: String
  });
  
  PersonSchema.set('toJSON', {
      transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
      }
    })
  
module.exports = mongoose.model('Person', PersonSchema);

