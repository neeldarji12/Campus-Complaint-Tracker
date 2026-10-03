const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      enum: {
        values: ['Infrastructure', 'IT', 'Cleanliness', 'Security', 'Other'],
        message: '{VALUE} is not a valid category. Allowed values: Infrastructure, IT, Cleanliness, Security, Other'
      },
      default: 'Other'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority. Allowed values: Low, Medium, High'
      },
      default: 'Medium'
    },
    location: {
      type: String,
      trim: true,
      default: 'General Campus'
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved', 'Rejected'],
        message: '{VALUE} is not a valid status. Allowed values: Open, In Progress, Resolved, Rejected'
      },
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);
