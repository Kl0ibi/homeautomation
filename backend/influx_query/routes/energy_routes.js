const express = require('express');
const { queryEnergySum } = require('../influx');

const router = express.Router();

const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
};

router.get('/sum', async (req, res) => {
    try {
        const start_time = req.query.start || getTodayStart();
        const stop_time = req.query.stop || new Date().toISOString();

        const pv1_energy = await queryEnergySum('p_pv1', false, true, start_time, stop_time);
        const pv2_energy = await queryEnergySum('p_pv2', false, true, start_time, stop_time);
        const consumed_energy = await queryEnergySum('p_load', false, true, start_time, stop_time);
        const fed_energy_to_grid = await queryEnergySum('p_grid', true, false, start_time, stop_time);
        const consumed_energy_from_grid = await queryEnergySum('p_grid', false, true, start_time, stop_time);
        const charged_energy = await queryEnergySum('p_bat', true, false, start_time, stop_time);
        const discharged_energy = await queryEnergySum('p_bat', false, true, start_time, stop_time);
        const heated_energy = await queryEnergySum('sl_power', false, true, start_time, stop_time);

        res.json({
            prod_energy_pv1_wh: pv1_energy,
            prod_energy_pv2_wh: pv2_energy,
            cons_energy_wh: consumed_energy,
            fed_energy_to_grid_wh: fed_energy_to_grid,
            cons_energy_from_grid_wh: consumed_energy_from_grid,
            charged_energy_wh: charged_energy,
            discharged_energy_wh: discharged_energy,
            heated_energy_wh: heated_energy
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;
