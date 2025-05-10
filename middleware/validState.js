const statesData = require('../model/statesData.json');

const validCodes = statesData.map(state => state.code.toUpperCase());

const validateState = (req, res, next) => {
    const code = req.params.state.toUpperCase();

    const state = statesData.find(state => state.code === code);
    if (!state) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    req.stateCode = code;
    req.stateName = state.state; 
    next();
};

module.exports = validateState;
