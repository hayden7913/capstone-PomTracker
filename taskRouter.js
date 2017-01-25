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
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});

//updates content of targeted task
taskRouter.route('/:taskId')
  .put((req, res) => {
    const toUpdate = {
      'tasks.$.taskName': req.body.taskName,
      'tasks.$.total': req.body.total,
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
  //deletes targeted task
  .delete((req, res) => {
    Projects
      .update(
       {'_id': req.params.id},
       {$pull: {'tasks': {'_id': req.params.taskId}}})
      .exec()
      .then(project => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

module.exports = taskRouter;
