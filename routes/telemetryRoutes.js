const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle.js');
const Telemetry = require('../models/Telemetry.js');

router.post('/telemetry', async (req, res) => {
  try {
    const { vehicleId, engineTemp, tirePressure, oilLevel, location } = req.body;

   
    const vehicle = await Vehicle.findOne({ vehicleId: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ message: `Vehicle with ID ${vehicleId} not found.` });
    }

   
    const newTelemetry = new Telemetry({
      vehicle: vehicle._id, 
      engineTemp,
      tirePressure,
      oilLevel,
      location
    });

    const savedTelemetry = await newTelemetry.save();
    res.status(201).json(savedTelemetry);
  } catch (error) {
    res.status(400).json({ message: 'Error ingesting telemetry data', error });
  }
});

module.exports = router;