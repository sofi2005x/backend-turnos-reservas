import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../dependencies/index.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
  serviceIdParamSchema,
} from '../validations/service.validation.js';

const router = Router();

router.get('/', validateQuery(getServicesQuerySchema), getServices);
router.get('/:sid', validateParams(serviceIdParamSchema), getServiceById);
router.post('/', validateBody(createServiceSchema), createService);
router.put('/:sid', validateParams(serviceIdParamSchema), validateBody(updateServiceSchema), updateService);
router.delete('/:sid', validateParams(serviceIdParamSchema), deleteService);

export default router;