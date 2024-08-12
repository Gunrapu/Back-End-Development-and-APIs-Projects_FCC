const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));

const users = [];
let id = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  let obj = [];
  
	console.log(users);
	res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = {
    'username': req.body.username,
    '_id': id.toString()
  };
  users.push(newUser);
  id++;
  res.json(newUser);
});

app.post('/api/users/:_id/exercises', (req, res) =>{
  const result = users.filter(user => user._id == req.params._id);
  const [data] = result;
  
  let entDate = new Date(req.body.date).toString().split(' ', 4);

  if(req.body.date == undefined) {
    entDate = new Date().toString().split(' ', 4);
  }
  
  const date = `${entDate[0]} ${entDate[1]} ${entDate[2]} ${entDate[3]}`;

  const logs = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date
  }
  if(data.hasOwnProperty('log')){
    data.log.push(logs);
  } else {
    data.log = [];
    data.log.push(logs);
  }
  
  const exercise = {
    username: data.username,
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date,
    _id: data._id
  }
  res.json(exercise);
  
});

app.get('/api/users/:_id/logs', (req, res) =>{
  const result = users.filter(user => user._id == req.params._id);
  const [data] = result;
  const getData = [];
  
  for(i=0; i<req.query.limit; i++){
    getData.push(data.log[i]);
  }
  if(req.query.limit != undefined){
    data.log = getData;
  }
  
  const logResult = {
    username: data.username,
    count: data.log.length,
    _id: data._id,
    log: data.log
  }
  const logRes = data.log.filter(log => log.date >= req.query.from);
  res.json(logResult);
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})