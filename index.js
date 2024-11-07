const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const Person = require('./models/persons');

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

// Serve static files from the 'dist' directory
app.use(express.static('dist'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

// API Routes
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(err => {
      next(err);
    });
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(err => {
      next(err);
    });
});

app.get('/info', (request, response, next) => {
  Person.countDocuments()
    .then(count => {
      const currentTime = new Date().toString();
      response.send(`<br>Phonebook has info for ${count} people</br><br>${currentTime}</br>`);
    })
    .catch(err => {
      next(err);
    });
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then(deletedPerson => {
      if (deletedPerson) {
        response.status(204).end();
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(err => {
      next(err);
    });
});

// New PUT route for updating an existing person
app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  Person.findByIdAndUpdate(id, { number: body.number }, { new: true, runValidators: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(err => {
      next(err);
    });
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  // Check if the person already exists
  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        // If the person exists, return an error or update their number
        return response.status(400).json({ error: 'Person already exists. Use PUT to update.' });
      }

      const person = new Person({
        name: body.name,
        number: body.number
      });

      return person.save();
    })
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(err => {
      next(err);
    });
});

// Catch-all route for serving the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong!';
  res.status(statusCode).send({ error: message });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});