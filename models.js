const mongoose = require('mongoose');

const pomTrackerSchema = mongoose.Schema({
  name: {type: String, required: true},
  parent: String,
  total: Number
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
