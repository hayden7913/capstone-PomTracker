const express = require('express');
const app = express();
const bp = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {PomTracker} = require('./models');

app.use(bp.json());

app.use(express.static('public'));

let db, server;


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

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {

      if (err) {
        return reject(err);
      }

      app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};
