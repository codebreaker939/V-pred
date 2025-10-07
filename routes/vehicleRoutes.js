const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle.js');

// @route   POST /api/vehicles
// @desc    Create a new vehicle
router.post('/vehicles', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error creating vehicle', error });
  }
});

// --- NEW ROUTE ADDED HERE ---
// @route   GET /api/vehicles
// @desc    Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;