const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved', 'Rejected'];
const ALLOWED_CATEGORIES = ['Infrastructure', 'IT', 'Cleanliness', 'Security', 'Other'];
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];


const createComplaint = async (req, res) => {
  try {
    const { studentName, email, title, description, category, priority, location } = req.body;

    // Validate required fields
    if (!studentName || !email || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentName, email, title, and description'
      });
    }

    // Validate category if provided
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category: "${category}". Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`
      });
    }

    // Validate priority if provided
    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority: "${priority}". Allowed priorities are: ${ALLOWED_PRIORITIES.join(', ')}`
      });
    }

    // Create complaint with default status "Open"
    const complaint = await Complaint.create({
      studentName: studentName.trim(),
      email: email.trim(),
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      priority: priority || 'Medium',
      location: location ? location.trim() : 'General Campus',
      status: 'Open'
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      data: complaint
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating complaint',
      error: error.message
    });
  }
};

// @desc    Get all complaints with optional filtering and search
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Case-insensitive search on title or studentName
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { studentName: searchRegex }
      ];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints',
      error: error.message
    });
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Public
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid complaint ID format: "${id}"`
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching complaint',
      error: error.message
    });
  }
};

// @desc    Update complaint details
// @route   PUT /api/complaints/:id
// @access  Public
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid complaint ID format: "${id}"`
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID: ${id}`
      });
    }

    const { studentName, email, title, description, category, priority, location, status } = req.body;

    // Validate category if provided
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category: "${category}". Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`
      });
    }

    // Validate priority if provided
    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority: "${priority}". Allowed priorities are: ${ALLOWED_PRIORITIES.join(', ')}`
      });
    }

    // Validate status if provided
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: "${status}". Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    // Apply updates
    if (studentName !== undefined) complaint.studentName = studentName.trim();
    if (email !== undefined) complaint.email = email.trim();
    if (title !== undefined) complaint.title = title.trim();
    if (description !== undefined) complaint.description = description.trim();
    if (category !== undefined) complaint.category = category;
    if (priority !== undefined) complaint.priority = priority;
    if (location !== undefined) complaint.location = location.trim();
    if (status !== undefined) complaint.status = status;

    const updatedComplaint = await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating complaint',
      error: error.message
    });
  }
};

// @desc    Update complaint status only
// @route   PATCH /api/complaints/:id/status
// @access  Public
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid complaint ID format: "${id}"`
      });
    }

    // Validate status presence
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required in request body'
      });
    }

    // Validate allowed status values
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value "${status}". Allowed values are: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID: ${id}`
      });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to "${status}" successfully`,
      data: updatedComplaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating complaint status',
      error: error.message
    });
  }
};

// @desc    Delete a complaint

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid complaint ID format: "${id}"`
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID: ${id}`
      });
    }

    await complaint.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting complaint',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint
};
