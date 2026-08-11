// Importación de dependencias de Servicios
import { servicesDao } from '../dao/services.dao.js';
import { servicesRepository } from '../repositories/services.repository.js';
import { servicesService } from '../services/services.service.js';
import { servicesController } from '../controllers/services.controller.js';

// Importación de dependencias de Reservas/Bookings
import { bookingsDao } from '../dao/bookings.dao.js';
import { bookingsRepository } from '../repositories/bookings.repository.js';
import { bookingsService } from '../services/bookings.service.js';
import { bookingsController } from '../controllers/bookings.controller.js';

// Exportación desestructurada de métodos de Services
export const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = servicesController;

// Exportación desestructurada de métodos de Bookings
export const {
  createBooking,
  getBookingById,
  addServiceToBooking,
} = bookingsController;

// Exportación opcional de los controladores completos
export { servicesController, bookingsController };