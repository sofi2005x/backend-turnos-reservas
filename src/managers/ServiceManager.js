import fs from 'fs/promises';

class ServiceManager {
  constructor(path) {
    this.path = path; // Ruta del archivo JSON que este manager administra
  }

  // Métodos privados (#): son detalles internos, nadie fuera de la clase debe llamarlos directo
  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8'); // 'utf-8' obligatorio o devuelve un Buffer
      return JSON.parse(data); // convierte el string JSON a array de JS
    } catch (error) {
      return []; // si el archivo no existe todavía (ENOENT), arrancamos vacío, no explota
    }
  }

  async #writeFile(services) {
    // JSON.stringify(data, null, 2): null = sin replacer, 2 = indentación legible
    await fs.writeFile(this.path, JSON.stringify(services, null, 2), 'utf-8');
  }

  // Devuelve todos los servicios guardados
  async getServices() {
    return this.#readFile();
  }

  // Busca un servicio puntual por id; devuelve null si no existe (según pide el enunciado)
  async getServiceById(id) {
    const services = await this.#readFile();
    const service = services.find(s => s.id === Number(id));
    return service || null;
  }

  // Crea un servicio nuevo, validando que estén todos los campos obligatorios
  async addService(serviceData) {
    const { name, description, duration, price, category, available } = serviceData;

    // Ojo con los "falsy" que SÍ son valores válidos de negocio:
    // - available === false es válido -> se valida con "=== undefined", no con "!available"
    // - duration === 0 o price === 0 son técnicamente válidos -> se valida con "=== undefined/null", no con "!duration"/"!price"
    // name, description y category sí pueden usar "!x" porque un string vacío no es un valor válido de negocio
    if (
      !name ||
      !description ||
      duration === undefined || duration === null ||
      price === undefined || price === null ||
      !category ||
      available === undefined
    ) {
      throw new Error('Faltan campos obligatorios para crear el servicio');
    }

    const services = await this.#readFile();
    const newService = {
      id: services.length > 0 ? services[services.length - 1].id + 1 : 1, // id generado acá, nunca recibido desde afuera
      name,
      description,
      duration,
      price,
      category,
      available,
    };

    services.push(newService);
    await this.#writeFile(services);
    return newService;
  }

  // Actualiza un servicio existente, sin permitir tocar el id
  async updateService(id, updatedData) {
    const services = await this.#readFile();
    const index = services.findIndex(s => s.id === Number(id));

    if (index === -1) return null; // no existe ese id

    delete updatedData.id; // defensa explícita: aunque llegue un id en el body, se ignora

    services[index] = { ...services[index], ...updatedData };
    await this.#writeFile(services);
    return services[index];
  }

  // Elimina un servicio por id
  async deleteService(id) {
    const services = await this.#readFile();
    const index = services.findIndex(s => s.id === Number(id));

    if (index === -1) return null;

    const deleted = services[index];
    services.splice(index, 1); // saca ese elemento del array
    await this.#writeFile(services);
    return deleted;
  }
}

export default ServiceManager;