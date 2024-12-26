require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const agentRoutes = require('./routes/agentRoutes')
const claimsRoutes = require('./routes/claimsRoutes')
const dashRoutes = require('./routes/dashRoutes')
const consultationRoutes = require('./routes/consultationRoutes')
const propertyRoutes = require('./routes/propertyRoutes');
const app = express();
const mongoose = require('mongoose');

// Basic middleware
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));

const mongoUri = 'mongodb+srv://abdessamad2002:EZ2wvUbKDFlam0YU@cluster0.1si7w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&ssl=true';


mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'MonService' // specify your database name here
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
// Routes


app.get('/health', (req, res) => {
  res.status(200).send('healthy');
});



// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/dashboard/', dashRoutes);
app.use('/api/title-consultations/', consultationRoutes);
app.use('/api/property', propertyRoutes);




// Start server
const PORT = process.env.PORT || 6500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;