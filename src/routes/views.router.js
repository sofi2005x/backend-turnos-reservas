import { Router } from 'express';
import { renderServices, renderBookings, renderBookingDetail } from '../controllers/views.controller.js';

const router = Router();

router.get('/services', renderServices);
router.get('/bookings', renderBookings);
router.get('/bookings/:bid', renderBookingDetail);

export default router;