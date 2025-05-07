const statesData = require('../models/statesData.json');

// Create array of valid state codes (e.g., ['KS', 'NE', 'TX', ...])
const validCodes = statesData.map(state => state.code.toUpperCase());

const validateState = (req, res, next) => {
    const code = req.params.state.toUpperCase();

    if (!validCodes.includes(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    // Attach to req object so controllers can use it
    req.stateCode = code;
    next();
};

module.exports = validateState;