import { bookingsRepository } from '../repositories/bookings.repository.js';
import { servicesRepository } from '../repositories/services.repository.js';

export const bookingsService = {
  async createBooking(data) {
    const { clientName, clientEmail, date, time, status, services } = data;

    if (!clientName || !clientEmail || !date || !time) {
      throw new Error('Campos obligatorios faltantes: clientName, clientEmail, date, time');
    }

    const newBooking = {
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pending',
      services: Array.isArray(services) ? services : [],
    };

    return await bookingsRepository.create(newBooking);
  },

  async getBookingById(id) {
    return await bookingsRepository.getById(id);
  },

  async addServiceToBooking(bookingId, serviceId) {
    const booking = await bookingsRepository.getById(bookingId);
    if (!booking) {
      return null;
    }

    // regla de negocio: el servicio debe existir antes de agregarlo
    const service = await servicesRepository.getById(serviceId);
    if (!service) {
      throw new Error(`No existe un servicio con id ${serviceId}`);
    }

    // CAMBIO 1: No convertir a número, trabajar con ObjectId
    // const numericServiceId = Number(serviceId);  // BORRAR ESTA LÍNEA

    // CAMBIO 2: Comparar ObjectIds correctamente
    const existingService = booking.services.find((item) => 
      item.service.toString() === serviceId
    );

    // regla de negocio: si el servicio ya estaba, se incrementa quantity en vez de duplicar
    if (existingService) {
      existingService.quantity += 1;
    } else {
      booking.services.push({ service: serviceId, quantity: 1 });
    }

    // CAMBIO 3: Con Mongoose es _id, no id
    return await bookingsRepository.update(booking._id, { services: booking.services });
  },
};