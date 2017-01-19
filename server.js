const express = require('express');
const app = express();
const bp = require('body-parser');
const mongoose = require('mongoose');
const faker = require('faker');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {PomTracker} = require('./models');

app.use(bp.json());
app.use(express.static('public'));


app.get('/projects', (req, res) => {
  PomTracker
    .find()
    .exec()
    .then(projects => {
      res.json({
        document: projects/*.map(
          task =>  task.apiRepr()
        )*/
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});


app.post('/projects', (req,res) => {
/*  console.log({"name": req.body.projectName,
  "tasks": req.body.tasks});*/
	PomTracker
		.create({
			"projectName": req.body.projectName,
			"tasks": req.body.tasks
		})
		.then(
			project => res.status(201).json(project.apiRepr())
    )
		.catch(err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
		});
});

app.put('/projects/:id', (req, res) => {
  console.log(req.body);
  
  const toUpdate = {
    "masterLog": req.body.masterLog,
    "projects": req.body.projects
  }

  PomTracker
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(project => {/*console.log(project)*/;res.status(204).end()})
    .catch(err => res.status(500).json({message: 'Interval server error'}));
});

app.delete('/projects/:id', (req, res) => {
  PomTracker
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(project => {console.log("Deleted"); res.status(204).end()})
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

/*console.log(req.body);
toUpdate = {};
const key = `projects.${req.params.id}.projectName`
toUpdate[key]= req.body.projectName;
*/

//////Generate Data
const generateProjectName = () => {
  const parents = ["Node Capstone", "React Tutorial", "Clean Garage"];
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

const generateMasterLogEntry = () => {
  return {
    startTime: generateTime(),
    endTime: generateTime(),
    taskName: faker.lorem.word()
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
    log: generateDataArray(generateTaskLogEntry, 2)

  }
}

const generateProject = () => {
  return {
    projectName: faker.lorem.word(),
    tasks: generateDataArray(generateTask, 3),
  }
}

const seedProjectData = () => {
  const seedData = {
    projects: generateDataArray(generateProject, 2),
    masterLog: generateDataArray(generateMasterLogEntry, 2)
  }

  return PomTracker.insertMany(seedData);
}

//seedProjectData()

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
