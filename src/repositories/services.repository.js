import { servicesDao } from '../dao/services.dao.js';

// Repository: intermediario. Hoy solo delega al DAO, pero es el lugar
// Dónde en el futuro se decide qué DAO usar (FileSystem o MongoDB).
export const servicesRepository = {
  async getAll() { //obtiene todos los servicios, delegando la tarea al DAO
    return await servicesDao.getAll();
  },
  async getById(id) {
    return await servicesDao.getById(id);
  },
  async create(data) {
    return await servicesDao.create(data); //llama en cada uno a una funcion del DAO
  },
  async update(id, data) {
    return await servicesDao.update(id, data);
  },
  async delete(id) {
    return await servicesDao.delete(id);
  },
};