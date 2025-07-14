// backend/config/tableConfig.js

// The custom roundUp function is no longer needed. Standard rounding will be used.

// This helper function now uses standard rounding and is simpler.
function calculateMMFloor(row) {
    const cost = parseFloat(row.cost_usd);
    if (!isNaN(cost)) {
        // Standard formula: cost / (1 - 0.15)
        return cost / 0.85;
    }
    return NaN;
}

function calculateListPrice(row) {
    const mhFloorUsd = calculateMMFloor(row);
    if (!isNaN(mhFloorUsd)) {
        // Standard formula: MM Floor * 1.7
        return mhFloorUsd * 1.7;
    }
    return NaN;
}


const DERIVED_COLUMN_CONFIG = {
    // ... (Your other product configs remain the same)

    'international_outbound_rates': [
        {
            name: 'mh_floor_usd',
            formula: (row) => {
                const value = calculateMMFloor(row);
                // Return a formatted string with standard rounding
                return typeof value === 'number' ? value.toFixed(4) : null;
            }
        },
        {
            name: 'mh_floor_margin_percent',
            formula: (row) => {
                const mhFloorUsd = calculateMMFloor(row);
                const cost = parseFloat(row.cost_usd);
                if (!isNaN(mhFloorUsd) && !isNaN(cost) && mhFloorUsd !== 0) {
                    const value = ((mhFloorUsd - cost) / mhFloorUsd) * 100;
                    return `${Math.floor(value)}%`;
                }
                return null;
            }
        },
        {
            name: 'small_volume_list_price_usd',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                // Return a formatted string with standard rounding
                return typeof listPrice === 'number' ? listPrice.toFixed(4) : null;
            }
        },
        {
            name: 'small_volume_margin_percent',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                const cost = parseFloat(row.cost_usd);
                if (!isNaN(listPrice) && !isNaN(cost) && listPrice !== 0) {
                    const value = ((listPrice - cost) / listPrice) * 100;
                    return `${Math.floor(value)}%`;
                }
                return null;
            }
        },
        {
            name: 'cda_floor_price_usd',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                if (!isNaN(listPrice)) {
                    const cdaPrice = listPrice * 0.65;
                    // Return a formatted string with standard rounding
                    return typeof cdaPrice === 'number' ? cdaPrice.toFixed(4) : null;
                }
                return null;
            }
        },
        {
            name: 'cda_floor_margin_percent',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                let cdaPrice;
                if (!isNaN(listPrice)) {
                    cdaPrice = listPrice * 0.65;
                }
                const cost = parseFloat(row.cost_usd);
                if (!isNaN(cdaPrice) && !isNaN(cost) && cdaPrice !== 0) {
                    const value = ((cdaPrice - cost) / cdaPrice) * 100;
                    return `${Math.floor(value)}%`;
                }
                return null;
            }
        },
        {
            name: 'cpaas_high_volumes_floor_usd',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                if (!isNaN(listPrice)) {
                    const cpaasPrice = listPrice * 0.75;
                    // Return a formatted string with standard rounding
                    return typeof cpaasPrice === 'number' ? cpaasPrice.toFixed(4) : null;
                }
                return null;
            }
        },
        {
            name: 'cpaas_high_volumes_margin_percent',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                let cpaasPrice;
                if (!isNaN(listPrice)) {
                    cpaasPrice = listPrice * 0.75;
                }
                const cost = parseFloat(row.cost_usd);
                if (!isNaN(cpaasPrice) && !isNaN(cost) && cpaasPrice !== 0) {
                    const value = ((cpaasPrice - cost) / cpaasPrice) * 100;
                    return `${Math.floor(value)}%`;
                }
                return null;
            }
        },
        {
            name: 'service_provider_medium_volume_floor_usd',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                if (!isNaN(listPrice)) {
                    const spPrice = listPrice * 0.85;
                    // Return a formatted string with standard rounding
                    return typeof spPrice === 'number' ? spPrice.toFixed(4) : null;
                }
                return null;
            }
        },
        {
            name: 'service_provider_medium_volume_margin_percent',
            formula: (row) => {
                const listPrice = calculateListPrice(row);
                let spPrice;
                if (!isNaN(listPrice)) {
                    spPrice = listPrice * 0.85;
                }
                const cost = parseFloat(row.cost_usd);
                if (!isNaN(spPrice) && !isNaN(cost) && spPrice !== 0) {
                    const value = ((spPrice - cost) / spPrice) * 100;
                    return `${Math.floor(value)}%`;
                }
                return null;
            }
        }
    ]
};

function calculateDerivedColumns(tableName, rawData) {
    const derivedColsForTable = DERIVED_COLUMN_CONFIG[tableName] || [];
    if (derivedColsForTable.length === 0) return rawData;
    return rawData.map(row => {
        const newRow = { ...row };
        derivedColsForTable.forEach(derivedCol => {
            newRow[derivedCol.name] = derivedCol.formula(newRow);
        });
        return newRow;
    });
}

module.exports = { calculateDerivedColumns };
