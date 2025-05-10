const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');
const validateState = require('../../middleware/validState');

// GET all states (no validation needed)
router.get('/', statesController.getAllStates);

// Routes that need state validation middleware
router.route('/:state').get(validateState, statesController.getState);

router.route('/:state/funfact')
    .get(validateState, statesController.getFunFact)
    .patch(validateState, statesController.updateFunFact)
    .delete(validateState, statesController.deleteFunFact);

router.get('/:state/capital', validateState, statesController.getCapital);
router.get('/:state/nickname', validateState, statesController.getNickname);
router.get('/:state/population', validateState, statesController.getPopulation);
router.get('/:state/admission', validateState, statesController.getAdmission);

router.post('/:state/funfact', validateState, statesController.addFunFact);

module.exports = router;