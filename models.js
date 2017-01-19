const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    projectName: {type: String, required: true},
    tasks: [{
      taskName: {type: String, required: true},
      total: Number,
      log: [{
        startTime: String,
        endTime: String
      }]
    }]
});

/*,
masterLog: [{
  startTime: String,
  endTime: String,
  taskName: String
}]*/
/*

pomTrackerSchema.methods.apiRepr = function() {
  return {
    id: this.id,
    projectName: this.projectName,
    tasks: this.tasks
  };
}*/

const Projects = mongoose.model('Projects', projectSchema);

module.exports = {Projects};
