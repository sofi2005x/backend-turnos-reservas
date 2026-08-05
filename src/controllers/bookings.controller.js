import { bookingsService } from '../services/bookings.service.js';

// POST /api/bookings -> crea una reserva (puede iniciarse con services vacío)
export const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingsService.createBooking(req.body);
    res.status(201).json({ status: 'success', payload: newBooking });
  } catch (error) {
    // el service tira Error() si faltan clientName, clientEmail, date o time
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// GET /api/bookings/:bid -> devuelve una reserva puntual por id
export const getBookingById = async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingsService.getBookingById(bid);

    if (!booking) {
      return res.status(404).json({ status: 'error', message: `No se encontró una reserva con id ${bid}` });
    }

    res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener la reserva' });
  }
};

// POST /api/bookings/:bid/services/:sid -> agrega un servicio a una reserva existente
// (addServiceToBooking valida la existencia del servicio internamente, vía ServiceManager)
export const addServiceToBooking = async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const updatedBooking = await bookingsService.addServiceToBooking(bid, sid);

    if (!updatedBooking) {
      return res.status(404).json({ status: 'error', message: `No se encontró una reserva con id ${bid}` });
    }

    res.status(200).json({ status: 'success', payload: updatedBooking });
  } catch (error) {
    // el service tira Error() si el servicio (sid) no existe en services.json
    res.status(404).json({ status: 'error', message: error.message });
  }
};