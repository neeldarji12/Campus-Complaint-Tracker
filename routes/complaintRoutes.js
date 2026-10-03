const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController');

// Routes mapped to controllers
router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(deleteComplaint);

router.route('/:id/status')
  .patch(updateComplaintStatus);

module.exports = router;
