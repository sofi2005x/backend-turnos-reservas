import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../dependencies/index.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { createServiceSchema, updateServiceSchema, getServicesQuerySchema } from '../validations/service.validation.js';
const router = Router();

router.get('/', validateQuery(getServicesQuerySchema), getServices);
router.get('/:sid', getServiceById);
router.post('/', validateBody(createServiceSchema), createService);
router.put('/:sid', validateBody(updateServiceSchema), updateService);
router.delete('/:sid', deleteService);

export default router;