const statesData = require('../models/statesData.json');
const State = require('../model/State'); // Mongoose model

// Helper: merge fun facts from MongoDB
const addFunFacts = async (states) => {
    return Promise.all(states.map(async state => {
        const mongoState = await State.findOne({ stateCode: state.code }).exec();
        if (mongoState && mongoState.funfacts && mongoState.funfacts.length) {
            return { ...state, funfacts: mongoState.funfacts };
        }
        return state;
    }));
};

// GET /states
const getAllStates = async (req, res) => {
    let result = statesData;

    if (req.query.contig === 'true') {
        result = result.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query.contig === 'false') {
        result = result.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    result = await addFunFacts(result);
    res.json(result);
};

// GET /states/:state
const getState = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    const mongoState = await State.findOne({ stateCode: code }).exec();
    if (mongoState && mongoState.funfacts?.length) {
        state.funfacts = mongoState.funfacts;
    }

    res.json(state);
};

// GET /states/:state/funfact
const getFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    const mongoState = await State.findOne({ stateCode: code }).exec();
    if (!mongoState || !mongoState.funfacts?.length) {
        return res.json({ message: `No Fun Facts found for ${code}` });
    }

    const random = mongoState.funfacts[Math.floor(Math.random() * mongoState.funfacts.length)];
    res.json({ funfact: random });
};

// GET /states/:state/capital
const getCapital = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, capital: state.capital_city });
};

// GET /states/:state/nickname
const getNickname = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, nickname: state.nickname });
};

// GET /states/:state/population
const getPopulation = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, population: state.population });
};

// GET /states/:state/admission
const getAdmission = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, admitted: state.admission_date });
};

const addStateFunFacts = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { funfacts } = req.body;

    if (!funfacts || !Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value required and must be an array' });
    }

    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404); // State code invalid

    try {
        let dbState = await State.findOne({ stateCode: code }).exec();

        if (!dbState) {
            dbState = await State.create({ stateCode: code, funfacts });
        } else {
            dbState.funfacts.push(...funfacts);
            await dbState.save();
        }

        res.status(201).json(dbState);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { index, funfact } = req.body;

    if (!index || !funfact) {
        return res.status(400).json({ message: 'State fun fact index and value are required' });
    }

    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404); // Invalid state code

    try {
        const dbState = await State.findOne({ stateCode: code }).exec();

        if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
            return res.status(404).json({ message: 'No Fun Facts found for ' + state.state });
        }

        const factIndex = index - 1; // Adjust for zero-based array

        if (factIndex < 0 || factIndex >= dbState.funfacts.length) {
            return res.status(400).json({ message: 'No Fun Fact found at that index for ' + state.state });
        }

        dbState.funfacts[factIndex] = funfact;
        await dbState.save();

        res.json(dbState);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { index } = req.body;

    if (!index) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404); // Invalid state code

    try {
        const dbState = await State.findOne({ stateCode: code }).exec();

        if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
            return res.status(404).json({ message: 'No Fun Facts found for ' + state.state });
        }

        const factIndex = index - 1; // Convert to zero-based index

        if (factIndex < 0 || factIndex >= dbState.funfacts.length) {
            return res.status(400).json({ message: 'No Fun Fact found at that index for ' + state.state });
        }

        dbState.funfacts.splice(factIndex, 1); // Remove the fun fact
        await dbState.save();

        res.json(dbState);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllStates,
    getState,
    getFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    addStateFunFacts,
    updateFunFact,
    deleteFunFact
};