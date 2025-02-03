const express = require('express');
const { queryAllPVFields, queryAllGridFields } = require('../influx');

const router = express.Router();


// Helper function to get the start of the requested day
const getDayStart = (day) => {
    const date = new Date(day);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
};

// Endpoint to get all fields within the given day
router.get('/pv/:day?', async (req, res) => {
    try {
        const day = req.params.day || new Date().toISOString().split('T')[0]; // Default to today's date if no parameter
        const start_time = getDayStart(day);
        const stop_time = new Date(start_time);
        stop_time.setDate(stop_time.getDate() + 1); // End of the day (24 hours later)

        const fields = await queryAllPVFields(start_time, stop_time.toISOString());

        res.json({ fields });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


router.get('/grid/:day?', async (req, res) => {
    try {
        const day = req.params.day || new Date().toISOString().split('T')[0]; // Default to today's date if no parameter
        const start_time = getDayStart(day);
        const stop_time = new Date(start_time);
        stop_time.setDate(stop_time.getDate() + 1); // End of the day (24 hours later)

        const fields = await queryAllGridFields(start_time, stop_time.toISOString());

        res.json({ fields });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;
