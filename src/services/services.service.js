import { servicesRepository } from '../repositories/services.repository.js';

export const servicesService = {
  async getServices(queryParams) {
    return await servicesRepository.getAll(queryParams);
  },

  async getServiceById(id) {
    return await servicesRepository.getById(id);
  },

  async createService(data) {
    // La validación de forma (tipos, campos obligatorios) ya la hizo Zod
    // en el middleware, antes de llegar acá. Esta capa se queda solo con
    // reglas de negocio, si en el futuro hay alguna.
    return await servicesRepository.create(data);
  },

  async updateService(id, data) {
    const { id: idFromBody, ...allowedChanges } = data;
    return await servicesRepository.update(id, allowedChanges);
  },

  async deleteService(id) {
    return await servicesRepository.delete(id);
  },
};