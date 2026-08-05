import { servicesService } from '../services/services.service.js';
//Importamos el serviceService, que contiene la lógica de negocio para los servicios. El controller se encarga de recibir las peticiones HTTP, llamar al service y devolver la respuesta adecuada.


//Cada controller se encarga de la lógica de negocio y llama al manager para obtener los datos, mientras que el router solo define las rutas y las conecta con los controllers. Esto permite una separación clara de responsabilidades y facilita el mantenimiento del código.

// GET /api/services -> lista todos los servicios, con filtros opcionales por query params

export const getServices = async (req, res) => { // el controller se encarga de la lógica de negocio, y llama al manager para obtener los datos
  try {
    const { category, available } = req.query;
    let services = await servicesService.getServices();

    if (category) {
      services = services.filter((s) => s.category === category); // filtramos por categoría si se pasa como query param
    }

    if (available !== undefined) {
      const isAvailable = available === 'true';
      services = services.filter((s) => s.available === isAvailable);
    }

    res.status(200).json({ status: 'success', payload: services });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener los servicios' });
  }
};

// GET /api/services/:sid -> devuelve un servicio puntual por id

export const getServiceById = async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);

    if (!service) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener el servicio' });
  }
};

// POST /api/services -> crea un nuevo servicio; el id se genera dentro del manager
export const createService = async (req, res) => {
  try {
    const newService = await servicesService.createService(req.body);
    res.status(201).json({ status: 'success', payload: newService });
  } catch (error) {
    // El service tira Error() cuando faltan campos obligatorios -> lo traducimos a 400
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// PUT /api/services/:sid -> actualiza un servicio existente (el manager ya ignora el id del body)
export const updateService = async (req, res) => {
  try {
    const { sid } = req.params;
    const updated = await servicesService.updateService(sid, req.body);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar el servicio' });
  }
};

// DELETE /api/services/:sid -> elimina un servicio existente
export const deleteService = async (req, res) => {
  try {
    const { sid } = req.params;
    const deleted = await servicesService.deleteService(sid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: deleted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el servicio' });
  }
};