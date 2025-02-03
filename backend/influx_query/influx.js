const { InfluxDB } = require('@influxdata/influxdb-client');
const config = require('./config');

const influxDB = new InfluxDB({ url: config.influx.url, token: config.influx.token });
const queryApi = influxDB.getQueryApi(config.influx.org);

const queryEnergySum = async (field, onlyNegative = false, onlyPositive = false, startTime, stopTime) => {
    const formattedStartTime = new Date(startTime).toISOString();
    const formattedStopTime = new Date(stopTime).toISOString();

    let query = `
        from(bucket: "${config.influx.bucket}")
        |> range(start: ${formattedStartTime}, stop: ${formattedStopTime})
        |> filter(fn: (r) => r["_measurement"] == "power_data")
        |> filter(fn: (r) => r["_field"] == "${field}")
    `;
    if (onlyNegative) {
        query += `|> filter(fn: (r) => r["_value"] < 0)`;
    } else if (onlyPositive) {
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

const queryAllPVFields = async (startTime, stopTime) => {
    const query = `
        from(bucket: "${config.influx.bucket}")
        |> range(start: ${startTime}, stop: ${stopTime})
        |> filter(fn: (r) => r["_measurement"] == "power_data")
        |> filter(fn: (r) => r["_field"] == "p_pv" or r["_field"] == "p_pv1" or r["_field"] == "p_pv2" or r["_field"] == "p_grid" or r["_field"] == "p_bat" or r["_field"] == "sl_power" or r["_field"] == "p_load" or r["_field"] == "soc" or r["_field"] == "boiler_temp")
        |> keep(columns: ["_field", "_value", "_time"])
    `;

    let fields = {};
    await queryApi.collectRows(query)
    .then(rows => {
        rows.forEach(row => {
            if (row._field && row._value !== undefined) {
                // Initialize the field entry if not already present
                if (!fields[row._field]) {
                    fields[row._field] = [];
                }
                // Push the value for this field
                fields[row._field].push({ time: row._time, value: row._value });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching rows:', error);
    });

    return fields;
};


const queryAllGridFields = async (startTime, stopTime) => {
    const query = `
        from(bucket: "${config.influx.bucket}")
        |> range(start: ${startTime}, stop: ${stopTime})
        |> filter(fn: (r) => r["_measurement"] == "power_data")
        |> filter(fn: (r) => r["_field"] == "i_l1" or r["_field"] == "i_l2" or r["_field"] == "i_l3" or r["_field"] == "u_l1" or r["_field"] == "u_l2" or r["_field"] == "u_l3" or r["_field"] == "freq")
        |> keep(columns: ["_field", "_value", "_time"])
    `;

    let fields = {};
    await queryApi.collectRows(query)
    .then(rows => {
        rows.forEach(row => {
            if (row._field && row._value !== undefined) {
                // Initialize the field entry if not already present
                if (!fields[row._field]) {
                    fields[row._field] = [];
                }
                // Push the value for this field
                fields[row._field].push({ time: row._time, value: row._value });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching rows:', error);
    });

    return fields;
};


module.exports = { queryEnergySum, queryAllPVFields, queryAllGridFields };
