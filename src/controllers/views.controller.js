import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

// GET /views/services -> renderiza el listado de servicios
export const renderServices = async (req, res) => {
  try {
    const services = await servicesService.getServices();
    res.render('services', { services });
  } catch (error) {
    res.status(500).send('Error al cargar los servicios');
  }
};

// GET /views/bookings -> renderiza el listado de reservas (disponibilidad)
export const renderBookings = async (req, res) => {
  try {
    const bookings = await bookingsService.getBookings();
    res.render('bookings', { bookings });
  } catch (error) {
    res.status(500).send('Error al cargar las reservas');
  }
};

// GET /views/bookings/:bid -> renderiza el detalle de una reserva puntual
export const renderBookingDetail = async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingsService.getBookingById(bid);

    if (!booking) {
      return res.status(404).send('Reserva no encontrada');
    }

    res.render('booking-detail', { booking });
  } catch (error) {
    res.status(500).send('Error al cargar la reserva');
  }
};

export const viewsController = {
  renderServices,
  renderBookings,
  renderBookingDetail,
};