import { Router } from 'express';
import { bookingManager } from '../managers/index.js';

const router = Router();

// POST /api/bookings -> crea una reserva (puede iniciarse con services vacío)
router.post('/', async (req, res) => {
  try {
    const newBooking = await bookingManager.createBooking(req.body);
    res.status(201).json({ status: 'success', payload: newBooking });
  } catch (error) {
    // el manager tira Error() si faltan clientName, clientEmail, date o time
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// GET /api/bookings/:bid -> devuelve una reserva puntual por id
router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);

    if (!booking) {
      return res.status(404).json({ status: 'error', message: `No se encontró una reserva con id ${bid}` });
    }

    res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener la reserva' });
  }
});

// POST /api/bookings/:bid/services/:sid -> agrega un servicio a una reserva existente
router.post('/:bid/services/:sid', async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const updatedBooking = await bookingManager.addServiceToBooking(bid, sid);

    if (!updatedBooking) { //404 si no existe la reserva
      return res.status(404).json({ status: 'error', message: `No se encontró una reserva con id ${bid}` });
    }

    res.status(200).json({ status: 'success', payload: updatedBooking });
  } catch (error) {
    // el manager tira Error() si el servicio (sid) no existe en services.json
    res.status(404).json({ status: 'error', message: error.message });
  }
});

export default router;