const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    taskName: {type: String, required: true},
    total: Number,
    log: [{
      startTime: String,
      endTime: String
    }]
});

const projectSchema = mongoose.Schema({
    projectName: {type: String, required: true},
    tasks: [taskSchema]
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
