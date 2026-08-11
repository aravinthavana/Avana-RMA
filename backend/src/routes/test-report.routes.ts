import { Router } from 'express';
import * as testReportController from '../controllers/test-report.controller';
import requireAuth from '../middleware/auth.middleware';

const router = Router();

// Require authentication for all test report routes
router.use(requireAuth);

router.post('/', testReportController.createTestReport);
router.get('/service-cycle/:serviceCycleId', testReportController.getTestReportByServiceCycleId);
router.put('/:id', testReportController.updateTestReport);
router.delete('/:id', testReportController.deleteTestReport);

export default router;
