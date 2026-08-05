import { servicesRepository } from '../repositories/services.repository.js';
//service es quien importas el repository (el repository no sabe nada del service) 


// Service: acá viven las reglas de negocio, no conoce req/res ni el archivo JSON.
export const servicesService = {  // esto es un objeto literal con métodos, no una clase
  async getServices() {
    return await servicesRepository.getAll();
  },

  async getServiceById(id) {
    return await servicesRepository.getById(id);
  },

  async createService(data) { //el data es el req.body que viene del controller, que a su vez viene del cliente (postman o front)
    const { name, description, duration, price, category, available } = data;

    if ( //el re.body recibe los datos del cliente, y acá validamos que estén todos los campos obligatorios
      !name ||
      !description ||
      duration === undefined ||
      price === undefined ||
      !category ||
      available === undefined
    ) {
      throw new Error('Faltan campos obligatorios para crear el servicio');
    } //regla de negocio: si falta algún campo obligatorio, tiramos un error. El controller lo va a capturar y devolverá un 400 al cliente.

    return await servicesRepository.create({ name, description, duration, price, category, available });
  }, //solo si paso la validación, llamo al repository para crear el servicio en el JSON

  async updateService(id, data) {
    // Regla de negocio: el id nunca puede modificarse, aunque venga en el body
    const { id: idFromBody, ...allowedChanges } = data;
    return await servicesRepository.update(id, allowedChanges);
  },

  async deleteService(id) {
    return await servicesRepository.delete(id);
  },
};