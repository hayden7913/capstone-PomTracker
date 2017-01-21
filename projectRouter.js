const express = require('express');
const projectRouter = express.Router();
const {Projects} = require('./models');

projectRouter.get('/', (req, res) => {
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
      });
});

projectRouter.get('/:id', (req, res) => {
  Projects
    .findById(req.params.id)
    .exec()
    .then(projects => {
      res.json({
        projects
      });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      });
});

projectRouter.post('/', (req,res) => {
	Projects
		.create({
      'projectName': req.body.projectName,
      'tasks': req.body.tasks
		})
		.then(
			project => res.status(201).json(project)
    )
		.catch(err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
		});
});

//adds a task to targeted project
projectRouter.post('/:id', (req,res) => {
  const toUpdate = {'tasks' : req.body};
 	Projects
    .findByIdAndUpdate(req.params.id, {'$push': toUpdate})
 		.then(project => res.status(201).json(project))
 		.catch(err => {
 				console.error(err);
 				res.status(500).json({message: 'Internal server error'});
 		});
 });

/*
 app.put('/projects/:id', (req,res) => {

   Projects
     .update({'_id': req.params.id}, req.body)
     .exec()
     .then(project => {res.status(204).send('Success').end()})
     .catch(err => res.status(500).json({message: 'Interval server error'}));
 });
*/

module.exports = projectRouter;
