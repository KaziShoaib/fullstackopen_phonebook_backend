const express = require('express'); // express
const app = express();
app.use(express.json()); // parsing json from request body



const cors = require('cors');  // connecting front end with backend
app.use(cors());

app.use(express.static('build')); // connecting front end production build

require('dotenv').config();  // accessing the environment variables from the .env file


//morgan middlewear
const morgan = require('morgan');
morgan.token('post_data', (req, res) => {
	if(req.method === 'POST'){
		return JSON.stringify(req.body);
	}
	else{
		return '';
	}
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_data'));


const Person = require('./models/person');


app.get('/api/persons', (request, response) => {
	Person.find({})
		.then(returnedPersons => returnedPersons.map(person => person.toJSON()))
		.then(returnedAndFormattedPersons => response.json(returnedAndFormattedPersons));
});


//info about how many names are there in the database
app.get('/info', (request, response) => {

	Person.find({}).then(persons => {
		const length = persons.length;
		let p1 = `<p>Phonebook has info for ${length} people</p>`;
		let p2 = `<p>${Date()}</p>`;
		response.send(p1+p2);
	});
});


app.get('/api/persons/:id', (request, response, next ) => {
	Person.findById(request.params.id).then(person => {
		if(person){
			response.json(person.toJSON());
		}
		else{
			response.status(404).end();
		}
	})
		.catch(error => next(error)); // sending error to the errorHandler middleware
});


app.delete('/api/persons/:id',(request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => response.status(204).end())
		.catch(error => next(error));
});


app.post('/api/persons', (request, response, next) => {
	let body = request.body;

	if(body.name===undefined || body.number===undefined){
		return response.status(400).json({
			'error':'name or number missing'
		});
	}

	let person = new Person({
		name: body.name,
		number: body.number,
	});
	person.save()
		.then(savedPerson => savedPerson.toJSON())
		.then(savedAndFormattedPerson => response.json(savedAndFormattedPerson))
		.catch(error => next(error));
});


app.put('/api/persons/:id',(request, response, next) => {
	const body = request.body;

	//creating a normal javascript object instaead of a mongoose model
	let person = {
		name: body.name,
		number: body.number,
	};

	Person.findByIdAndUpdate(request.params.id, person, { new:true, runValidators: true, context: 'query' })
		.then(updatedPerson => {
			if(updatedPerson){
				response.json(updatedPerson.toJSON());
			}
			else{
				response.status(404).end();
			}
		})
		.catch(error => next(error));
});


// unknown endpoint middleware
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error : 'unknown endpoint' });
};
app.use(unknownEndpoint);


// error handler middleware
const errorHandler = (error, request, response, next) => {
	console.log(error.message);
	if(error.name === 'CastError'){
		return response.status(400).send({ error:'malformatted id' });
	}
	else if(error.name === 'ValidationError'){
		return response.status(400).json({ error:error.message });
	}
	next(error);
};
app.use(errorHandler);


const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`listening to port ${PORT}`);
});