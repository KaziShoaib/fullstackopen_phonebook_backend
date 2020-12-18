const mongoose = require('mongoose')

if(process.argv.length !== 3 && process.argv.length !== 5){
  console.log('usage :\nnode mongo.js <passwod>\nnode mongo.js <password> <name> <phone-number>\n');
  process.exit(1);
}


const password = process.argv[2];
const dbName = 'phonebook-app';
const url = `mongodb+srv://shoaib:${password}@cluster0.rf6od.mongodb.net/${dbName}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema);

if(process.argv.length === 3){
  Person.find({}).then(result=>{
    console.log("phonebook:");
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  })
}
else{
  let person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  person.save().then(result=>{
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  })
}