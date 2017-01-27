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

    const requiredProjectFields = ['projectName', 'tasks'];
    const requiredTaskFields = ['taskName', 'total', 'log'];

    requiredProjectFields.forEach(field => {
      if (! (field in req.body && req.body[field])) {
        return res.status(400).json({message: `Must specify value for ${field}`});
      }
    });

    requiredTaskFields.forEach(field => {
      req.body.tasks.forEach(task => {
        if (! (field in task && task[field])) {
          return res.status(400).json({message: `Must specify value for ${field}`})
        }
    });
  });

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
          res.status(404).json({message: 'Project Not Found'});
        });
  })
  .post((req, res) => {

    const requiredTaskFields = ['taskName', 'total', 'log'];
    requiredTaskFields.forEach(field => {
      if (! (field in req.body && req.body[field])) {
        return res.status(400).json({message: `Must specify value for ${field}`});
      }
    });

    const toUpdate = {'tasks' : req.body};

   	Projects
      .findByIdAndUpdate(req.params.projectId, {'$push': toUpdate})
   		.then(project => res.status(201).json(project))
   		.catch(err => {
   				console.error(err);
   				res.status(404).json({message: 'Project Not Found'});
   		});
   })
   .put((req, res) => {
     if (!((req.params.projectId && req.body._id) && (req.params.projectId === req.body._id))) {
       const message = (
         `Request path id (${req.params.projectId}) and request body id ` +
         `(${req.body._id}) must match`);
       console.error(message);
       res.status(400).json({message: message});
     }

     if (! ('projectName' in req.body && req.body['projectName'])) {
       return res.status(400).json({message: `Must specify value for projectName`});
     }

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
       .catch(err => res.status(404).json({message: 'Not Found'}));
   });


module.exports = projectRouter;
