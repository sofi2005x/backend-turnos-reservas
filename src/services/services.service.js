import { servicesRepository } from '../repositories/services.repository.js';

// Service: acá viven las reglas de negocio, no conoce req/res ni el archivo JSON.
export const servicesService = {
  async getServices() {
    return await servicesRepository.getAll();
  },

  async getServiceById(id) {
    return await servicesRepository.getById(id);
  },

  async createService(data) {
    const { name, description, duration, price, category, available } = data;

    if (
      !name ||
      !description ||
      duration === undefined ||
      price === undefined ||
      !category ||
      available === undefined
    ) {
      throw new Error('Faltan campos obligatorios para crear el servicio');
    }

    return await servicesRepository.create({ name, description, duration, price, category, available });
  },

  async updateService(id, data) {
    // Regla de negocio: el id nunca puede modificarse, aunque venga en el body
    const { id: idFromBody, ...allowedChanges } = data;
    return await servicesRepository.update(id, allowedChanges);
  },

  async deleteService(id) {
    return await servicesRepository.delete(id);
  },
};