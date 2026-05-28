const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
      default: 'TODO'
    },

    dueDate: {
      type: Date
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// clean JSON output
taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;