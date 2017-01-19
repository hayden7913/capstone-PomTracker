const mongoose = require('mongoose');

const pomTrackerSchema = mongoose.Schema({
  projects: [{
      projectName: {type: String, required: true},
      tasks: [{
        taskName: {type: String, required: true},
        total: Number,
        log: [{
          startTime: String,
          endTime: String
        }]
      }]
  }],
  masterLog: [{
    startTime: String,
    endTime: String,
    taskName: String
  }]
});
/*
pomTrackerSchema.methods.apiRepr = function() {
  return {
    id: this.id,
    projectName: this.projectName,
    tasks: this.tasks
  };
}*/

const PomTracker = mongoose.model('PomTracker', pomTrackerSchema);

module.exports = {PomTracker};
