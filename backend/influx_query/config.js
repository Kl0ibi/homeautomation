require('dotenv').config();

module.exports = {
    influx: {
        url: process.env.INFLUX_URL,
        token: process.env.INFLUX_TOKEN,
        org: process.env.INFLUX_ORG,
        bucket: process.env.INFLUX_BUCKET
    },
    server: {
        port: process.env.PORT || 3000
    }
};
