const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

// Create a custom token to log the request body
morgan.token('body', (req) => {
  return JSON.stringify(req.body); // Convert request body to a JSON string
});

// Configure Morgan to log all requests
app.use(morgan((tokens, req, res) => {
  const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
  ];

  // Add the body to the log only for POST requests
  if (req.method === 'POST') {
      log.push(tokens.body(req, res));
  }

  return log.join(' ');
}));

let phonebooks = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello Wordfld!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(phonebooks)
})
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const phonebook = phonebooks.find(phonebook => phonebook.id === id)
    if(phonebook){
        response.json(phonebook)
    }
    else{
        response.status(404).send({ error: 'Person not found'})
    }
    
  })
app.get('/info', (request, response) => {
    const num = phonebooks.length
    const currentTime = new Date().toString();
    response.send(
       `<br>Phonebook has info for ${num} people</br>
        <br>${currentTime}</br>`
    )
})
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    phonebooks = phonebooks.filter(note => note.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
    const maxId = phonebooks.length > 0
      ? Math.max(...phonebooks.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body

  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }
    const findname = phonebooks.find(findname => findname.name === body.name)

    if(findname){
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }
  
    const phonebook = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
  
    phonebooks = phonebooks.concat(phonebook)
  
    response.json(phonebook)
  })


  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })