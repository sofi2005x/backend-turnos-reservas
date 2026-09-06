import { Router } from 'express';
import { renderServices, renderBookings, renderBookingDetail } from '../controllers/views.controller.js';

const router = Router();

router.get('/services', renderServices);
router.get('/bookings', renderBookings); // -> bookings.handlebars (lista)
router.get('/bookings/:bid', renderBookingDetail); // -> booking-detail.handlebars (una sola)

export default router;