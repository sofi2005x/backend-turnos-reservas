import { servicesDao } from '../dao/services.dao.js';
//mismo patron que el service
//El repository es quien onoce al DAO y por eso lo importa , es el intermediario entre el service y el DAO. El service no conoce al DAO, solo al repository. El controller no conoce al DAO, solo al service. El DAO no conoce a nadie, solo sabe leer y escribir en el archivo JSON.



// Repository: intermediario. Hoy solo delega al DAO, pero es el lugar
// Dónde en el futuro se decide qué DAO usar (FileSystem o MongoDB).

export const servicesRepository = {
  async getAll() { //obtiene todos los servicios, delegando la tarea al DAO
    return await servicesDao.getAll();
  },
  async getById(id) {
    return await servicesDao.getById(id);
  },
  async create(data) { //Acá recibe el data del service limpio con los 6 campos que recibio antes del controller, y lo pasa al DAO para que lo escriba en el JSON
    return await servicesDao.create(data); //llama en cada uno a una funcion del DAO
  },
  async update(id, data) {
    return await servicesDao.update(id, data);
  },
  async delete(id) {
    return await servicesDao.delete(id);
  },
};