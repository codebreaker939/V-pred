const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const admin = require('firebase-admin'); // Import firebase-admin
const Vehicle = require('../models/Vehicle.js');
const Telemetry = require('../models/Telemetry.js');
const PriorityQueue = require('../utils/PriorityQueue.js');

// @route   GET /api/predict/:vehicleId
router.get('/predict/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const vehicle = await Vehicle.findOne({ vehicleId: vehicleId });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const statsResult = await Telemetry.aggregate([
            // ... (aggregation pipeline is unchanged)
            { $match: { vehicle: new mongoose.Types.ObjectId(vehicle._id) } },
            { $sort: { timestamp: -1 } },
            { $limit: 100 },
            {
                $group: {
                    _id: "$vehicle",
                    avgTemp: { $avg: "$engineTemp" },
                    maxTemp: { $max: "$engineTemp" },
                    avgPressure: { $avg: "$tirePressure" },
                    minPressure: { $min: "$tirePressure" },
                    readingCount: { $sum: 1 }
                }
            }
        ]);

        const stats = statsResult[0];
        const predictionQueue = new PriorityQueue();

        if (stats && stats.readingCount > 2) {
            if (stats.maxTemp > 105) {
                predictionQueue.enqueue({
                    title: 'Critical: Engine Overheating',
                    details: `Engine reached a max temp of ${stats.maxTemp.toFixed(2)}°C. Immediate inspection required.`
                }, 1);
            }
            if (stats.minPressure < 30) {
                 predictionQueue.enqueue({
                    title: 'Warning: Low Tire Pressure',
                    details: `Tires reached a minimum pressure of ${stats.minPressure.toFixed(2)} PSI. Check and inflate.`
                }, 2);
            }
        }
        
        const prioritizedPredictions = [];
        while (!predictionQueue.isEmpty()) {
            prioritizedPredictions.push(predictionQueue.dequeue().element);
        }

        // --- NEW: Write the final predictions to Firebase Realtime Database ---
        if (prioritizedPredictions.length > 0) {
            const db = admin.database();
            const ref = db.ref(`alerts/${vehicleId}`); // Create a path for this vehicle's alerts
            await ref.set(prioritizedPredictions);
            console.log(`Alerts for ${vehicleId} have been written to Firebase!`);
        }

        res.status(200).json({
            vehicleId: vehicle.vehicleId,
            stats: stats || {},
            predictions: prioritizedPredictions
        });

    } catch (error) {
        console.error('Error generating predictions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;