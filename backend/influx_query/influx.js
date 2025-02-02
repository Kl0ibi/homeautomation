const { InfluxDB } = require('@influxdata/influxdb-client');
const config = require('./config');

const influxDB = new InfluxDB({ url: config.influx.url, token: config.influx.token });
const queryApi = influxDB.getQueryApi(config.influx.org);

const queryEnergySum = async (field, onlyNegative = false, onlyPositive = false, startTime, stopTime) => {
    let query = `
        from(bucket: "${config.influx.bucket}")
        |> range(start: ${startTime}, stop: ${stopTime})
        |> filter(fn: (r) => r["_measurement"] == "power_data")
        |> filter(fn: (r) => r["_field"] == "${field}")
    `;
    if (onlyNegative) {
        query += `|> filter(fn: (r) => r["_value"] < 0)`;
    }
    else if (onlyPositive) {
        query += `|> filter(fn: (r) => r["_value"] > 0)`;
    }
    query += `
        |> integral(unit: 1s)
        |> map(fn: (r) => ({ r with _value: r._value / 3600.0 }))
        |> sum()
    `;
    let totalEnergy = 0;
    await queryApi.collectRows(query, row => {
        if (Array.isArray(row) && row.length > 0) {
            totalEnergy = parseInt(row[row.length - 1]);
        }
    });
    if (onlyNegative) {
        totalEnergy *= -1;
    }

    return totalEnergy || 0;
};

module.exports = { queryEnergySum };
