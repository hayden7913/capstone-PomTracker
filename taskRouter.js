const express = require('express');
const taskRouter = express.Router({mergeParams: true});
const {Projects} = require('./models');

taskRouter.route('/')
  .get((req, res) => {

  Projects
    .findById(req.params.id)
    .exec()
    .then(projects => {
      const tasks = projects.tasks;
      res.json({
        tasks
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(404).json({message: 'Not Found'});
      }
    )
});

taskRouter.route('/:taskId')
  .put((req, res) => {
    console.log(req.body);
    const requiredTaskFields = ['taskName', 'totalTime', 'log'];

    for (let i=0; i<requiredTaskFields.length; i++) {
      const field = requiredTaskFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message);
      }
    }

    const toUpdate = {
      'tasks.$.taskName': req.body.taskName,
      'tasks.$.totalTime': req.body.totalTime,
      'tasks.$.log': req.body.log
    }

    Projects
      .update(
        {'_id': req.params.id, 'tasks._id': req.params.taskId},
        {$set: toUpdate})
      .exec()
      .then(project => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  })
  .delete((req, res) => {

    Projects
      .update(
       {'_id': req.params.id},
       {$pull: {'tasks': {'_id': req.params.taskId}}})
      .exec()
      .then(project => res.status(204).end())
      .catch(err => res.status(404).json({message: 'Not Found'}));
  });

module.exports = taskRouter;
