const statesData = require('../model/statesData.json');
const State = require('../model/State'); 

const validateState = (req, res, next) => {
    const code = req.params.stateCode?.toUpperCase();
    const state = statesData.find(st => st.code === code);

    if (!state) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    req.stateCode = code;
    req.stateName = state.state;
    next();
};

const getAllStates = async (req, res) => {
    let states = [...statesData];

    const contig = req.query.contig;
    if (contig === 'true') {
        states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (contig === 'false') {
        states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    const funfactsData = await State.find();

    const statesWithFunFacts = states.map(state => {
        const found = funfactsData.find(dbState => dbState.stateCode === state.code);
        return found ? { ...state, funfacts: found.funfacts } : state;
    });

    res.json(statesWithFunFacts);
};

const getState = async (req, res) => {
    const code = req.stateCode;
    const state = statesData.find(st => st.code === code);
    if (!state) return res.status(404).json({ message: 'State not found' });

    const dbState = await State.findOne({ stateCode: code });
    if (dbState) state.funfacts = dbState.funfacts;

    res.json(state);
};


const getFunFact = async (req, res) => {
    try {
        const dbState = await State.findOne({ stateCode: req.stateCode }).exec();

        if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${req.stateName}` });
        }

        const randomIndex = Math.floor(Math.random() * dbState.funfacts.length);
        res.json({ funfact: dbState.funfacts[randomIndex] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const getCapital = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, capital: state.capital_city });
};


const getNickname = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, nickname: state.nickname });
};


const getPopulation = (req, res) => {
    const code = req.stateCode; 
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);


    const formattedPopulation = state.population.toLocaleString('en-US');

    res.json({ state: state.state, population: formattedPopulation });
};

const getAdmission = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

    res.json({ state: state.state, admitted: state.admission_date });
};

const addFunFact = async (req, res) => {
    const code = req.stateCode; 
    const { funfacts } = req.body;

    if (!funfacts) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404);

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

    if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
}

if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ message: 'State fun fact value required' });
}

    const state = statesData.find(st => st.code === code);
    if (!state) return res.sendStatus(404); 

    try {
        const dbState = await State.findOne({ stateCode: code }).exec();

        if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
            return res.status(404).json({ message: 'No Fun Facts found for ' + state.state });
        }

        const factIndex = index - 1; 

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
    if (!state) return res.sendStatus(404); 

    try {
        const dbState = await State.findOne({ stateCode: code }).exec();

        if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
            return res.status(404).json({ message: 'No Fun Facts found for ' + state.state });
        }

        const factIndex = index - 1; 

        if (factIndex < 0 || factIndex >= dbState.funfacts.length) {
            return res.status(400).json({ message: 'No Fun Fact found at that index for ' + state.state });
        }

        dbState.funfacts.splice(factIndex, 1); 
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
    addFunFact,
    updateFunFact,
    deleteFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission
  };