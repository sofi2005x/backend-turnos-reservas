import { Router } from 'express';
import ServiceManager from '../managers/ServiceManager.js';

const router = Router();

//Aca iniciamos el manager de servicios, que se encarga de manejar los datos de los servicios (leer, escribir, actualizar, eliminar) en el archivo services.json
const manager = new ServiceManager('./src/data/services.json');

// GET /api/services -> lista todos los servicios, con filtros opcionales por query params
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    let services = await manager.getServices();

    if (category) {
      services = services.filter((s) => s.category === category);
    }

    if (available !== undefined) {
      const isAvailable = available === 'true';
      services = services.filter((s) => s.available === isAvailable);
    }

    res.status(200).json({ status: 'success', payload: services });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener los servicios' });
  }
});

// GET /api/services/:sid -> devuelve un servicio puntual por id
router.get('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await manager.getServiceById(sid);

    if (!service) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener el servicio' });
  }
});

// POST /api/services -> crea un nuevo servicio; el id se genera dentro del manager
router.post('/', async (req, res) => {
  try {
    const newService = await manager.addService(req.body);
    res.status(201).json({ status: 'success', payload: newService });
  } catch (error) {
    // El manager tira Error() cuando faltan campos obligatorios -> lo traducimos a 400
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// PUT /api/services/:sid -> actualiza un servicio existente (el manager ya ignora el id del body)
router.put('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const updated = await manager.updateService(sid, req.body);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar el servicio' });
  }
});

// DELETE /api/services/:sid -> elimina un servicio existente
router.delete('/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const deleted = await manager.deleteService(sid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: deleted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el servicio' });
  }
});

export default router;