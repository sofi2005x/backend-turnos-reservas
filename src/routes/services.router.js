import { Router } from 'express'; //importamos Router de express para poder crear un router y manejar las rutas de servicios
import { serviceManager } from '../managers/index.js'; //importamos la instancia de ServiceManager que creamos en index.js para poder usar sus métodos

const router = Router(); //creo un router para manejar las rutas de servicios


//CRUD de servicios
//Aquí definimos las rutas para manejar los servicios, usando los métodos del ServiceManager para realizar las operaciones correspondientes
// GET /api/services -> lista todos los servicios, con filtros opcionales por query params
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    let services = await serviceManager.getServices();

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
    const service = await serviceManager.getServiceById(sid);

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
    const newService = await serviceManager.addService(req.body);
    res.status(201).json({ status: 'success', payload: newService });
  } catch (error) {
    // El manager tira Error() cuando faltan campos obligatorios -> lo traducimos a 400
    res.status(400).json({ status: 'error', message: error.message });
  }
});


// PUT /api/services/:sid -> actualiza un servicio existente (el manager ya ignora el id del body)
router.put('/:sid', async (req, res) => { //usamos sid para diferenciarlo del id de servicios , del id de bookings, etc. que puedan existir en la app
  try {
    const { sid } = req.params; //se obtiene el id del servicio desde la url (req.params.sid)
    const updated = await serviceManager.updateService(sid, req.body);

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
    const deleted = await serviceManager.deleteService(sid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: deleted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el servicio' });
  }
});

export default router;