const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');
const validateState = require('../../middleware/validState');

// Base GET routes
router.get('/:state', validateState, statesController.getState);

router.patch('/:state/funfact', validateState, statesController.updateFunFact);
router.delete('/:state/funfact', validateState, statesController.deleteFunFact);

router.post('/:state/funfact', validateState, statesController.addFunFact);
router.get('/', statesController.getAllStates);
router.get('/:state', statesController.getState);
router.get('/:state/funfact', statesController.getFunFact);
router.get('/:state/capital', statesController.getCapital);
router.get('/:state/nickname', statesController.getNickname);
router.get('/:state/population', statesController.getPopulation);
router.get('/:state/admission', statesController.getAdmission);
router.patch('/:state/funfact', statesController.updateFunFact);
router.delete('/:state/funfact', statesController.deleteFunFact);

module.exports = router;