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
      }
    )
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
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
      }
    )
});

module.exports = projectRouter;
