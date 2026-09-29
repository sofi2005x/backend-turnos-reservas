import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  addServiceToBooking,
  deleteBooking,
} from '../dependencies/index.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  bookingIdParamSchema,
  bookingServiceParamsSchema,
} from '../validations/booking.validation.js';

const router = Router();

router.get('/', getBookings);
router.get('/:bid', validateParams(bookingIdParamSchema), getBookingById);
router.post('/', validateBody(createBookingSchema), createBooking);
router.post('/:bid/services/:sid', validateParams(bookingServiceParamsSchema), addServiceToBooking);
router.delete('/:bid', validateParams(bookingIdParamSchema), deleteBooking);

export default router;