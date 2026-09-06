import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

// GET /views/services -> renderiza el listado de servicios con filtros y paginación
export const renderServices = async (req, res) => {
  try {
    const { category, available, page, limit, sortBy, order } = req.query;
    const result = await servicesService.getServices({
      category,
      available,
      page,
      limit: limit || 6,
      sortBy,
      order,
    });
    const servicesList = result.services || [];
    const services = servicesList.map(s => (s.toObject ? s.toObject() : s));

    const currentPage = result.pagination.page;
    const prevPage = result.pagination.hasPrevPage ? currentPage - 1 : null;
    const nextPage = result.pagination.hasNextPage ? currentPage + 1 : null;

    // Construir URLs de paginación manteniendo los filtros activos
    const buildUrl = (pageNum) => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (available !== undefined && available !== '') params.set('available', available);
      if (sortBy) params.set('sortBy', sortBy);
      if (order) params.set('order', order);
      params.set('page', pageNum);
      return `/views/services?${params.toString()}`;
    };

    res.render('services', {
      services,
      pagination: {
        ...result.pagination,
        prevLink: prevPage ? buildUrl(prevPage) : null,
        nextLink: nextPage ? buildUrl(nextPage) : null,
      },
      filters: {
        category: category || '',
        available: available || '',
        sortBy: sortBy || 'name',
        order: order || 'asc',
      },
    });
  } catch (error) {
    console.error("Error al renderizar servicios:", error);
    res.status(500).send('Error al cargar los servicios');
  }
};

// GET /views/bookings -> renderiza el listado de reservas (disponibilidad)
export const renderBookings = async (req, res) => {
  try {
    const bookingsData = await bookingsService.getBookings();
    const bookings = (bookingsData || []).map(b => (b.toObject ? b.toObject() : b));
    res.render('bookings', { bookings });
  } catch (error) {
    console.error("Error al renderizar reservas:", error);
    res.status(500).send('Error al cargar las reservas');
  }
};

// GET /views/bookings/:bid -> renderiza el detalle de una reserva puntual
export const renderBookingDetail = async (req, res) => {
  try {
    const { bid } = req.params;
    const bookingDoc = await bookingsService.getBookingById(bid);

    if (!bookingDoc) {
      return res.status(404).send('Reserva no encontrada');
    }

    const booking = bookingDoc.toObject ? bookingDoc.toObject() : bookingDoc;
    res.render('booking-detail', { booking });
  } catch (error) {
    console.error("Error al renderizar detalle de reserva:", error);
    res.status(500).send('Error al cargar la reserva');
  }
};

export const viewsController = {
  renderServices,
  renderBookings,
  renderBookingDetail,
};