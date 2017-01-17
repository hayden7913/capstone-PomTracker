const mongoose = require('mongoose');

const pomTrackerSchema = mongoose.Schema({

    projectName: {type: String, required: true},
    tasks: [{
      taskName: {type: String, required: true},
      total: Number,
      log: [String]
    }]

  /*,
  masterLog: [String]*/
});

pomTrackerSchema.methods.apiRepr = function() {
  return {
    id: this.id,
    projectName: this.projectName,
    tasks: this.tasks
  };
}

const PomTracker = mongoose.model('PomTracker', pomTrackerSchema);

module.exports = {PomTracker};
/*{
	"tasks": [
        {
          "taskName": "Iteration",
          "total": 2,
          "_id": "587e5d8e806cfe234bce3bc3",
          "log": [
            "Fiday"
          ]
        },
        {
          "taskName": "MVP",
          "total": 5,
          "_id": "587e5d8e806cfe234bce3bc2",
          "log": [
            "Sunday"
          ]
        }
     ]

  }*/
