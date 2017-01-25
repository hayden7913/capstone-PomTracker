const express = require('express');
const projectRouter = express.Router();
const {Projects} = require('./models');

projectRouter.route('/')
  .get((req, res) => {
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
  })
  .post((req,res) => {
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

projectRouter.route('/:projectId')
  .get((req, res) => {
    Projects
      .findById(req.params.projectId)
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
  })
  //adds a task
  .post((req, res) => {
    const toUpdate = {'tasks' : req.body};
   	Projects
      .findByIdAndUpdate(req.params.projectId, {'$push': toUpdate})
   		.then(project => res.status(201).json(project))
   		.catch(err => {
   				console.error(err);
   				res.status(500).json({message: 'Internal server error'});
   		});
   })
   //changes project name
   .put((req, res) => {
     const toUpdate = {
       'projectName': req.body.projectName
     }
     Projects
       .findByIdAndUpdate(req.params.projectId, {$set: toUpdate})
       .exec()
       .then(restaurant => res.status(204).end())
       .catch(err => res.status(500).json({message: 'Internal server error'}));
   })
   .delete((req, res) => {
     Projects
       .findByIdAndRemove(req.params.projectId)
       .exec()
       .then(restaurant => res.status(204).end())
       .catch(err => res.status(500).json({message: 'Internal server error'}));
   });









module.exports = projectRouter;
