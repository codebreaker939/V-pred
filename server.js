require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-key.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(express.static('public')); 



const vehicleRoutes = require('./routes/vehicleRoutes.js');
const telemetryRoutes = require('./routes/telemetryRoutes.js');
const predictionRoutes = require('./routes/predictionRoutes.js');


app.use('/api', vehicleRoutes);
app.use('/api', telemetryRoutes);
app.use('/api', predictionRoutes);


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vehiclepredictor-default-rtdb.firebaseio.com/"
  });
console.log('Firebase Admin SDK initialized successfully. 🔥');


const startServer = async () => {
    try {
      console.log('SERVER IS CONNECTING TO THIS DATABASE:', process.env.MONGO_URI);
      console.log('Attempting to connect to MongoDB URI:', process.env.MONGO_URI);
  
     
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Successfully connected to MongoDB! 🍃');
  
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
  
    } catch (error) {
      console.error('Failed to connect to the database or start server ❌:', error);
      process.exit(1);
    }
  };
startServer();