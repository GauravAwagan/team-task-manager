const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER'],
      default: 'MEMBER'
    }
  },
  {
    timestamps: true
  }
);

// clean output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;