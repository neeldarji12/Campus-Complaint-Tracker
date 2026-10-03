const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Welcome / Health Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Complaint Tracker API',
    endpoints: {
      createComplaint: 'POST /api/complaints',
      getAllComplaints: 'GET /api/complaints',
      filterComplaints: 'GET /api/complaints?status=&category=&priority=&search=',
      getComplaintById: 'GET /api/complaints/:id',
      updateComplaint: 'PUT /api/complaints/:id',
      updateComplaintStatus: 'PATCH /api/complaints/:id/status',
      deleteComplaint: 'DELETE /api/complaints/:id'
    }
  });
});

// Mount Routes
app.use('/api/complaints', complaintRoutes);

// Catch-all 404 Route for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(` API Base URL: http://localhost:${PORT}/api/complaints`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = { app, server };
