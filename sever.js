require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const confessionsRoutes = require('./routes/confessions');
const adminRoutes = require('./routes/admin');
const moderatorRoutes = require('./routes/moderator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/auth', authRoutes);
app.use('/session', sessionsRoutes);
app.use('/confession', confessionsRoutes);
app.use('/feed', confessionsRoutes); // Public feed route
app.use('/frixai', confessionsRoutes); // AI route
app.use('/admin', adminRoutes);
app.use('/moderator', moderatorRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('FrixConfessions Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
