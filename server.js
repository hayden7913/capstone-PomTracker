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


app.get('/tasks', (req, res) => {
  PomTracker
    .find()
    .exec()
    .then(tasks => {
      res.json({
        tasks: tasks.map(
          task => task.apiRepr()
        )
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});


app.post('/tasks', (req,res) => {
	PomTracker
		.create({
			"name": req.body.name,
			"parent": req.body.parent,
			"total": req.body.total
		})
		.then(
			task => res.status(201).json(task.apiRepr()))
		.catch(err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
		});
});

app.put('/tasks/:id', (req, res) => {
  toUpdate = {"total": req.body.total}
  PomTracker
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(task => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Interval server error'}));
});

app.delete('/tasks/:id', (req, res) => {
  PomTracker
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(task => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
})


//////Generate Data
const generateParent = () => {
  const parents = ["Node Capstone", "Goals", "Chores"];
  return parents[Math.floor(Math.random() * parents.length)];
}

const generateTaskData = () => {
  return {
    name: faker.lorem.word(),
    parent: generateParent(),
    total: Math.floor(Math.random()*20)
  }
}

const seedTaskData = () => {
  const seedData = [];

  for (let i = 0; i < 10; i++) {
    seedData.push(generateTaskData());
  }
  return PomTracker.insertMany(seedData);
}


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
