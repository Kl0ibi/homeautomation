const express = require('express');
const cors = require('cors');
const config = require('./config');
const energyRoutes = require('./routes/energy_routes');
const fieldsRoutes = require('./routes/all_fields_routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/energy', energyRoutes);
app.use('/day', fieldsRoutes);

app.listen(config.server.port, () => {
    console.log(`Server running at http://localhost:${config.server.port}`);
});
