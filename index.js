const { response, json } = require('express')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// morgan.token('post_data', (req, res)=>{
//   if(req.method === 'POST'){
//     return JSON.stringify(req.body);
//   }
//   else{
//     return '';
//   }
// })
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_data'))

let persons = 
[
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]


app.get('/api/persons', (request, response)=>{
  //console.log(request.method);
  response.json(persons);
})

app.get('/info', (request, response)=>{
  let p1 = `<p>Phonebook has info for ${persons.length} people</p>`;
  let p2 = `<p>${Date()}</p>`
  response.send(p1 + p2);
})


app.get('/api/persons/:id', (request, response)=>{
  let id = Number(request.params.id);
  let person = persons.find(p => p.id === id);
  if(person){
    response.json(person);
  }
  else{
    response.status(404).end();
  }
})

app.delete('/api/persons/:id',(request, response)=>{
  let id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
})

const genId = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

app.post('/api/persons', (request, response) =>{
  let body = request.body;

  if(!body.name || !body.number){
    return response.status(400).json({
      'error':'name or number missing'
    });
  }

  if(persons.map(person=>person.name).includes(body.name)){
    return response.status(400).json({
      'error':'name already exists'
    });
  }


  let newId = genId(100000);
  let person = {
    id : newId,
    name : body.name,
    number : body.number
  };
  
  persons = persons.concat(person);
  response.json(person);
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
  console.log(`listening to port ${PORT}`);
})