import fs from 'node:fs/promises';

export class BookingManager {
  constructor(filePath, serviceManager) {
    this.path = filePath;
    this.serviceManager = serviceManager; // guardamos la referencia al ServiceManager para poder validar servicios
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
  }

  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time, status, services } = bookingData;

    if (!clientName || !clientEmail || !date || !time) {
      throw new Error('Campos obligatorios faltantes: clientName, clientEmail, date, time');
    }

    const bookings = await this.#readFile();
    const newId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;

    const newBooking = {
      id: newId,
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pending',
      services: Array.isArray(services) ? services : []
    };

    bookings.push(newBooking);
    await this.#writeFile(bookings);
    return newBooking;
  }

  async getBookingById(id) {
    const bookings = await this.#readFile();
    return bookings.find(b => b.id === Number(id)) || null; // Number(id) porque id llega como string desde la URL
  }

  async addServiceToBooking(bookingId, serviceId) {
    const bookings = await this.#readFile();
    const bookingIndex = bookings.findIndex(b => b.id === Number(bookingId)); // Number() acá también

    if (bookingIndex === -1) {
      return null; // la reserva no existe
    }

    // validamos que el servicio exista antes de agregarlo, usando el ServiceManager
    const service = await this.serviceManager.getServiceById(serviceId);
    if (!service) {
      throw new Error(`No existe un servicio con id ${serviceId}`);
    }

    const booking = bookings[bookingIndex];
    const numericServiceId = Number(serviceId); // normalizamos para comparar siempre contra un número

    const existingService = booking.services.find(item => item.service === numericServiceId);

    if (existingService) {
      existingService.quantity += 1;
    } else {
      booking.services.push({ service: numericServiceId, quantity: 1 });
    }

    bookings[bookingIndex] = booking;
    await this.#writeFile(bookings);
    return booking;
  }
}