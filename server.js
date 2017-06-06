const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const {PORT, DATABASE_URL} = require('./server-files/config');
const {Projects} = require('./server-files/models');
const {sampleData} = require('./server-files/sampleData')

const projectRouter = require('./server-files/routes/projectRouter');
const taskRouter = require('./server-files/routes/taskRouter');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/dist'));

projectRouter.use('/:id/tasks', taskRouter);
app.use('/projects', projectRouter);
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

const seedSampleData = () => {
  const seedData = sampleData.projects;
  
  return Projects.insertMany(seedData);
}

(function resetDb() {
  return new Promise((resolve, reject) => {
    console.warn('Resetting database');
    mongoose.connection.dropDatabase()
      .then(result => { 
      /*  seedSampleData(); */
        resolve(result)
      })
      .catch(err => reject(err));
  });
})();

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

 tearDownDb()

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
