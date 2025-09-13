const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations and routes
const connectDB = require('./utils/database');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const assessmentRoutes = require('./routes/assessments');
const uploadRoutes = require('./routes/uploads');
const analyticsRoutes = require('./routes/analytics');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
