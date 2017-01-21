const express = require('express');
const app = express();
const bp = require('body-parser');
const mongoose = require('mongoose');
const faker = require('faker');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Projects} = require('./models');

const projectRouter = require('./projectRouter');
const taskRouter = require('./taskRouter');

app.use(bp.json());
app.use(express.static('public'));


projectRouter.use('/:id/tasks', taskRouter);
app.use('/projects', projectRouter);

/*projectRouter.route('/').get((req, res) => {
  Projects
    .find()
    .exec()
    .then(projects => {
      res.json({
        projects
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});*/




/*taskRouter.route('/').get((req, res) => {
  Projects
    .findById(req.params.id)
    .exec()
    .then(projects => {
      const tasks = projects.tasks
      res.json({
        tasks
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});*/












//addTask(taskBody, projectName, toUpdateKey)

  /*"projectName": "illum"*/


/*"projectName": "Updated Capstone",
"_id": "587ebfdaf63e6f71cbb188ee",
"tasks": [
  {
    "total": 100,
    "taskName": "Feedback",
    "_id": "58801ae0cd71a9110a6ce5dd",
    "log": []
  }
]*/

/*
const req.body = {
  action: 'addTask',
  content: {
    'total': 125,
    'taskName': 'change happens',
    'log': []
  }
}*/

app.put('/projects/:id', (req, res) => {
  //console.log(req.body);



  const sampleTask = {
    'total': 125,
    'taskName': 'change happens',
    'log': []
  }
  const args = {
    action: '$push',
    path: 'projects.$.tasks',
    taskBody: sampleTask,
    projectionKey: 'projects.projectName',
    projectionValue: 'illum'
  }

  const changeSomething = (args) => {
    const updateObj = {};
    const projectionObj = {};
    const toUpdate = {};

    toUpdate[args.path] = args.taskBody;
    updateObj[args.action] = toUpdate;
    projectionObj[args.projectionKey] = args.projectionValue;

    console.log(toUpdate);
    console.log(updateObj);
    console.log(projectionObj);

    PomTracker
      .update(
        {'_id': '588080db514db510d59b527e', projectionObj},
        updateObj
    )
    .then(project => {res.status(204).send('Success').end()})
    .catch(err => res.status(500).json({message: 'Interval server error'}));
  }

  //changeSomething(args);


  const toUpdate = {
    'projects.$.tasks': {
      "total": 125,
      "taskName": "fdsa2",
      "log": []
    }
  }
/*  const action = '$push'
  const update = {};
  update[action] = toUpdate;*/

  const workingUpdateFunction = () => {
      PomTracker
        .update(
          {"_id": "588080db514db510d59b527e", "projects.projectName": "illum"},
          {$push: toUpdate}
      )
      .then(project => {res.status(204).send('Success').end()})
      .catch(err => res.status(500).json({message: 'Interval server error'}));
  }

 workingUpdateFunction();
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
