import express from 'express';
import { templateController } from '../controllers/template.controller';
import authenticate from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate); // Require authentication

// Test Steps
router.get('/test-steps', templateController.getTestSteps);
router.get('/test-steps/:articleNo', templateController.getTestSteps);
router.post('/test-steps', templateController.createTestStep);
router.put('/test-steps/:id', templateController.updateTestStep);
router.delete('/test-steps/:id', templateController.deleteTestStep);

// Equipment
router.get('/equipment', templateController.getEquipment);
router.post('/equipment', templateController.createEquipment);
router.put('/equipment/:id', templateController.updateEquipment);
router.delete('/equipment/:id', templateController.deleteEquipment);

export default router;
