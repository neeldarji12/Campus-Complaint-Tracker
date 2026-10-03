const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('../models/Complaint');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config();

const sampleComplaints = [
  {
    studentName: 'Aarav Patel',
    email: 'aarav.patel@campus.edu',
    title: 'Broken Projector in Lecture Hall 3',
    description: 'The ceiling projector is flickering constantly and shuts down after 10 minutes of usage.',
    category: 'Infrastructure',
    priority: 'High',
    location: 'Lecture Hall 3, Block A',
    status: 'Open'
  },
  {
    studentName: 'Sneha Sharma',
    email: 'sneha.sharma@campus.edu',
    title: 'Wi-Fi Connection Dropping in Library 2nd Floor',
    description: 'Students are unable to access research journals due to intermittent Wi-Fi drops on the 2nd floor.',
    category: 'IT',
    priority: 'Medium',
    location: 'Central Library, 2nd Floor',
    status: 'In Progress'
  },
  {
    studentName: 'Rohan Verma',
    email: 'rohan.verma@campus.edu',
    title: 'Water Cooler Leakage near Cafeteria',
    description: 'There is continuous water spillage from the drinking water cooler creating slipping hazard.',
    category: 'Cleanliness',
    priority: 'Low',
    location: 'Main Cafeteria Entrance',
    status: 'Resolved'
  },
  {
    studentName: 'Ananya Iyer',
    email: 'ananya.iyer@campus.edu',
    title: 'Faulty Emergency Exit Door Lock',
    description: 'Emergency exit door lock on Ground Floor Block C gets jammed and does not open smoothly.',
    category: 'Security',
    priority: 'High',
    location: 'Ground Floor, Block C',
    status: 'Open'
  },
  {
    studentName: 'Kunal Joshi',
    email: 'kunal.joshi@campus.edu',
    title: 'Lab 4 Desktop Computer Monitor Flickering',
    description: 'System #18 monitor in Computer Lab 4 has severe screen artifacts and color distortion.',
    category: 'IT',
    priority: 'Low',
    location: 'Computer Lab 4, IT Block',
    status: 'Open'
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log(' Clearing existing complaints...');
    await Complaint.deleteMany({});

    console.log(' Inserting sample complaints...');
    const createdComplaints = await Complaint.insertMany(sampleComplaints);

    console.log(` Successfully seeded ${createdComplaints.length} sample complaints!`);
    console.table(
      createdComplaints.map(c => ({
        ID: c._id.toString(),
        Title: c.title.substring(0, 30) + '...',
        Category: c.category,
        Priority: c.priority,
        Status: c.status
      }))
    );

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(` Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
