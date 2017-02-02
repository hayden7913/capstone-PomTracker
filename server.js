const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const faker = require('faker');
const app = express();

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Projects} = require('./models');

const {router: usersRouter} = require('./users');



const projectRouter = require('./projectRouter');
const taskRouter = require('./taskRouter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));


app.use('/users/', usersRouter);

projectRouter.use('/:id/tasks', taskRouter);
app.use('/projects', projectRouter);

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

const generateProjectName = () => {
  const parents = ["Node Capstone", "React Tutorial", "Remodel Kitchen"];
  return parents[Math.floor(Math.random() * parents.length)];
}

const generateTime = () => {
  const hours = Math.floor(Math.random() * 24);
  let minutes = Math.floor(Math.random() * 60);
  if (minutes.toString().length === 1) {
    minutes = `0${minutes}`
  }
  return `${hours}:${minutes}`
}

const generateTaskLogEntry = () => {
  return {
    startTime: generateTime(),
    endTime: generateTime()
  }
}

const generateDataArray = (callback, maxLength) => {
  let arr = [];
  for (let i = 0; i < Math.random() * maxLength + 1; i++) {
    arr.push(callback())
  }
  return arr
}

const generateTask = () => {
  return {
    taskName: faker.lorem.word(),
    total: Math.floor(Math.random()*20),
    log: generateDataArray(generateTaskLogEntry, 0)

  }
}

const generateProject = () => {
  return {
    projectName: faker.lorem.word(),
    tasks: generateDataArray(generateTask, 3),
  }
}

const seedProjectData = () => {
  const seedData = generateDataArray(generateProject, 2);
  return Projects.insertMany(seedData);
}

// seedProjectData()

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

//tearDownDb();
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
