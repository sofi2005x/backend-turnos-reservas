import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  addServiceToBooking,
} from '../dependencies/index.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { createBookingSchema, bookingServiceParamsSchema } from '../validations/booking.validation.js';

const router = Router();

router.post('/', validateBody(createBookingSchema), createBooking);
router.get('/:bid', getBookingById);
router.post('/:bid/services/:sid', validateParams(bookingServiceParamsSchema), addServiceToBooking);

export default router;