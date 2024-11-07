const mongoose = require('mongoose');

// Check if enough command-line arguments are provided
if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> <name> <number>');
  process.exit(1);
}

const password = process.argv[2];
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');

    // Define the schema and model
    const PersonSchema = new mongoose.Schema({
      name: String,
      number: String
    });

    const Person = mongoose.model('Person', PersonSchema);

    // If only the password is provided, list all entries
    if (process.argv.length === 3) {
      return Person.find({}).then(persons => {
        console.log('phonebook:');
        persons.forEach(person => {
          console.log(`${person.name} ${person.number}`);
        });
        return mongoose.connection.close();
      });
    }

    // Ensure that name and number are provided for adding an entry
    if (process.argv.length < 5) {
      console.log('Usage: node mongo.js <password> <name> <number>');
      return mongoose.connection.close();
    }

    // Otherwise, add a new entry
    const name = process.argv[3];
    const number = process.argv[4];
    const person = new Person({
      name: name,
      number: number
    });

    return person.save().then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      return mongoose.connection.close();
    });
  })
  .catch(err => {
    console.error('Error:', err.message);
    mongoose.connection.close();
  });