const mongoose = require('mongoose');

const pomTrackerSchema = mongoose.Schema({
  projects: {
    projectName: String,
    tasks: [{
      taskName: {type: String, required: true},
      total: Number,
      log: [String]
    }]
  },
  masterLog: [String]
});

pomTrackerSchema.methods.apiRepr = function() {
  return {
    id: this.id,
    name: this.name,
    parent: this.parent,
    total: this.total
  };
}

const PomTracker = mongoose.model('PomTracker', pomTrackerSchema);

module.exports = {PomTracker};
