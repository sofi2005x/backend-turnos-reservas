import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url'; 

//Este archivo es el DAO (Data Access Object) para los servicios. 
// Se encarga de leer y escribir en el archivo JSON que almacena los servicios. 
// No tiene lógica de negocio, solo operaciones de lectura y escritura.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'services.json');

async function readFile() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeFile(services) {
  await fs.writeFile(filePath, JSON.stringify(services, null, 2), 'utf-8');
}

// DAO: solo sabe leer y escribir el archivo. Ninguna regla de negocio acá.
export const servicesDao = {
  async getAll() {
    return await readFile();
  },

  async getById(id) {
    const services = await readFile();
    return services.find((s) => s.id === Number(id)) || null;
  },

  async create(serviceData) {
    const services = await readFile();
    const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    const newService = { id: newId, ...serviceData };

    services.push(newService);
    await writeFile(services);
    return newService;
  },

  async update(id, changes) {
    const services = await readFile();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;

    services[index] = { ...services[index], ...changes };
    await writeFile(services);
    return services[index];
  },

  async delete(id) {
    const services = await readFile();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;

    const [deleted] = services.splice(index, 1);
    await writeFile(services);
    return deleted;
  },
};